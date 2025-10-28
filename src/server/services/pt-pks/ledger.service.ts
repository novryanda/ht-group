import { db } from "~/server/db";
import type {
  LedgerAccountDTO,
  LedgerTransactionDTO,
  LedgerQueryParams,
} from "~/server/types/pt-pks/financial";

/**
 * Ledger Service - Handle General Ledger (Buku Besar) queries
 */
export class LedgerService {
  /**
   * Get ledger for specific account
   */
  async getAccountLedger(
    companyId: string,
    params: LedgerQueryParams
  ): Promise<{ success: boolean; data?: LedgerAccountDTO; error?: string }> {
    try {
      const { accountId, startDate, endDate } = params;

      // Get account info
      const account = await db.account.findFirst({
        where: {
          id: accountId,
          companyId,
        },
      });

      if (!account) {
        return { success: false, error: "Account not found" };
      }

      // Get opening balance
      let openingBalance = 0;
      if (startDate) {
        const openingBalanceRecord = await db.openingBalance.findFirst({
          where: {
            accountId,
            companyId,
            period: {
              startDate: {
                lte: new Date(startDate),
              },
            },
          },
          orderBy: {
            period: {
              startDate: "desc",
            },
          },
        });

        if (openingBalanceRecord) {
          openingBalance =
            Number(openingBalanceRecord.debit) - Number(openingBalanceRecord.credit);
        }

        // Add transactions before start date
        const priorTransactions = await db.journalLine.findMany({
          where: {
            accountId,
            entry: {
              companyId,
              date: {
                lt: new Date(startDate),
              },
              status: "POSTED",
            },
          },
        });

        for (const line of priorTransactions) {
          openingBalance += Number(line.debit) - Number(line.credit);
        }
      }

      // Build where clause for transactions
      const transactionWhere: any = {
        accountId,
        entry: {
          companyId,
          status: "POSTED",
        },
      };

      if (startDate && endDate) {
        transactionWhere.entry.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      } else if (startDate) {
        transactionWhere.entry.date = {
          gte: new Date(startDate),
        };
      } else if (endDate) {
        transactionWhere.entry.date = {
          lte: new Date(endDate),
        };
      }

      // Get transactions
      const journalLines = await db.journalLine.findMany({
        where: transactionWhere,
        include: {
          entry: true,
        },
        orderBy: {
          entry: {
            date: "asc",
          },
        },
      });

      // Calculate running balance and map to DTO
      let runningBalance = openingBalance;
      const transactions: LedgerTransactionDTO[] = journalLines.map((line) => {
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        runningBalance += debit - credit;

        return {
          date: line.entry.date.toISOString(),
          entryNumber: line.entry.entryNumber,
          description: line.description || line.entry.memo || "",
          debit,
          credit,
          balance: runningBalance,
        };
      });

      // Calculate totals
      const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
      const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
      const endingBalance = openingBalance + totalDebit - totalCredit;

      const ledgerDTO: LedgerAccountDTO = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountClass: account.class,
        normalSide: account.normalSide,
        openingBalance,
        totalDebit,
        totalCredit,
        endingBalance,
        transactions,
      };

      return {
        success: true,
        data: ledgerDTO,
      };
    } catch (error) {
      console.error("Error fetching ledger:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch ledger",
      };
    }
  }

  /**
   * Get all accounts with balances
   */
  async getAllAccountBalances(
    companyId: string,
    asOfDate?: string
  ): Promise<{
    success: boolean;
    data?: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      accountClass: string;
      balance: number;
    }>;
    error?: string;
  }> {
    try {
      const accounts = await db.account.findMany({
        where: {
          companyId,
          isPosting: true,
          status: "AKTIF",
        },
        orderBy: {
          code: "asc",
        },
      });

      const balances = await Promise.all(
        accounts.map(async (account) => {
          // Get opening balance
          let balance = 0;

          const openingBalanceRecord = await db.openingBalance.findFirst({
            where: {
              accountId: account.id,
              companyId,
            },
            orderBy: {
              period: {
                startDate: "desc",
              },
            },
          });

          if (openingBalanceRecord) {
            balance = Number(openingBalanceRecord.debit) - Number(openingBalanceRecord.credit);
          }

          // Get transactions
          const transactionWhere: any = {
            accountId: account.id,
            entry: {
              companyId,
              status: "POSTED",
            },
          };

          if (asOfDate) {
            transactionWhere.entry.date = {
              lte: new Date(asOfDate),
            };
          }

          const journalLines = await db.journalLine.findMany({
            where: transactionWhere,
          });

          for (const line of journalLines) {
            balance += Number(line.debit) - Number(line.credit);
          }

          return {
            accountId: account.id,
            accountCode: account.code,
            accountName: account.name,
            accountClass: account.class,
            balance,
          };
        })
      );

      return {
        success: true,
        data: balances,
      };
    } catch (error) {
      console.error("Error fetching account balances:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch account balances",
      };
    }
  }
}
