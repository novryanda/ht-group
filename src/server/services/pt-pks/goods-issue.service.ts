import { db } from "~/server/db";
import type {
  CreateWarehouseOutboundDTO,
  UpdateWarehouseOutboundDTO,
  WarehouseTransactionQuery,
} from "~/server/types/pt-pks/warehouse-transaction";
import { Prisma } from "@prisma/client";

export class GoodsIssueService {
  /**
   * Get all goods issues dengan pagination dan filter
   */
  static async list(query: WarehouseTransactionQuery, companyId: string) {
    const {
      search,
      warehouseId,
      status,
      purpose,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.GoodsIssueWhereInput = {
      purpose: { not: "LOAN" }, // Exclude loans (handled separately)
    };

    if (search) {
      where.OR = [
        { docNumber: { contains: search, mode: "insensitive" } },
        { targetDept: { contains: search, mode: "insensitive" } },
        { pickerName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (status) {
      where.status = status;
    }

    if (purpose) {
      where.purpose = purpose;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      db.goodsIssue.findMany({
        where,
        include: {
          warehouse: true,
          lines: {
            include: {
              item: true,
              unit: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "desc" },
      }),
      db.goodsIssue.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get goods issue by ID
   */
  static async getById(id: string) {
    return db.goodsIssue.findUnique({
      where: { id },
      include: {
        warehouse: true,
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Create goods issue
   */
  static async create(data: CreateWarehouseOutboundDTO, createdById: string) {
    // Generate document number
    const docNumber = await this.generateDocNumber(data.purpose);

    // Validate stock availability
    await this.validateStock(data.warehouseId, data.lines);

    // Get item costs for GL entry
    const lineCosts = await this.getItemCosts(data.warehouseId, data.lines);

    // Create goods issue with lines
    const goodsIssue = await db.goodsIssue.create({
      data: {
        docNumber,
        date: new Date(data.date),
        warehouseId: data.warehouseId,
        purpose: data.purpose,
        targetDept: data.targetDept,
        pickerName: data.pickerName,
        note: data.note,
        expenseAccountId: data.expenseAccountId,
        costCenter: data.costCenter,
        status: "APPROVED",
        glStatus: "PENDING",
        createdById,
        lines: {
          create: data.lines.map((line, index) => ({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
            unitCost: lineCosts[index],
            note: line.note,
          })),
        },
      },
      include: {
        warehouse: true,
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    // Update stock ledger
    await this.updateStockLedger(goodsIssue);

    // Generate GL entry if expense account provided
    if (data.expenseAccountId) {
      await this.generateGLEntry(goodsIssue, createdById);
    }

    return goodsIssue;
  }

  /**
   * Update goods issue
   */
  static async update(
    id: string,
    data: UpdateWarehouseOutboundDTO,
    updatedById: string
  ) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Goods issue not found");
    }

    if (existing.glStatus === "POSTED") {
      throw new Error("Cannot update posted goods issue");
    }

    // If lines are provided, delete old lines and create new ones
    if (data.lines) {
      await db.goodsIssueLine.deleteMany({
        where: { issueId: id },
      });
    }

    const updated = await db.goodsIssue.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        warehouseId: data.warehouseId,
        purpose: data.purpose,
        targetDept: data.targetDept,
        note: data.note,
        status: data.status,
        lines: data.lines
          ? {
              create: data.lines.map((line) => ({
                itemId: line.itemId,
                unitId: line.unitId,
                qty: line.qty,
                note: line.note,
              })),
            }
          : undefined,
      },
      include: {
        warehouse: true,
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete goods issue
   */
  static async delete(id: string) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Goods issue not found");
    }

    if (existing.glStatus === "POSTED") {
      throw new Error("Cannot delete posted goods issue");
    }

    await db.goodsIssue.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Generate document number
   */
  private static async generateDocNumber(purpose: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `${purpose}/${year}/${month}/`;

    const lastDoc = await db.goodsIssue.findFirst({
      where: {
        docNumber: { startsWith: prefix },
        purpose,
      },
      orderBy: { docNumber: "desc" },
    });

    let sequence = 1;
    if (lastDoc) {
      const lastSeq = parseInt(lastDoc.docNumber.split("/").pop() || "0");
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, "0")}`;
  }

  /**
   * Validate stock availability
   */
  private static async validateStock(
    warehouseId: string,
    lines: { itemId: string; qty: number }[]
  ) {
    for (const line of lines) {
      const balance = await db.stockBalance.findFirst({
        where: {
          itemId: line.itemId,
          warehouseId,
        },
      });

      if (!balance || Number(balance.qtyOnHand) < line.qty) {
        const item = await db.item.findUnique({
          where: { id: line.itemId },
        });
        throw new Error(
          `Insufficient stock for item ${item?.name || line.itemId}. Available: ${balance?.qtyOnHand || 0}, Requested: ${line.qty}`
        );
      }
    }
  }

  /**
   * Get item costs for lines
   */
  private static async getItemCosts(
    warehouseId: string,
    lines: { itemId: string; qty: number }[]
  ): Promise<number[]> {
    const costs: number[] = [];

    for (const line of lines) {
      const balance = await db.stockBalance.findFirst({
        where: {
          itemId: line.itemId,
          warehouseId,
        },
      });

      costs.push(Number(balance?.avgCost || 0));
    }

    return costs;
  }

  /**
   * Update stock ledger for goods issue
   */
  private static async updateStockLedger(
    goodsIssue: Awaited<ReturnType<typeof this.getById>>
  ) {
    if (!goodsIssue) return;

    for (const line of goodsIssue.lines) {
      // Create stock ledger entry
      await db.stockLedger.create({
        data: {
          itemId: line.itemId,
          warehouseId: goodsIssue.warehouseId,
          referenceType: "OUT",
          referenceId: goodsIssue.id,
          qtyDelta: -Number(line.qty),
          unitCost: line.unitCost ? Number(line.unitCost) : undefined,
          note: `Goods issue: ${goodsIssue.docNumber}`,
          createdById: goodsIssue.createdById,
        },
      });

      // Update stock balance
      await db.stockBalance.updateMany({
        where: {
          itemId: line.itemId,
          warehouseId: goodsIssue.warehouseId,
        },
        data: {
          qtyOnHand: {
            decrement: Number(line.qty),
          },
        },
      });
    }
  }

  /**
   * Generate GL Entry for goods issue
   */
  private static async generateGLEntry(
    goodsIssue: Awaited<ReturnType<typeof this.getById>>,
    createdById: string
  ) {
    if (!goodsIssue || !goodsIssue.expenseAccountId) return;

    // Get inventory account from system account map
    const inventoryAccountMap = await db.systemAccountMap.findFirst({
      where: {
        key: "INVENTORY_GENERAL",
      },
      include: {
        account: true,
      },
    });

    if (!inventoryAccountMap) {
      throw new Error("Inventory account not configured");
    }

    // Calculate total value
    let totalValue = 0;
    for (const line of goodsIssue.lines) {
      totalValue += Number(line.qty) * Number(line.unitCost || 0);
    }

    // Generate journal entry number
    const entryNumber = await this.generateJournalEntryNumber();

    // Create journal entry
    const journalEntry = await db.journalEntry.create({
      data: {
        companyId: inventoryAccountMap.companyId,
        entryNumber,
        date: goodsIssue.date,
        sourceType: "GoodsIssue",
        sourceId: goodsIssue.id,
        memo: `Goods issue - ${goodsIssue.docNumber}`,
        status: "POSTED",
        postedAt: new Date(),
        postedById: createdById,
        createdById,
        lines: {
          create: [
            {
              accountId: goodsIssue.expenseAccountId,
              debit: totalValue,
              credit: 0,
              costCenter: goodsIssue.costCenter,
              dept: goodsIssue.targetDept,
              warehouseId: goodsIssue.warehouseId,
              description: `${goodsIssue.purpose} - ${goodsIssue.targetDept}`,
            },
            {
              accountId: inventoryAccountMap.accountId,
              debit: 0,
              credit: totalValue,
              warehouseId: goodsIssue.warehouseId,
              description: `Goods issue - ${goodsIssue.docNumber}`,
            },
          ],
        },
      },
    });

    // Update goods issue with GL reference
    await db.goodsIssue.update({
      where: { id: goodsIssue.id },
      data: {
        glStatus: "POSTED",
        glPostedAt: new Date(),
        glEntryId: journalEntry.id,
      },
    });

    return journalEntry;
  }

  /**
   * Generate journal entry number
   */
  private static async generateJournalEntryNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `JE/${year}/${month}/`;

    const lastEntry = await db.journalEntry.findFirst({
      where: {
        entryNumber: { startsWith: prefix },
      },
      orderBy: { entryNumber: "desc" },
    });

    let sequence = 1;
    if (lastEntry) {
      const lastSeq = parseInt(lastEntry.entryNumber.split("/").pop() || "0");
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, "0")}`;
  }
}
