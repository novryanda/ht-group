import { db } from "~/server/db";
import type {
  CreateWarehouseInboundDTO,
  CreateNewItemInboundDTO,
  WarehouseTransactionQuery,
} from "~/server/types/pt-pks/warehouse-transaction";
import { Prisma } from "@prisma/client";

export class GoodsReceiptService {
  /**
   * Get all goods receipts dengan pagination dan filter
   */
  static async list(query: WarehouseTransactionQuery, companyId: string) {
    const {
      search,
      warehouseId,
      sourceType,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.GoodsReceiptWhereInput = {};

    if (search) {
      where.OR = [
        { docNumber: { contains: search, mode: "insensitive" } },
        { sourceRef: { contains: search, mode: "insensitive" } },
      ];
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      db.goodsReceipt.findMany({
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
      db.goodsReceipt.count({ where }),
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
   * Get goods receipt by ID
   */
  static async getById(id: string) {
    return db.goodsReceipt.findUnique({
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
   * Create goods receipt
   */
  static async create(data: CreateWarehouseInboundDTO, createdById: string) {
    // Generate document number
    const docNumber = await this.generateDocNumber(data.sourceType);

    // Create goods receipt with lines
    const goodsReceipt = await db.goodsReceipt.create({
      data: {
        docNumber,
        date: new Date(data.date),
        warehouseId: data.warehouseId,
        sourceType: data.sourceType,
        sourceRef: data.sourceRef,
        loanIssueId: data.loanIssueId,
        note: data.note,
        glStatus: "PENDING",
        createdById,
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
            unitCost: line.unitCost,
            note: line.note,
            loanIssueLineId: line.loanIssueLineId,
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
    await this.updateStockLedger(goodsReceipt);

    // Generate GL entry
    await this.generateGLEntry(goodsReceipt, createdById);

    return goodsReceipt;
  }

  /**
   * Create new item with inbound
   */
  static async createWithNewItem(
    data: CreateNewItemInboundDTO,
    createdById: string
  ) {
    // Create new item
    const newItem = await db.item.create({
      data: {
        sku: data.newItem.sku,
        name: data.newItem.name,
        description: data.newItem.description,
        categoryId: data.newItem.categoryId,
        itemTypeId: data.newItem.itemTypeId,
        baseUnitId: data.newItem.baseUnitId,
        defaultIssueUnitId: data.newItem.defaultIssueUnitId,
        valuationMethod: data.newItem.valuationMethod || "AVERAGE",
        minStock: data.newItem.minStock,
        maxStock: data.newItem.maxStock,
        isActive: true,
      },
    });

    // Create goods receipt for new item
    const inboundData: CreateWarehouseInboundDTO = {
      date: data.date,
      warehouseId: data.warehouseId,
      sourceType: "NEW_ITEM",
      note: data.note,
      lines: [
        {
          itemId: newItem.id,
          unitId: data.newItem.baseUnitId,
          qty: data.qty,
          unitCost: data.unitCost,
        },
      ],
    };

    const goodsReceipt = await this.create(inboundData, createdById);

    return { newItem, goodsReceipt };
  }

  /**
   * Delete goods receipt
   */
  static async delete(id: string) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Goods receipt not found");
    }

    if (existing.glStatus === "POSTED") {
      throw new Error("Cannot delete posted goods receipt");
    }

    await db.goodsReceipt.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Generate document number
   */
  private static async generateDocNumber(sourceType: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `GR-${sourceType}/${year}/${month}/`;

    const lastDoc = await db.goodsReceipt.findFirst({
      where: {
        docNumber: { startsWith: prefix },
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
   * Update stock ledger for goods receipt
   */
  private static async updateStockLedger(
    goodsReceipt: Awaited<ReturnType<typeof this.getById>>
  ) {
    if (!goodsReceipt) return;

    for (const line of goodsReceipt.lines) {
      // Create stock ledger entry
      await db.stockLedger.create({
        data: {
          itemId: line.itemId,
          warehouseId: goodsReceipt.warehouseId,
          referenceType: "IN",
          referenceId: goodsReceipt.id,
          qtyDelta: Number(line.qty),
          unitCost: line.unitCost ? Number(line.unitCost) : undefined,
          note: `Goods receipt: ${goodsReceipt.docNumber}`,
          createdById: goodsReceipt.createdById,
        },
      });

      // Update or create stock balance
      const existingBalance = await db.stockBalance.findFirst({
        where: {
          itemId: line.itemId,
          warehouseId: goodsReceipt.warehouseId,
        },
      });

      if (existingBalance) {
        // Update existing balance with new average cost
        const newQty =
          Number(existingBalance.qtyOnHand) + Number(line.qty);
        const oldValue =
          Number(existingBalance.qtyOnHand) * Number(existingBalance.avgCost);
        const newValue = Number(line.qty) * Number(line.unitCost || 0);
        const newAvgCost = newQty > 0 ? (oldValue + newValue) / newQty : 0;

        await db.stockBalance.update({
          where: { id: existingBalance.id },
          data: {
            qtyOnHand: newQty,
            avgCost: newAvgCost,
          },
        });
      } else {
        // Create new balance
        await db.stockBalance.create({
          data: {
            itemId: line.itemId,
            warehouseId: goodsReceipt.warehouseId,
            qtyOnHand: Number(line.qty),
            avgCost: Number(line.unitCost || 0),
          },
        });
      }
    }
  }

  /**
   * Generate GL Entry for goods receipt
   */
  private static async generateGLEntry(
    goodsReceipt: Awaited<ReturnType<typeof this.getById>>,
    createdById: string
  ) {
    if (!goodsReceipt) return;

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
    for (const line of goodsReceipt.lines) {
      totalValue += Number(line.qty) * Number(line.unitCost || 0);
    }

    if (totalValue === 0) {
      // Skip GL entry if no cost
      return;
    }

    // Determine credit account based on source type
    let creditAccountKey = "CASH_DEFAULT";
    if (goodsReceipt.sourceType === "PURCHASE") {
      creditAccountKey = "AP_SUPPLIER_TBS"; // Or generic AP
    }

    const creditAccountMap = await db.systemAccountMap.findFirst({
      where: {
        key: creditAccountKey as any,
      },
    });

    if (!creditAccountMap) {
      throw new Error(`${creditAccountKey} account not configured`);
    }

    // Generate journal entry number
    const entryNumber = await this.generateJournalEntryNumber();

    // Create journal entry
    const journalEntry = await db.journalEntry.create({
      data: {
        companyId: inventoryAccountMap.companyId,
        entryNumber,
        date: goodsReceipt.date,
        sourceType: "GoodsReceipt",
        sourceId: goodsReceipt.id,
        memo: `Goods receipt - ${goodsReceipt.docNumber}`,
        status: "POSTED",
        postedAt: new Date(),
        postedById: createdById,
        createdById,
        lines: {
          create: [
            {
              accountId: inventoryAccountMap.accountId,
              debit: totalValue,
              credit: 0,
              warehouseId: goodsReceipt.warehouseId,
              description: `Goods receipt - ${goodsReceipt.sourceType}`,
            },
            {
              accountId: creditAccountMap.accountId,
              debit: 0,
              credit: totalValue,
              description: `Goods receipt - ${goodsReceipt.docNumber}`,
            },
          ],
        },
      },
    });

    // Update goods receipt with GL reference
    await db.goodsReceipt.update({
      where: { id: goodsReceipt.id },
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
