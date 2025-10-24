// ============================================
// WAREHOUSE TRANSACTION TYPES - PT PKS
// ============================================

// Barang Keluar (Loan/Peminjaman) Types
export interface WarehouseOutboundDTO {
  id: string;
  docNumber: string;
  date: string;
  warehouseId: string;
  warehouseName?: string;
  purpose: string; // LOAN | ISSUE | PROD | SCRAP
  targetDept: string;
  pickerName?: string; // Nama pengambil barang
  note?: string;
  status: string; // DRAFT | APPROVED | RETURNED | PARTIAL_RETURN | CANCELLED
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  lines: WarehouseOutboundLineDTO[];
}

export interface WarehouseOutboundLineDTO {
  id: string;
  outboundId: string;
  itemId: string;
  itemName?: string;
  itemSKU?: string;
  unitId: string;
  unitName?: string;
  qty: number;
  qtyReturned?: number; // Untuk tracking barang yang sudah dikembalikan
  note?: string;
}

export interface CreateWarehouseOutboundDTO {
  date: string;
  warehouseId: string;
  purpose: string;
  targetDept: string;
  pickerName?: string;
  note?: string;
  lines: CreateWarehouseOutboundLineDTO[];
}

export interface CreateWarehouseOutboundLineDTO {
  itemId: string;
  unitId: string;
  qty: number;
  note?: string;
}

export interface UpdateWarehouseOutboundDTO {
  date?: string;
  warehouseId?: string;
  purpose?: string;
  targetDept?: string;
  note?: string;
  status?: string;
  lines?: CreateWarehouseOutboundLineDTO[];
}

// Barang Masuk (Return/Kembalian & New Item) Types
export interface WarehouseInboundDTO {
  id: string;
  docNumber: string;
  date: string;
  warehouseId: string;
  warehouseName?: string;
  sourceType: string; // RETURN | NEW_ITEM | PURCHASE | PRODUCTION | OTHER
  sourceRef?: string; // Reference to outbound doc if RETURN
  note?: string;
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
}

export interface CreateWarehouseInboundDTO {
  date: string;
  warehouseId: string;
  sourceType: string;
  sourceRef?: string;
  note?: string;
  lines: CreateWarehouseInboundLineDTO[];
}

export interface CreateWarehouseInboundLineDTO {
  itemId: string;
  unitId: string;
  qty: number;
  unitCost?: number;
  note?: string;
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
