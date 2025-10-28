import { GLRepository } from "~/server/repositories/pt-pks/gl.repo";
import type {
  GLPostingResult,
  GLPostingContext,
  GLLineItem,
} from "~/server/types/pt-pks/gl";

/**
 * GL Service - Handle General Ledger posting from warehouse transactions
 */
export class GLService {
  private glRepo: GLRepository;

  constructor() {
    this.glRepo = new GLRepository();
  }

  /**
   * Post journal entry from warehouse transaction
   */
  async postJournalEntry(
    context: GLPostingContext,
    lines: GLLineItem[],
  ): Promise<GLPostingResult> {
    try {
      // Validate: debit must equal credit
      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return {
          success: false,
          error: `Debit (${totalDebit}) and Credit (${totalCredit}) must be equal`,
        };
      }

      // Generate entry number
      const entryNumber = await this.glRepo.generateEntryNumber(
        context.companyId,
        context.date,
      );

      // Create journal entry
      const entry = await this.glRepo.createJournalEntry({
        companyId: context.companyId,
        entryNumber,
        date: context.date,
        sourceType: context.sourceType,
        sourceId: context.sourceId,
        memo: context.memo ?? `Auto-posted from ${context.sourceType} ${context.sourceNumber}`,
        status: "POSTED",
        postedAt: new Date(),
        postedById: context.createdById,
        createdById: context.createdById,
        lines: lines.map((line) => ({
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          costCenter: line.costCenter,
          dept: line.dept,
          itemId: line.itemId,
          warehouseId: line.warehouseId,
          description: line.description,
        })),
      });

      return {
        success: true,
        journalEntryId: entry.id,
        entryNumber: entry.entryNumber,
      };
    } catch (error) {
      console.error("❌ GL posting error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get system account ID by key
   */
  async getSystemAccountId(
    companyId: string,
    key: string,
  ): Promise<string | null> {
    const account = await this.glRepo.getSystemAccount(companyId, key);
    return account?.id ?? null;
  }

  /**
   * Build GL lines for Goods Issue based on purpose
   */
  async buildGoodsIssueGLLines(params: {
    companyId: string;
    purpose: string;
    totalValue: number;
    expenseAccountId?: string;
    costCenter?: string;
    dept?: string;
    itemId?: string;
    warehouseId?: string;
  }): Promise<GLLineItem[]> {
    const {
      companyId,
      purpose,
      totalValue,
      expenseAccountId,
      costCenter,
      dept,
      itemId,
      warehouseId,
    } = params;

    // Get inventory account (credit side)
    const inventoryAccountId = await this.getSystemAccountId(
      companyId,
      "INVENTORY_GENERAL",
    );
    if (!inventoryAccountId) {
      throw new Error("Inventory account not configured in system account map");
    }

    let debitAccountId: string | null = null;
    let description = "";

    // Determine debit account based on purpose
    switch (purpose) {
      case "ISSUE":
        // Dr Biaya, Cr Persediaan
        debitAccountId =
          expenseAccountId ??
          (await this.getSystemAccountId(companyId, "MAINTENANCE_EXPENSE_DEFAULT"));
        description = "Pemakaian barang (Issue)";
        break;

      case "PROD":
        // Dr Beban Produksi/WIP, Cr Persediaan
        debitAccountId = await this.getSystemAccountId(
          companyId,
          "PRODUCTION_CONSUMPTION",
        );
        description = "Konsumsi barang untuk produksi";
        break;

      case "LOAN":
        // Dr Persediaan Dipinjamkan, Cr Persediaan
        debitAccountId = await this.getSystemAccountId(
          companyId,
          "INVENTORY_ON_LOAN",
        );
        description = "Peminjaman barang";
        break;

      case "SCRAP":
        // Dr Kerugian/Scrap, Cr Persediaan
        debitAccountId = await this.getSystemAccountId(
          companyId,
          "INVENTORY_ADJUSTMENT_LOSS",
        );
        description = "Barang rusak/hilang (Scrap)";
        break;

      default:
        throw new Error(`Unknown purpose: ${purpose}`);
    }

    if (!debitAccountId) {
      throw new Error(
        `Account for purpose ${purpose} not configured in system account map`,
      );
    }

    // Build GL lines
    const lines: GLLineItem[] = [
      {
        accountId: debitAccountId,
        debit: totalValue,
        credit: 0,
        costCenter,
        dept,
        itemId,
        warehouseId,
        description,
      },
      {
        accountId: inventoryAccountId,
        debit: 0,
        credit: totalValue,
        costCenter,
        dept,
        itemId,
        warehouseId,
        description,
      },
    ];

    return lines;
  }

  /**
   * Build GL lines for Loan Return
   */
  async buildLoanReturnGLLines(params: {
    companyId: string;
    returnValue: number; // Nilai barang yang dikembalikan
    lossValue: number; // Nilai barang yang hilang/tidak kembali
    warehouseId?: string;
  }): Promise<GLLineItem[]> {
    const { companyId, returnValue, lossValue, warehouseId } = params;

    const lines: GLLineItem[] = [];

    // Get accounts
    const inventoryAccountId = await this.getSystemAccountId(
      companyId,
      "INVENTORY_GENERAL",
    );
    const loanAccountId = await this.getSystemAccountId(
      companyId,
      "INVENTORY_ON_LOAN",
    );
    const lossAccountId = await this.getSystemAccountId(
      companyId,
      "INVENTORY_ADJUSTMENT_LOSS",
    );

    if (!inventoryAccountId || !loanAccountId) {
      throw new Error("Required accounts not configured in system account map");
    }

    // Return portion: Dr Persediaan, Cr Persediaan Dipinjamkan
    if (returnValue > 0) {
      lines.push({
        accountId: inventoryAccountId,
        debit: returnValue,
        credit: 0,
        warehouseId,
        description: "Pengembalian barang pinjaman",
      });
      lines.push({
        accountId: loanAccountId,
        debit: 0,
        credit: returnValue,
        warehouseId,
        description: "Pengembalian barang pinjaman",
      });
    }

    // Loss portion: Dr Kerugian, Cr Persediaan Dipinjamkan
    if (lossValue > 0) {
      if (!lossAccountId) {
        throw new Error("Loss account not configured in system account map");
      }
      lines.push({
        accountId: lossAccountId,
        debit: lossValue,
        credit: 0,
        warehouseId,
        description: "Kerugian barang pinjaman tidak kembali",
      });
      lines.push({
        accountId: loanAccountId,
        debit: 0,
        credit: lossValue,
        warehouseId,
        description: "Kerugian barang pinjaman tidak kembali",
      });
    }

    return lines;
  }

  /**
   * Void journal entry by source
   */
  async voidJournalEntryBySource(
    sourceType: string,
    sourceId: string,
  ): Promise<void> {
    const entries = await this.glRepo.getJournalEntriesBySource(
      sourceType,
      sourceId,
    );
    for (const entry of entries) {
      if (entry.status === "POSTED") {
        await this.glRepo.voidJournalEntry(entry.id);
      }
    }
  }
}
