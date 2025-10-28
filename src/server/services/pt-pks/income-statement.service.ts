import { db } from "~/server/db";
import type { IncomeStatementDTO, FinancialAccountDTO } from "~/server/types/pt-pks/financial";

/**
 * Income Statement Service - Generate Laporan Laba Rugi
 */
export class IncomeStatementService {
  /**
   * Generate income statement
   */
  async generateIncomeStatement(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; data?: IncomeStatementDTO; error?: string }> {
    try {
      // Get company info
      const company = await db.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return { success: false, error: "Company not found" };
      }

      // Get all relevant accounts
      const accounts = await db.account.findMany({
        where: {
          companyId,
          isPosting: true,
          status: "AKTIF",
          class: {
            in: ["REVENUE", "COGS", "EXPENSE", "OTHER_INCOME", "OTHER_EXPENSE"],
          },
        },
        orderBy: {
          code: "asc",
        },
      });

      // Calculate balances for each account in the period
      const accountBalances = await Promise.all(
        accounts.map(async (account) => {
          const journalLines = await db.journalLine.findMany({
            where: {
              accountId: account.id,
              entry: {
                companyId,
                status: "POSTED",
                date: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
            },
          });

          let balance = 0;
          for (const line of journalLines) {
            balance += Number(line.credit) - Number(line.debit);
          }

          return {
            ...account,
            balance,
          };
        })
      );

      // Group by class
      const revenue = accountBalances.filter((a) => a.class === "REVENUE");
      const cogs = accountBalances.filter((a) => a.class === "COGS");
      const expenses = accountBalances.filter((a) => a.class === "EXPENSE");
      const otherIncome = accountBalances.filter((a) => a.class === "OTHER_INCOME");
      const otherExpense = accountBalances.filter((a) => a.class === "OTHER_EXPENSE");

      // Map to DTO
      const mapAccounts = (accounts: typeof accountBalances): FinancialAccountDTO[] => {
        return accounts.map((account) => ({
          code: account.code,
          name: account.name,
          amount: account.balance,
        }));
      };

      const revenueAccounts = mapAccounts(revenue);
      const cogsAccounts = mapAccounts(cogs);
      const expenseAccounts = mapAccounts(expenses);
      const otherIncomeAccounts = mapAccounts(otherIncome);
      const otherExpenseAccounts = mapAccounts(otherExpense);

      const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.amount, 0);
      const totalCogs = cogsAccounts.reduce((sum, a) => sum + a.amount, 0);
      const grossProfit = totalRevenue - totalCogs;

      const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.amount, 0);
      const operatingIncome = grossProfit - totalExpenses;

      const totalOtherIncome = otherIncomeAccounts.reduce((sum, a) => sum + a.amount, 0);
      const totalOtherExpense = otherExpenseAccounts.reduce((sum, a) => sum + a.amount, 0);
      const netIncome = operatingIncome + totalOtherIncome - totalOtherExpense;

      const incomeStatement: IncomeStatementDTO = {
        companyName: company.name,
        periodStart: startDate,
        periodEnd: endDate,
        revenue: {
          accounts: revenueAccounts,
          total: totalRevenue,
        },
        cogs: {
          accounts: cogsAccounts,
          total: totalCogs,
        },
        grossProfit,
        operatingExpenses: {
          accounts: expenseAccounts,
          total: totalExpenses,
        },
        operatingIncome,
        otherIncome: {
          accounts: otherIncomeAccounts,
          total: totalOtherIncome,
        },
        otherExpenses: {
          accounts: otherExpenseAccounts,
          total: totalOtherExpense,
        },
        netIncome,
      };

      return {
        success: true,
        data: incomeStatement,
      };
    } catch (error) {
      console.error("Error generating income statement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate income statement",
      };
    }
  }
}
