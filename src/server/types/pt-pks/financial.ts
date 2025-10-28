/**
 * Financial Reporting Types for PT PKS
 */

export interface JournalEntryDTO {
  id: string;
  entryNumber: string;
  date: string;
  sourceType: string;
  sourceId?: string;
  memo?: string;
  status: string;
  postedAt?: string;
  lines: JournalLineDTO[];
  totalDebit: number;
  totalCredit: number;
}

export interface JournalLineDTO {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  costCenter?: string;
  dept?: string;
}

export interface LedgerAccountDTO {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountClass: string;
  normalSide: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
  transactions: LedgerTransactionDTO[];
}

export interface LedgerTransactionDTO {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheetDTO {
  companyName: string;
  reportDate: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface BalanceSheetSection {
  accounts: BalanceSheetAccountDTO[];
  total: number;
}

export interface BalanceSheetAccountDTO {
  code: string;
  name: string;
  amount: number;
  children?: BalanceSheetAccountDTO[];
}

export interface IncomeStatementDTO {
  companyName: string;
  periodStart: string;
  periodEnd: string;
  revenue: FinancialSection;
  cogs: FinancialSection;
  grossProfit: number;
  operatingExpenses: FinancialSection;
  operatingIncome: number;
  otherIncome: FinancialSection;
  otherExpenses: FinancialSection;
  netIncome: number;
}

export interface FinancialSection {
  accounts: FinancialAccountDTO[];
  total: number;
}

export interface FinancialAccountDTO {
  code: string;
  name: string;
  amount: number;
}

export interface JournalQueryParams {
  startDate?: string;
  endDate?: string;
  sourceType?: string;
  status?: string;
  accountId?: string;
  page?: number;
  limit?: number;
}

export interface LedgerQueryParams {
  accountId: string;
  startDate?: string;
  endDate?: string;
}
