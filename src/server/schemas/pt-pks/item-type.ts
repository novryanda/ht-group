import { z } from "zod";

// Base ItemType Schema
export const itemTypeSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  code: z.string().min(1, "Kode jenis wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama jenis wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create ItemType Schema
export const createItemTypeSchema = itemTypeSchema;

// Update ItemType Schema
export const updateItemTypeSchema = itemTypeSchema.partial();

// Query Schema
export const itemTypeQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ItemTypeInput = z.infer<typeof createItemTypeSchema>;
export type UpdateItemTypeInput = z.infer<typeof updateItemTypeSchema>;
export type ItemTypeQuery = z.infer<typeof itemTypeQuerySchema>;
