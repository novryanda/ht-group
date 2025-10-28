import { db } from "~/server/db";
import type { BalanceSheetDTO, BalanceSheetAccountDTO } from "~/server/types/pt-pks/financial";

/**
 * Balance Sheet Service - Generate Neraca
 */
export class BalanceSheetService {
  /**
   * Generate balance sheet
   */
  async generateBalanceSheet(
    companyId: string,
    asOfDate: string
  ): Promise<{ success: boolean; data?: BalanceSheetDTO; error?: string }> {
    try {
      // Get company info
      const company = await db.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return { success: false, error: "Company not found" };
      }

      // Get all accounts
      const accounts = await db.account.findMany({
        where: {
          companyId,
          isPosting: true,
          status: "AKTIF",
          class: {
            in: ["ASSET", "LIABILITY", "EQUITY"],
          },
        },
        orderBy: {
          code: "asc",
        },
      });

      // Calculate balances for each account
      const accountBalances = await Promise.all(
        accounts.map(async (account) => {
          let balance = 0;

          // Get opening balance
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

          // Get transactions up to asOfDate
          const journalLines = await db.journalLine.findMany({
            where: {
              accountId: account.id,
              entry: {
                companyId,
                status: "POSTED",
                date: {
                  lte: new Date(asOfDate),
                },
              },
            },
          });

          for (const line of journalLines) {
            balance += Number(line.debit) - Number(line.credit);
          }

          return {
            ...account,
            balance,
          };
        })
      );

      // Group by class
      const assets = accountBalances.filter((a) => a.class === "ASSET");
      const liabilities = accountBalances.filter((a) => a.class === "LIABILITY");
      const equity = accountBalances.filter((a) => a.class === "EQUITY");

      // Map to DTO
      const mapAccounts = (accounts: typeof accountBalances): BalanceSheetAccountDTO[] => {
        return accounts.map((account) => ({
          code: account.code,
          name: account.name,
          amount: account.balance,
        }));
      };

      const assetAccounts = mapAccounts(assets);
      const liabilityAccounts = mapAccounts(liabilities);
      const equityAccounts = mapAccounts(equity);

      const totalAssets = assetAccounts.reduce((sum, a) => sum + a.amount, 0);
      const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.amount, 0);
      const totalEquity = equityAccounts.reduce((sum, a) => sum + a.amount, 0);

      const balanceSheet: BalanceSheetDTO = {
        companyName: company.name,
        reportDate: asOfDate,
        assets: {
          accounts: assetAccounts,
          total: totalAssets,
        },
        liabilities: {
          accounts: liabilityAccounts,
          total: totalLiabilities,
        },
        equity: {
          accounts: equityAccounts,
          total: totalEquity,
        },
        totalAssets,
        totalLiabilities,
        totalEquity,
      };

      return {
        success: true,
        data: balanceSheet,
      };
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate balance sheet",
      };
    }
  }
}
