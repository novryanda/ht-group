// Finance module type definitions

export interface AccountsReceivableItem extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  jobNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: "PAID" | "PARTIAL" | "OUTSTANDING" | "OVERDUE" | "CANCELLED";
  daysOverdue?: number;
  paymentDate?: string;
}

export interface AccountsPayableItem extends Record<string, unknown> {
  id: string;
  billNumber: string;
  poNumber?: string;
  vendorName: string;
  billDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: "PAID" | "PARTIAL" | "OUTSTANDING" | "OVERDUE" | "CANCELLED";
  category: "MATERIALS" | "EQUIPMENT" | "UTILITIES" | "OFFICE" | "SERVICES";
  daysOverdue?: number;
  paymentDate?: string;
}

export interface GeneralLedgerItem extends Record<string, unknown> {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  entryType: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
}
