import { z } from "zod";

// ============================================
// BARANG KELUAR (OUTBOUND) SCHEMAS
// ============================================

export const warehouseOutboundLineSchema = z.object({
  itemId: z.string().min(1, "Barang wajib dipilih"),
  unitId: z.string().min(1, "Satuan wajib dipilih"),
  qty: z.number().positive("Jumlah harus lebih dari 0"),
  note: z.string().optional(),
});

export const createWarehouseOutboundSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  purpose: z.enum(["LOAN", "ISSUE", "PROD", "SCRAP"]),
  targetDept: z.string().min(1, "Divisi tujuan wajib diisi"),
  note: z.string().optional(),
  lines: z
    .array(warehouseOutboundLineSchema)
    .min(1, "Minimal 1 item barang harus diisi"),
}).refine(
  (data) => {
    // Validate date is not future
    const inputDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  },
  {
    message: "Tanggal tidak boleh lebih dari hari ini",
    path: ["date"],
  }
);

export const updateWarehouseOutboundSchema = z.object({
  date: z.string().optional(),
  warehouseId: z.string().optional(),
  purpose: z.enum(["LOAN", "ISSUE", "PROD", "SCRAP"]).optional(),
  targetDept: z.string().optional(),
  note: z.string().optional(),
  status: z.enum(["DRAFT", "APPROVED", "RETURNED", "PARTIAL_RETURN", "CANCELLED"]).optional(),
  lines: z.array(warehouseOutboundLineSchema).optional(),
});

export const warehouseOutboundQuerySchema = z.object({
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  status: z.string().optional(),
  purpose: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ============================================
// BARANG MASUK (INBOUND) SCHEMAS
// ============================================

export const warehouseInboundLineSchema = z.object({
  itemId: z.string().min(1, "Barang wajib dipilih"),
  unitId: z.string().min(1, "Satuan wajib dipilih"),
  qty: z.number().positive("Jumlah harus lebih dari 0"),
  unitCost: z.number().nonnegative("Harga satuan tidak boleh negatif").optional(),
  note: z.string().optional(),
});

export const createWarehouseInboundSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  sourceType: z.enum(["RETURN", "NEW_ITEM", "PURCHASE", "PRODUCTION", "OTHER"]),
  sourceRef: z.string().optional(),
  note: z.string().optional(),
  lines: z
    .array(warehouseInboundLineSchema)
    .min(1, "Minimal 1 item barang harus diisi"),
}).refine(
  (data) => {
    // Validate date is not future
    const inputDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate <= today;
  },
  {
    message: "Tanggal tidak boleh lebih dari hari ini",
    path: ["date"],
  }
);

// Schema untuk create barang baru + inbound
export const newItemDataSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi").max(50, "SKU maksimal 50 karakter"),
  name: z.string().min(1, "Nama barang wajib diisi").max(200, "Nama maksimal 200 karakter"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  itemTypeId: z.string().min(1, "Jenis barang wajib dipilih"),
  baseUnitId: z.string().min(1, "Satuan dasar wajib dipilih"),
  defaultIssueUnitId: z.string().optional(),
  valuationMethod: z.enum(["AVERAGE", "FIFO"]).default("AVERAGE"),
  minStock: z.number().nonnegative("Stok minimal tidak boleh negatif").default(0),
  maxStock: z.number().nonnegative("Stok maksimal tidak boleh negatif").default(0),
});

export const createNewItemInboundSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  binId: z.string().optional(),
  note: z.string().optional(),
  newItem: newItemDataSchema,
  qty: z.number().positive("Jumlah harus lebih dari 0"),
  unitCost: z.number().nonnegative("Harga satuan tidak boleh negatif").default(0),
}).refine(
  (data) => {
    if (data.newItem.minStock && data.newItem.maxStock) {
      return data.newItem.maxStock >= data.newItem.minStock;
    }
    return true;
  },
  {
    message: "Stok maksimal harus lebih besar atau sama dengan stok minimal",
    path: ["newItem", "maxStock"],
  }
);

export const warehouseInboundQuerySchema = z.object({
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  sourceType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ============================================
// PENGAJUAN BARANG (ITEM REQUEST) SCHEMAS
// ============================================

export const itemRequestLineSchema = z.object({
  itemId: z.string().min(1, "Barang wajib dipilih"),
  unitId: z.string().min(1, "Satuan wajib dipilih"),
  qty: z.number().positive("Jumlah harus lebih dari 0"),
});

export const createItemRequestSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  requestDept: z.string().min(1, "Divisi pemohon wajib diisi"),
  reason: z.string().optional(),
  relatedFunding: z.string().optional(), // Account ID
  lines: z
    .array(itemRequestLineSchema)
    .min(1, "Minimal 1 item barang harus diisi"),
});

export const updateItemRequestSchema = z.object({
  date: z.string().optional(),
  requestDept: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "FULFILLED", "NEED_FUND"]).optional(),
  relatedFunding: z.string().optional(),
  lines: z.array(itemRequestLineSchema).optional(),
});

export const approveItemRequestSchema = z.object({
  requestId: z.string().min(1, "Request ID wajib diisi"),
  approved: z.boolean(),
  note: z.string().optional(),
});

export const itemRequestQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  requestDept: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Export types
export type WarehouseOutboundLineInput = z.infer<typeof warehouseOutboundLineSchema>;
export type CreateWarehouseOutboundInput = z.infer<typeof createWarehouseOutboundSchema>;
export type UpdateWarehouseOutboundInput = z.infer<typeof updateWarehouseOutboundSchema>;
export type WarehouseOutboundQuery = z.infer<typeof warehouseOutboundQuerySchema>;

export type WarehouseInboundLineInput = z.infer<typeof warehouseInboundLineSchema>;
export type CreateWarehouseInboundInput = z.infer<typeof createWarehouseInboundSchema>;
export type CreateNewItemInboundInput = z.infer<typeof createNewItemInboundSchema>;
export type WarehouseInboundQuery = z.infer<typeof warehouseInboundQuerySchema>;

export type ItemRequestLineInput = z.infer<typeof itemRequestLineSchema>;
export type CreateItemRequestInput = z.infer<typeof createItemRequestSchema>;
export type UpdateItemRequestInput = z.infer<typeof updateItemRequestSchema>;
export type ApproveItemRequestInput = z.infer<typeof approveItemRequestSchema>;
export type ItemRequestQuery = z.infer<typeof itemRequestQuerySchema>;
