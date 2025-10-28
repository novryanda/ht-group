import { db } from "~/server/db";
import type {
  JournalEntryDTO,
  JournalLineDTO,
  JournalQueryParams,
} from "~/server/types/pt-pks/financial";

/**
 * Journal Service - Handle Journal Entry queries
 */
export class JournalService {
  /**
   * Get all journal entries with filters
   */
  async getJournalEntries(
    companyId: string,
    params: JournalQueryParams
  ): Promise<{ success: boolean; data?: { entries: JournalEntryDTO[]; total: number }; error?: string }> {
    try {
      const {
        startDate,
        endDate,
        sourceType,
        status,
        accountId,
        page = 1,
        limit = 50,
      } = params;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        companyId,
      };

      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (sourceType) {
        where.sourceType = sourceType;
      }

      if (status) {
        where.status = status;
      }

      if (accountId) {
        where.lines = {
          some: {
            accountId,
          },
        };
      }

      // Get total count
      const total = await db.journalEntry.count({ where });

      // Get entries with lines
      const entries = await db.journalEntry.findMany({
        where,
        include: {
          lines: {
            include: {
              account: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: limit,
      });

      // Map to DTO
      const entriesDTO: JournalEntryDTO[] = entries.map((entry) => {
        const lines: JournalLineDTO[] = entry.lines.map((line) => ({
          id: line.id,
          accountCode: line.account.code,
          accountName: line.account.name,
          debit: Number(line.debit),
          credit: Number(line.credit),
          description: line.description ?? undefined,
          costCenter: line.costCenter ?? undefined,
          dept: line.dept ?? undefined,
        }));

        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

        return {
          id: entry.id,
          entryNumber: entry.entryNumber,
          date: entry.date.toISOString(),
          sourceType: entry.sourceType,
          sourceId: entry.sourceId ?? undefined,
          memo: entry.memo ?? undefined,
          status: entry.status,
          postedAt: entry.postedAt?.toISOString(),
          lines,
          totalDebit,
          totalCredit,
        };
      });

      return {
        success: true,
        data: {
          entries: entriesDTO,
          total,
        },
      };
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch journal entries",
      };
    }
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(
    id: string
  ): Promise<{ success: boolean; data?: JournalEntryDTO; error?: string }> {
    try {
      const entry = await db.journalEntry.findUnique({
        where: { id },
        include: {
          lines: {
            include: {
              account: true,
            },
          },
        },
      });

      if (!entry) {
        return { success: false, error: "Journal entry not found" };
      }

      const lines: JournalLineDTO[] = entry.lines.map((line) => ({
        id: line.id,
        accountCode: line.account.code,
        accountName: line.account.name,
        debit: Number(line.debit),
        credit: Number(line.credit),
        description: line.description ?? undefined,
        costCenter: line.costCenter ?? undefined,
        dept: line.dept ?? undefined,
      }));

      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

      const entryDTO: JournalEntryDTO = {
        id: entry.id,
        entryNumber: entry.entryNumber,
        date: entry.date.toISOString(),
        sourceType: entry.sourceType,
        sourceId: entry.sourceId ?? undefined,
        memo: entry.memo ?? undefined,
        status: entry.status,
        postedAt: entry.postedAt?.toISOString(),
        lines,
        totalDebit,
        totalCredit,
      };

      return {
        success: true,
        data: entryDTO,
      };
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch journal entry",
      };
    }
  }
}
