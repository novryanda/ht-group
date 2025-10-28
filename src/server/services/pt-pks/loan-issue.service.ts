import { db } from "~/server/db";
import type {
  CreateWarehouseOutboundDTO,
  LoanReturnDTO,
  WarehouseTransactionQuery,
} from "~/server/types/pt-pks/warehouse-transaction";
import { Prisma } from "@prisma/client";

export class LoanIssueService {
  /**
   * Get all loan issues dengan pagination dan filter
   */
  static async list(query: WarehouseTransactionQuery, companyId: string) {
    const {
      search,
      warehouseId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.GoodsIssueWhereInput = {
      purpose: "LOAN",
    };

    if (search) {
      where.OR = [
        { docNumber: { contains: search, mode: "insensitive" } },
        { loanReceiver: { contains: search, mode: "insensitive" } },
        { targetDept: { contains: search, mode: "insensitive" } },
      ];
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (status) {
      where.status = status;
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
   * Get loan issue by ID
   */
  static async getById(id: string) {
    return db.goodsIssue.findUnique({
      where: { id, purpose: "LOAN" },
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
   * Get active loans (belum dikembalikan semua)
   */
  static async getActiveLoans(warehouseId?: string) {
    const where: Prisma.GoodsIssueWhereInput = {
      purpose: "LOAN",
      isLoanFullyReturned: false,
      status: { in: ["APPROVED", "PARTIAL_RETURN"] },
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return db.goodsIssue.findMany({
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
      orderBy: { expectedReturnAt: "asc" },
    });
  }

  /**
   * Create loan issue
   */
  static async create(data: CreateWarehouseOutboundDTO, createdById: string) {
    // Generate document number
    const docNumber = await this.generateDocNumber();

    // Validate stock availability
    await this.validateStock(data.warehouseId, data.lines);

    // Create loan issue with lines
    const loanIssue = await db.goodsIssue.create({
      data: {
        docNumber,
        date: new Date(data.date),
        warehouseId: data.warehouseId,
        purpose: "LOAN",
        targetDept: data.targetDept,
        pickerName: data.pickerName,
        loanReceiver: data.loanReceiver,
        expectedReturnAt: data.expectedReturnAt
          ? new Date(data.expectedReturnAt)
          : undefined,
        loanNotes: data.loanNotes,
        note: data.note,
        expenseAccountId: data.expenseAccountId,
        costCenter: data.costCenter,
        status: "APPROVED",
        glStatus: "PENDING",
        createdById,
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
            note: line.note,
            qtyReturned: 0,
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
    await this.updateStockLedger(loanIssue);

    // Generate GL entry if expense account provided
    if (data.expenseAccountId) {
      await this.generateGLEntry(loanIssue, createdById);
    }

    return loanIssue;
  }

  /**
   * Process loan return
   */
  static async processReturn(data: LoanReturnDTO, createdById: string) {
    const loanIssue = await this.getById(data.loanIssueId);
    if (!loanIssue) {
      throw new Error("Loan issue not found");
    }

    // Create goods receipt for return
    const receiptDocNumber = await this.generateReceiptDocNumber();

    const goodsReceipt = await db.goodsReceipt.create({
      data: {
        docNumber: receiptDocNumber,
        date: new Date(data.date),
        warehouseId: data.warehouseId,
        sourceType: "LOAN_RETURN",
        sourceRef: loanIssue.docNumber,
        loanIssueId: loanIssue.id,
        note: data.note,
        glStatus: "PENDING",
        createdById,
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            unitId: line.itemId, // Will be fetched from issue line
            qty: line.qtyReturned,
            note: line.note,
            loanIssueLineId: line.loanIssueLineId,
          })),
        },
      },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    // Update loan issue lines qtyReturned
    for (const returnLine of data.lines) {
      const issueLine = loanIssue.lines.find(
        (l: any) => l.id === returnLine.loanIssueLineId
      );
      if (issueLine) {
        await db.goodsIssueLine.update({
          where: { id: issueLine.id },
          data: {
            qtyReturned: {
              increment: returnLine.qtyReturned,
            },
          },
        });
      }
    }

    // Check if loan fully returned
    const updatedLines = await db.goodsIssueLine.findMany({
      where: { issueId: loanIssue.id },
    });

    const isFullyReturned = updatedLines.every(
      (line: any) => Number(line.qtyReturned) >= Number(line.qty)
    );

    // Update loan status
    await db.goodsIssue.update({
      where: { id: loanIssue.id },
      data: {
        status: isFullyReturned ? "RETURNED" : "PARTIAL_RETURN",
        isLoanFullyReturned: isFullyReturned,
      },
    });

    // Update stock ledger for return
    await this.updateStockLedgerForReturn(goodsReceipt);

    return goodsReceipt;
  }

  /**
   * Generate document number
   */
  private static async generateDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `LOAN/${year}/${month}/`;

    const lastDoc = await db.goodsIssue.findFirst({
      where: {
        docNumber: { startsWith: prefix },
        purpose: "LOAN",
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
   * Generate receipt document number for loan return
   */
  private static async generateReceiptDocNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `RET-LOAN/${year}/${month}/`;

    const lastDoc = await db.goodsReceipt.findFirst({
      where: {
        docNumber: { startsWith: prefix },
        sourceType: "LOAN_RETURN",
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
   * Update stock ledger for loan issue
   */
  private static async updateStockLedger(
    loanIssue: Awaited<ReturnType<typeof this.getById>>
  ) {
    if (!loanIssue) return;

    for (const line of loanIssue.lines) {
      // Create stock ledger entry
      await db.stockLedger.create({
        data: {
          itemId: line.itemId,
          warehouseId: loanIssue.warehouseId,
          referenceType: "OUT",
          referenceId: loanIssue.id,
          qtyDelta: -Number(line.qty),
          note: `Loan issue: ${loanIssue.docNumber}`,
          createdById: loanIssue.createdById,
        },
      });

      // Update stock balance
      await db.stockBalance.updateMany({
        where: {
          itemId: line.itemId,
          warehouseId: loanIssue.warehouseId,
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
   * Update stock ledger for loan return
   */
  private static async updateStockLedgerForReturn(
    goodsReceipt: any
  ) {
    for (const line of goodsReceipt.lines) {
      // Create stock ledger entry
      await db.stockLedger.create({
        data: {
          itemId: line.itemId,
          warehouseId: goodsReceipt.warehouseId,
          referenceType: "IN",
          referenceId: goodsReceipt.id,
          qtyDelta: Number(line.qty),
          note: `Loan return: ${goodsReceipt.docNumber}`,
          createdById: goodsReceipt.createdById,
        },
      });

      // Update stock balance
      await db.stockBalance.updateMany({
        where: {
          itemId: line.itemId,
          warehouseId: goodsReceipt.warehouseId,
        },
        data: {
          qtyOnHand: {
            increment: Number(line.qty),
          },
        },
      });
    }
  }

  /**
   * Generate GL Entry for loan issue
   */
  private static async generateGLEntry(
    loanIssue: Awaited<ReturnType<typeof this.getById>>,
    createdById: string
  ) {
    if (!loanIssue || !loanIssue.expenseAccountId) return;

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
    for (const line of loanIssue.lines) {
      const balance = await db.stockBalance.findFirst({
        where: {
          itemId: line.itemId,
          warehouseId: loanIssue.warehouseId,
        },
      });
      totalValue += Number(line.qty) * Number(balance?.avgCost || 0);
    }

    // Generate journal entry number
    const entryNumber = await this.generateJournalEntryNumber();

    // Create journal entry
    const journalEntry = await db.journalEntry.create({
      data: {
        companyId: inventoryAccountMap.companyId,
        entryNumber,
        date: loanIssue.date,
        sourceType: "GoodsIssue",
        sourceId: loanIssue.id,
        memo: `Loan issue - ${loanIssue.docNumber}`,
        status: "POSTED",
        postedAt: new Date(),
        postedById: createdById,
        createdById,
        lines: {
          create: [
            {
              accountId: loanIssue.expenseAccountId,
              debit: totalValue,
              credit: 0,
              costCenter: loanIssue.costCenter,
              dept: loanIssue.targetDept,
              warehouseId: loanIssue.warehouseId,
              description: `Loan to ${loanIssue.loanReceiver}`,
            },
            {
              accountId: inventoryAccountMap.accountId,
              debit: 0,
              credit: totalValue,
              warehouseId: loanIssue.warehouseId,
              description: `Loan issue - ${loanIssue.docNumber}`,
            },
          ],
        },
      },
    });

    // Update loan issue with GL reference
    await db.goodsIssue.update({
      where: { id: loanIssue.id },
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
