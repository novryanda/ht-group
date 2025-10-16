import { z } from "zod";
import { LocationType, LedgerType } from "@prisma/client";

// ============================================================================
// UOM SCHEMAS
// ============================================================================

export const createUomSchema = z.object({
  code: z.string().min(1, "Kode UoM wajib diisi").max(20, "Kode UoM maksimal 20 karakter"),
  name: z.string().min(1, "Nama UoM wajib diisi").max(100, "Nama UoM maksimal 100 karakter"),
});

export const updateUomSchema = createUomSchema.partial();

export const uomConversionSchema = z.object({
  fromUomId: z.string().cuid("ID UoM asal tidak valid"),
  toUomId: z.string().cuid("ID UoM tujuan tidak valid"),
  factor: z.coerce.number().positive("Faktor konversi harus positif"),
}).refine((data) => data.fromUomId !== data.toUomId, {
  message: "UoM asal dan tujuan tidak boleh sama",
});

// ============================================================================
// MATERIAL CATEGORY SCHEMAS
// ============================================================================

export const createCategorySchema = z.object({
  code: z.string().min(1, "Kode kategori wajib diisi").max(20, "Kode kategori maksimal 20 karakter"),
  name: z.string().min(1, "Nama kategori wajib diisi").max(100, "Nama kategori maksimal 100 karakter"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ============================================================================
// MATERIAL SCHEMAS
// ============================================================================

export const createMaterialSchema = z.object({
  code: z.string().min(1, "Kode material wajib diisi").max(50, "Kode material maksimal 50 karakter"),
  name: z.string().min(1, "Nama material wajib diisi").max(200, "Nama material maksimal 200 karakter"),
  categoryId: z.string().cuid("ID kategori tidak valid"),
  baseUomId: z.string().cuid("ID UoM tidak valid"),
  minStock: z.coerce.number().nonnegative("Stok minimum tidak boleh negatif").optional(),
  reorderPoint: z.coerce.number().nonnegative("Reorder point tidak boleh negatif").optional(),
  isConsumable: z.boolean().optional().default(true),
  photoUrl: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
  specs: z.string().max(1000, "Spesifikasi maksimal 1000 karakter").optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateMaterialSchema = createMaterialSchema.partial();

// ============================================================================
// WAREHOUSE SCHEMAS
// ============================================================================

export const createWarehouseSchema = z.object({
  code: z.string().min(1, "Kode gudang wajib diisi").max(20, "Kode gudang maksimal 20 karakter"),
  name: z.string().min(1, "Nama gudang wajib diisi").max(100, "Nama gudang maksimal 100 karakter"),
  address: z.string().max(500, "Alamat maksimal 500 karakter").optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

// ============================================================================
// LOCATION SCHEMAS
// ============================================================================

export const createLocationSchema = z.object({
  warehouseId: z.string().cuid("ID gudang tidak valid"),
  parentId: z.string().cuid("ID parent tidak valid").optional(),
  type: z.nativeEnum(LocationType, { errorMap: () => ({ message: "Tipe lokasi tidak valid" }) }),
  code: z.string().min(1, "Kode lokasi wajib diisi").max(50, "Kode lokasi maksimal 50 karakter"),
  name: z.string().max(100, "Nama lokasi maksimal 100 karakter").optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateLocationSchema = createLocationSchema.partial().omit({ warehouseId: true });

// ============================================================================
// GOODS RECEIPT NOTE (GRN) SCHEMAS
// ============================================================================

export const grnItemSchema = z.object({
  materialId: z.string().cuid("ID material tidak valid"),
  locationId: z.string().cuid("ID lokasi tidak valid"),
  uomId: z.string().cuid("ID UoM tidak valid"),
  qty: z.coerce.number().positive("Qty harus lebih dari 0"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const createGrnSchema = z.object({
  warehouseId: z.string().cuid("ID gudang tidak valid"),
  date: z.coerce.date({ errorMap: () => ({ message: "Tanggal tidak valid" }) }),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  items: z.array(grnItemSchema).min(1, "Minimal 1 item diperlukan"),
});

// ============================================================================
// GOODS ISSUE SCHEMAS
// ============================================================================

export const issueItemSchema = z.object({
  materialId: z.string().cuid("ID material tidak valid"),
  locationId: z.string().cuid("ID lokasi tidak valid"),
  uomId: z.string().cuid("ID UoM tidak valid"),
  qty: z.coerce.number().positive("Qty harus lebih dari 0"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const createIssueSchema = z.object({
  warehouseId: z.string().cuid("ID gudang tidak valid"),
  date: z.coerce.date({ errorMap: () => ({ message: "Tanggal tidak valid" }) }),
  requesterId: z.string().cuid("ID requester tidak valid").optional(),
  costCenter: z.string().max(100, "Cost center maksimal 100 karakter").optional(),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  items: z.array(issueItemSchema).min(1, "Minimal 1 item diperlukan"),
});

// ============================================================================
// STOCK TRANSFER SCHEMAS
// ============================================================================

export const createTransferSchema = z.object({
  date: z.coerce.date({ errorMap: () => ({ message: "Tanggal tidak valid" }) }),
  fromLocId: z.string().cuid("ID lokasi asal tidak valid"),
  toLocId: z.string().cuid("ID lokasi tujuan tidak valid"),
  materialId: z.string().cuid("ID material tidak valid"),
  uomId: z.string().cuid("ID UoM tidak valid"),
  qty: z.coerce.number().positive("Qty harus lebih dari 0"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
}).refine((data) => data.fromLocId !== data.toLocId, {
  message: "Lokasi asal dan tujuan tidak boleh sama",
});

// ============================================================================
// STOCK ADJUSTMENT SCHEMAS
// ============================================================================

export const adjustmentItemSchema = z.object({
  materialId: z.string().cuid("ID material tidak valid"),
  locationId: z.string().cuid("ID lokasi tidak valid"),
  qtyDiff: z.coerce.number().refine((val) => val !== 0, {
    message: "Qty diff tidak boleh 0",
  }),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const createAdjustmentSchema = z.object({
  date: z.coerce.date({ errorMap: () => ({ message: "Tanggal tidak valid" }) }),
  reason: z.string().max(500, "Alasan maksimal 500 karakter").optional(),
  items: z.array(adjustmentItemSchema).min(1, "Minimal 1 item diperlukan"),
});

// ============================================================================
// STOCK COUNT (OPNAME) SCHEMAS
// ============================================================================

export const countLineSchema = z.object({
  materialId: z.string().cuid("ID material tidak valid"),
  locationId: z.string().cuid("ID lokasi tidak valid"),
  countedQty: z.coerce.number().nonnegative("Counted qty tidak boleh negatif"),
  systemQty: z.coerce.number().nonnegative("System qty tidak boleh negatif"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const createCountSchema = z.object({
  warehouseId: z.string().cuid("ID gudang tidak valid"),
  date: z.coerce.date({ errorMap: () => ({ message: "Tanggal tidak valid" }) }),
  areaNote: z.string().max(500, "Area note maksimal 500 karakter").optional(),
  lines: z.array(countLineSchema).min(1, "Minimal 1 line diperlukan"),
});

export const postCountSchema = z.object({
  countId: z.string().cuid("ID stock count tidak valid"),
});

// ============================================================================
// OPENING BALANCE SCHEMAS
// ============================================================================

export const openingBalanceLineSchema = z.object({
  materialId: z.string().cuid("ID material tidak valid"),
  locationId: z.string().cuid("ID lokasi tidak valid"),
  qty: z.coerce.number().nonnegative("Qty tidak boleh negatif"),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const createOpeningBalanceSchema = z.object({
  date: z.coerce.date({ errorMap: () => ({ message: "Tanggal tidak valid" }) }),
  lines: z.array(openingBalanceLineSchema).min(1, "Minimal 1 line diperlukan"),
});

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const stockQuerySchema = z.object({
  materialId: z.string().cuid().optional(),
  locationId: z.string().cuid().optional(),
  warehouseId: z.string().cuid().optional(),
  minQty: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const ledgerQuerySchema = z.object({
  materialId: z.string().cuid().optional(),
  locationId: z.string().cuid().optional(),
  warehouseId: z.string().cuid().optional(),
  ledgerType: z.nativeEnum(LedgerType).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
});

export const listQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

