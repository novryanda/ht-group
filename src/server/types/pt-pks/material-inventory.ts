// ============================================
// MATERIAL INVENTORY TYPES - PT PKS
// ============================================

// Unit (Satuan) Types
export interface UnitDTO {
  id: string;
  code: string;
  name: string;
  isBase: boolean;
  conversionToBase: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitDTO {
  code: string;
  name: string;
  isBase?: boolean;
  conversionToBase?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateUnitDTO {
  code?: string;
  name?: string;
  isBase?: boolean;
  conversionToBase?: number;
  description?: string;
  isActive?: boolean;
}

// Category (Kategori) Types
export interface CategoryDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDTO {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// ItemType (Jenis Barang) Types
export interface ItemTypeDTO {
  id: string;
  categoryId: string;
  categoryName?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemTypeDTO {
  categoryId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateItemTypeDTO {
  categoryId?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Warehouse (Gudang) Types
export interface WarehouseDTO {
  id: string;
  code: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDTO {
  code: string;
  name: string;
  address?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseDTO {
  code?: string;
  name?: string;
  address?: string;
  isActive?: boolean;
}

// Bin (Lokasi Rak) Types
export interface BinDTO {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBinDTO {
  warehouseId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBinDTO {
  warehouseId?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Item (Barang) Types
export interface ItemDTO {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  itemTypeId: string;
  itemTypeName?: string;
  baseUnitId: string;
  baseUnitName?: string;
  defaultIssueUnitId?: string;
  defaultIssueUnitName?: string;
  valuationMethod: string;
  minStock?: number;
  maxStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDTO {
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
  isActive?: boolean;
}

export interface UpdateItemDTO {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  itemTypeId?: string;
  baseUnitId?: string;
  defaultIssueUnitId?: string;
  valuationMethod?: string;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}

// Stock Balance Types
export interface StockBalanceDTO {
  id: string;
  itemId: string;
  itemName?: string;
  warehouseId: string;
  warehouseName?: string;
  binId?: string;
  binName?: string;
  qtyOnHand: number;
  avgCost: number;
  updatedAt: string;
}

// Stock Ledger Types
export interface StockLedgerDTO {
  id: string;
  ts: string;
  itemId: string;
  itemName?: string;
  warehouseId: string;
  warehouseName?: string;
  binId?: string;
  binName?: string;
  referenceType: string;
  referenceId: string;
  qtyDelta: number;
  unitCost?: number;
  note?: string;
  createdById: string;
  createdAt: string;
}

// Pagination & List Response Types
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
