import { z } from "zod";

// Base Warehouse Schema
export const warehouseSchema = z.object({
  code: z.string().min(1, "Kode gudang wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama gudang wajib diisi").max(100, "Nama maksimal 100 karakter"),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create Warehouse Schema
export const createWarehouseSchema = warehouseSchema;

// Update Warehouse Schema
export const updateWarehouseSchema = warehouseSchema.partial();

// Query Schema
export const warehouseQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Bin Schema
export const binSchema = z.object({
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  code: z.string().min(1, "Kode bin wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama bin wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create Bin Schema
export const createBinSchema = binSchema;

// Update Bin Schema
export const updateBinSchema = binSchema.partial();

// Query Schema for Bins
export const binQuerySchema = z.object({
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type WarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type WarehouseQuery = z.infer<typeof warehouseQuerySchema>;
export type BinInput = z.infer<typeof createBinSchema>;
export type UpdateBinInput = z.infer<typeof updateBinSchema>;
export type BinQuery = z.infer<typeof binQuerySchema>;
