import { type Prisma, type LocationType, type LedgerType } from "@prisma/client";

// ============================================================================
// UOM TYPES
// ============================================================================

export interface UomDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UomConversionDTO {
  id: string;
  fromUomId: string;
  toUomId: string;
  factor: number;
  fromUom?: UomDTO;
  toUom?: UomDTO;
}

export interface CreateUomDTO {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateUomDTO {
  code?: string;
  name?: string;
  description?: string;
}

// ============================================================================
// MATERIAL CATEGORY TYPES
// ============================================================================

export interface MaterialCategoryDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  code: string;
  name: string;
  description?: string;
  notes?: string;
}

export interface UpdateCategoryDTO {
  code?: string;
  name?: string;
  description?: string;
  notes?: string;
}

// ============================================================================
// MATERIAL TYPES
// ============================================================================

export interface MaterialDTO {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  baseUomId: string;
  minStock?: number | null;
  reorderPoint?: number | null;
  isConsumable: boolean;
  photoUrl?: string | null;
  specs?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: MaterialCategoryDTO;
  baseUom?: UomDTO;
}

export interface CreateMaterialDTO {
  code: string;
  name: string;
  categoryId: string;
  baseUomId: string;
  minStock?: number;
  reorderPoint?: number;
  isConsumable?: boolean;
  photoUrl?: string;
  specs?: string;
  isActive?: boolean;
}

export interface UpdateMaterialDTO {
  code?: string;
  name?: string;
  categoryId?: string;
  baseUomId?: string;
  minStock?: number;
  reorderPoint?: number;
  isConsumable?: boolean;
  photoUrl?: string;
  specs?: string;
  isActive?: boolean;
}

// ============================================================================
// WAREHOUSE TYPES
// ============================================================================

export interface WarehouseDTO {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// ============================================================================
// LOCATION TYPES
// ============================================================================

export interface LocationDTO {
  id: string;
  warehouseId: string;
  parentId?: string | null;
  type: LocationType;
  code: string;
  name?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  warehouse?: WarehouseDTO;
  parent?: LocationDTO | null;
  children?: LocationDTO[];
}

export interface CreateLocationDTO {
  warehouseId: string;
  parentId?: string;
  type: LocationType;
  code: string;
  name?: string;
  isActive?: boolean;
}

export interface UpdateLocationDTO {
  parentId?: string;
  type?: LocationType;
  code?: string;
  name?: string;
  isActive?: boolean;
}

// ============================================================================
// STOCK TYPES
// ============================================================================

export interface StockDTO {
  id: string;
  materialId: string;
  locationId: string;
  qtyOnHand: number;
  avgCost?: number | null;
  material?: MaterialDTO;
  location?: LocationDTO;
}

export interface StockLedgerDTO {
  id: string;
  ts: Date;
  materialId: string;
  locationId: string;
  ledgerType: LedgerType;
  refTable?: string | null;
  refId?: string | null;
  qty: number;
  beforeQty?: number | null;
  afterQty?: number | null;
  note?: string | null;
  material?: MaterialDTO;
  location?: LocationDTO;
}

// ============================================================================
// GOODS RECEIPT NOTE (GRN) TYPES
// ============================================================================

export interface GoodsReceiptItemDTO {
  id: string;
  goodsReceiptId: string;
  materialId: string;
  locationId: string;
  uomId: string;
  qty: number;
  note?: string | null;
  material?: MaterialDTO;
  location?: LocationDTO;
  uom?: UomDTO;
}

export interface GoodsReceiptDTO {
  id: string;
  receiptNo: string;
  warehouseId: string;
  date: Date;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  warehouse?: WarehouseDTO;
  items?: GoodsReceiptItemDTO[];
}

export interface CreateGrnItemDTO {
  materialId: string;
  locationId: string;
  uomId: string;
  qty: number;
  note?: string;
}

export interface CreateGrnDTO {
  warehouseId: string;
  date: Date;
  note?: string;
  items: CreateGrnItemDTO[];
}

// ============================================================================
// GOODS ISSUE TYPES
// ============================================================================

export interface GoodsIssueItemDTO {
  id: string;
  goodsIssueId: string;
  materialId: string;
  locationId: string;
  uomId: string;
  qty: number;
  note?: string | null;
  material?: MaterialDTO;
  location?: LocationDTO;
  uom?: UomDTO;
}

export interface GoodsIssueDTO {
  id: string;
  issueNo: string;
  warehouseId: string;
  date: Date;
  requesterId?: string | null;
  costCenter?: string | null;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  warehouse?: WarehouseDTO;
  items?: GoodsIssueItemDTO[];
}

export interface CreateIssueItemDTO {
  materialId: string;
  locationId: string;
  uomId: string;
  qty: number;
  note?: string;
}

export interface CreateIssueDTO {
  warehouseId: string;
  date: Date;
  requesterId?: string;
  costCenter?: string;
  note?: string;
  items: CreateIssueItemDTO[];
}

// ============================================================================
// STOCK TRANSFER TYPES
// ============================================================================

export interface StockTransferDTO {
  id: string;
  transferNo: string;
  date: Date;
  fromLocId: string;
  toLocId: string;
  materialId: string;
  uomId: string;
  qty: number;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  fromLoc?: LocationDTO;
  toLoc?: LocationDTO;
  material?: MaterialDTO;
  uom?: UomDTO;
}

export interface CreateTransferDTO {
  date: Date;
  fromLocId: string;
  toLocId: string;
  materialId: string;
  uomId: string;
  qty: number;
  note?: string;
}

// ============================================================================
// STOCK ADJUSTMENT TYPES
// ============================================================================

export interface StockAdjustmentItemDTO {
  id: string;
  stockAdjustmentId: string;
  materialId: string;
  locationId: string;
  qtyDiff: number;
  note?: string | null;
  material?: MaterialDTO;
  location?: LocationDTO;
}

export interface StockAdjustmentDTO {
  id: string;
  adjNo: string;
  date: Date;
  reason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: StockAdjustmentItemDTO[];
}

export interface CreateAdjustmentItemDTO {
  materialId: string;
  locationId: string;
  qtyDiff: number;
  note?: string;
}

export interface CreateAdjustmentDTO {
  date: Date;
  reason?: string;
  items: CreateAdjustmentItemDTO[];
}

// ============================================================================
// STOCK COUNT (OPNAME) TYPES
// ============================================================================

export interface StockCountLineDTO {
  id: string;
  stockCountId: string;
  materialId: string;
  locationId: string;
  countedQty: number;
  systemQty: number;
  diffQty: number;
  note?: string | null;
  material?: MaterialDTO;
  location?: LocationDTO;
}

export interface StockCountDTO {
  id: string;
  countNo: string;
  warehouseId: string;
  date: Date;
  areaNote?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  warehouse?: WarehouseDTO;
  lines?: StockCountLineDTO[];
}

export interface CreateCountLineDTO {
  materialId: string;
  locationId: string;
  countedQty: number;
  systemQty: number;
  note?: string;
}

export interface CreateCountDTO {
  warehouseId: string;
  date: Date;
  areaNote?: string;
  lines: CreateCountLineDTO[];
}

// ============================================================================
// OPENING BALANCE TYPES
// ============================================================================

export interface OpeningBalanceLineDTO {
  materialId: string;
  locationId: string;
  qty: number;
  note?: string;
}

export interface CreateOpeningBalanceDTO {
  date: Date;
  lines: OpeningBalanceLineDTO[];
}

// ============================================================================
// QUERY & FILTER TYPES
// ============================================================================

export interface StockFilter {
  materialId?: string;
  locationId?: string;
  warehouseId?: string;
  minQty?: number;
}

export interface LedgerFilter {
  materialId?: string;
  locationId?: string;
  warehouseId?: string;
  ledgerType?: LedgerType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ListFilter {
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
  statusCode: number;
  pagination?: Pagination;
}

export interface InventoryStats {
  totalMaterials: number;
  activeMaterials: number;
  totalCategories: number;
  totalWarehouses: number;
  totalLocations: number;
  lowStockItems: number;
}

