import { z } from "zod";

// Base Item Schema
export const itemSchema = z.object({
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
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // Validasi: jika minStock dan maxStock diisi, maka maxStock harus > minStock
    if (data.minStock !== undefined && data.maxStock !== undefined) {
      return data.maxStock >= data.minStock;
    }
    return true;
  },
  {
    message: "Stok maksimal harus lebih besar atau sama dengan stok minimal",
    path: ["maxStock"],
  }
);

// Create Item Schema
export const createItemSchema = itemSchema;

// Update Item Schema
export const updateItemSchema = itemSchema.partial().refine(
  (data) => {
    // Validasi: jika minStock dan maxStock diisi, maka maxStock harus > minStock
    if (data.minStock !== undefined && data.maxStock !== undefined) {
      return data.maxStock >= data.minStock;
    }
    return true;
  },
  {
    message: "Stok maksimal harus lebih besar atau sama dengan stok minimal",
    path: ["maxStock"],
  }
);

// Query Schema
export const itemQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  itemTypeId: z.string().optional(),
  baseUnitId: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemQuery = z.infer<typeof itemQuerySchema>;

// Query params type for API
export type ItemQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  itemTypeId?: string;
  unitId?: string;
  isActive?: boolean;
};
