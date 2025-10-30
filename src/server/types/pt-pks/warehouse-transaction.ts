// ============================================
// WAREHOUSE TRANSACTION TYPES - PT PKS
// ============================================

// Barang Keluar (Outbound) Types

export type WarehouseOutboundPurpose = "ISSUE" | "PROD" | "SCRAP" | "LOAN" | "TRANSFER";
export type WarehouseOutboundStatus = "DRAFT" | "APPROVED" | "POSTED" | "CANCELLED";

export interface WarehouseOutboundLineDTO {
  id: string;
  outboundId: string;
  itemId: string;
  itemName?: string;
  itemSKU?: string;
  unitId: string;
  unitName?: string;
  qty: number;
  qtyReturned: number;
  note?: string;
}

export interface WarehouseOutboundDTO {
  id: string;
  docNumber: string;
  date: string;
  warehouseId: string;
  warehouseName?: string;
  purpose: WarehouseOutboundPurpose;
  targetDept?: string;
  pickerName?: string;
  loanReceiver?: string;
  expectedReturnAt?: string | null;
  loanNotes?: string | null;
  note?: string | null;
  expenseAccountId?: string | null;
  costCenter?: string | null;
  status: WarehouseOutboundStatus;
  glStatus?: "PENDING" | "POSTED" | "FAILED";
  glPostedAt?: string | null;
  glEntryId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lines: WarehouseOutboundLineDTO[];
}

export interface CreateWarehouseOutboundLineDTO {
  itemId: string;
  unitId: string;
  qty: number;
  note?: string;
}

export interface CreateWarehouseOutboundDTO {
  date: string;
  warehouseId: string;
  purpose: WarehouseOutboundPurpose;
  targetDept: string;
  pickerName?: string;
  loanReceiver?: string;
  expectedReturnAt?: string | null;
  loanNotes?: string | null;
  note?: string | null;
  expenseAccountId?: string | null;
  costCenter?: string | null;
  lines: CreateWarehouseOutboundLineDTO[];
}

export interface UpdateWarehouseOutboundDTO {
  date?: string;
  warehouseId?: string;
  purpose?: WarehouseOutboundPurpose;
  targetDept?: string;
  pickerName?: string | null;
  loanReceiver?: string | null;
  expectedReturnAt?: string | null;
  loanNotes?: string | null;
  note?: string | null;
  expenseAccountId?: string | null;
  costCenter?: string | null;
  status?: WarehouseOutboundStatus;
  lines?: CreateWarehouseOutboundLineDTO[];
}

// Barang Keluar (Loan/Peminjaman) Types

// Barang Masuk (Return/Kembalian & New Item) Types
export interface WarehouseInboundDTO {
  id: string;
  docNumber: string;
  date: string;
  warehouseId: string;
  warehouseName?: string;
  sourceType: string; // RETURN | NEW_ITEM | PURCHASE | PRODUCTION | OTHER | LOAN_RETURN
  sourceRef?: string; // Reference to outbound doc if RETURN/LOAN_RETURN
  loanIssueId?: string; // Reference ke GoodsIssue jika ini loan return
  note?: string;
  
  // Accounting fields
  glStatus?: string; // PENDING | POSTED | FAILED
  glPostedAt?: string;
  glEntryId?: string;
  
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  lines: WarehouseInboundLineDTO[];
}

export interface WarehouseInboundLineDTO {
  id: string;
  inboundId: string;
  itemId: string;
  itemName?: string;
  itemSKU?: string;
  unitId: string;
  unitName?: string;
  qty: number;
  unitCost?: number;
  note?: string;
  loanIssueLineId?: string; // Reference ke GoodsIssueLine yang dipinjam
}

export interface CreateWarehouseInboundDTO {
  date: string;
  warehouseId: string;
  sourceType: string;
  sourceRef?: string;
  loanIssueId?: string; // Required if sourceType = LOAN_RETURN
  note?: string;
  lines: CreateWarehouseInboundLineDTO[];
}

export interface CreateWarehouseInboundLineDTO {
  itemId: string;
  unitId: string;
  qty: number;
  unitCost?: number;
  note?: string;
  loanIssueLineId?: string; // Required if sourceType = LOAN_RETURN
}

// Untuk create barang baru saat inbound
export interface CreateNewItemInboundDTO {
  date: string;
  warehouseId: string;
  binId?: string;
  note?: string;
  newItem: CreateNewItemDataDTO;
  qty: number;
  unitCost: number;
}

export interface CreateNewItemDataDTO {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  itemTypeId: string;
  baseUnitId: string;
  defaultIssueUnitId?: string;
  valuationMethod?: string;
  minStock?: number;
  maxStock?: number;
}

// Pengajuan Barang Types
export interface ItemRequestDTO {
  id: string;
  reqNumber: string;
  date: string;
  requestDept: string;
  reason?: string;
  status: string; // DRAFT | PENDING | APPROVED | REJECTED | FULFILLED | NEED_FUND
  relatedFunding?: string; // Account ID from Chart of Accounts
  fundingAccountName?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  lines: ItemRequestLineDTO[];
}

export interface ItemRequestLineDTO {
  id: string;
  requestId: string;
  itemId: string;
  itemName?: string;
  itemSKU?: string;
  unitId: string;
  unitName?: string;
  qty: number;
}

export interface CreateItemRequestDTO {
  date: string;
  requestDept: string;
  reason?: string;
  relatedFunding?: string;
  lines: CreateItemRequestLineDTO[];
}

export interface CreateItemRequestLineDTO {
  itemId: string;
  unitId: string;
  qty: number;
}

export interface UpdateItemRequestDTO {
  date?: string;
  requestDept?: string;
  reason?: string;
  status?: string;
  relatedFunding?: string;
  lines?: CreateItemRequestLineDTO[];
}

export interface ApproveItemRequestDTO {
  requestId: string;
  approved: boolean;
  note?: string;
}

// Query & Pagination Types
export interface WarehouseTransactionQuery {
  search?: string;
  warehouseId?: string;
  status?: string;
  purpose?: string;
  sourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Stock validation response
export interface StockValidationResult {
  valid: boolean;
  errors: StockValidationError[];
}

export interface StockValidationError {
  itemId: string;
  itemName: string;
  requested: number;
  available: number;
  message: string;
}

// Loan Return Types
export interface LoanReturnDTO {
  loanIssueId: string;
  date: string;
  warehouseId: string;
  note?: string;
  lines: LoanReturnLineDTO[];
}

export interface LoanReturnLineDTO {
  loanIssueLineId: string;
  itemId: string;
  qtyReturned: number;
  note?: string;
}

// GL Journal Types
export interface JournalEntryDTO {
  id: string;
  companyId: string;
  entryNumber: string;
  date: string;
  sourceType: string;
  sourceId?: string;
  memo?: string;
  status: string;
  postedAt?: string;
  postedById?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lines: JournalLineDTO[];
}

export interface JournalLineDTO {
  id: string;
  entryId: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  costCenter?: string;
  dept?: string;
  itemId?: string;
  warehouseId?: string;
  description?: string;
}

export interface CreateJournalEntryDTO {
  companyId: string;
  date: string;
  sourceType: string;
  sourceId?: string;
  memo?: string;
  lines: CreateJournalLineDTO[];
}

export interface CreateJournalLineDTO {
  accountId: string;
  debit: number;
  credit: number;
  costCenter?: string;
  dept?: string;
  itemId?: string;
  warehouseId?: string;
  description?: string;
}
