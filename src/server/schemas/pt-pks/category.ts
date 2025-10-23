import { z } from "zod";

// Base Category Schema
export const categorySchema = z.object({
  code: z.string().min(1, "Kode kategori wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama kategori wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create Category Schema
export const createCategorySchema = categorySchema;

// Update Category Schema
export const updateCategorySchema = categorySchema.partial();

// Query Schema
export const categoryQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
