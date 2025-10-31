// ============================================
// GENERAL LEDGER TYPES - PT PKS
// ============================================

export interface GLPostingResult {
  success: boolean;
  journalEntryId?: string;
  entryNumber?: string;
  error?: string;
}

export interface GLAccountMapping {
  inventoryAccountId: string;
  expenseAccountId?: string;
  inventoryOnLoanAccountId?: string;
  adjustmentLossAccountId?: string;
  productionConsumptionAccountId?: string;
}

export interface GLPostingContext {
  companyId: string;
  date: Date;
  sourceType: "GoodsIssue" | "GoodsReceipt" | "StockAdjustment" | "WeighbridgeApproval";
  sourceId: string;
  sourceNumber: string;
  memo?: string;
  createdById: string;
}

export interface GLLineItem {
  accountId: string;
  debit: number;
  credit: number;
  costCenter?: string;
  dept?: string;
  itemId?: string;
  warehouseId?: string;
  description?: string;
}

// System Account Keys for GL Posting
export const GL_SYSTEM_ACCOUNT_KEYS = {
  INVENTORY_GENERAL: "INVENTORY_GENERAL", // General inventory account
  INVENTORY_ON_LOAN: "INVENTORY_ON_LOAN", // Asset: Persediaan Dipinjamkan
  INVENTORY_ADJUSTMENT_LOSS: "INVENTORY_ADJUSTMENT_LOSS", // Expense: Kerugian/Scrap
  PRODUCTION_CONSUMPTION: "PRODUCTION_CONSUMPTION", // COGS: Beban Produksi/WIP
  MAINTENANCE_EXPENSE_DEFAULT: "MAINTENANCE_EXPENSE_DEFAULT", // Expense: Default maintenance
} as const;

export type SystemAccountKeyType = typeof GL_SYSTEM_ACCOUNT_KEYS[keyof typeof GL_SYSTEM_ACCOUNT_KEYS];
