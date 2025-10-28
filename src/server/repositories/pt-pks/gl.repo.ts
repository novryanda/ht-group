import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

/**
 * GL Repository - Handle database operations for General Ledger
 */
export class GLRepository {
  /**
   * Generate next journal entry number
   * Format: JV/{YYYY}/{MM}/{seq}
   */
  async generateEntryNumber(companyId: string, date: Date): Promise<string> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const prefix = `JV/${year}/${month}/`;

    const lastEntry = await db.journalEntry.findFirst({
      where: {
        companyId,
        entryNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        entryNumber: "desc",
      },
    });

    let sequence = 1;
    if (lastEntry) {
      const lastSeq = lastEntry.entryNumber.split("/").pop();
      sequence = parseInt(lastSeq || "0", 10) + 1;
    }

    return `${prefix}${String(sequence).padStart(4, "0")}`;
  }

  /**
   * Create journal entry with lines
   */
  async createJournalEntry(data: {
    companyId: string;
    entryNumber: string;
    date: Date;
    sourceType: string;
    sourceId?: string;
    memo?: string;
    status: string;
    postedAt?: Date;
    postedById?: string;
    createdById: string;
    lines: Array<{
      accountId: string;
      debit: number;
      credit: number;
      costCenter?: string;
      dept?: string;
      itemId?: string;
      warehouseId?: string;
      description?: string;
    }>;
  }) {
    return await db.journalEntry.create({
      data: {
        companyId: data.companyId,
        entryNumber: data.entryNumber,
        date: data.date,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        memo: data.memo,
        status: data.status,
        postedAt: data.postedAt,
        postedById: data.postedById,
        createdById: data.createdById,
        lines: {
          create: data.lines,
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(id: string) {
    return await db.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
        company: true,
      },
    });
  }

  /**
   * Get journal entries by source
   */
  async getJournalEntriesBySource(sourceType: string, sourceId: string) {
    return await db.journalEntry.findMany({
      where: {
        sourceType,
        sourceId,
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get system account by key
   */
  async getSystemAccount(companyId: string, key: string) {
    const mapping = await db.systemAccountMap.findUnique({
      where: {
        companyId_key: {
          companyId,
          key: key as any,
        },
      },
      include: {
        account: true,
      },
    });

    return mapping?.account;
  }

  /**
   * Void journal entry
   */
  async voidJournalEntry(id: string) {
    return await db.journalEntry.update({
      where: { id },
      data: {
        status: "VOID",
        updatedAt: new Date(),
      },
    });
  }

  /**
   * List journal entries with filters
   */
  async listJournalEntries(params: {
    companyId: string;
    startDate?: Date;
    endDate?: Date;
    sourceType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      companyId,
      startDate,
      endDate,
      sourceType,
      status,
      page = 1,
      limit = 50,
    } = params;

    const where: Prisma.JournalEntryWhereInput = {
      companyId,
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }),
      ...(sourceType && { sourceType }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      db.journalEntry.findMany({
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.journalEntry.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
