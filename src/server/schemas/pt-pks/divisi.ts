import { z } from "zod";

// Base Divisi Schema
export const divisiSchema = z.object({
  code: z.string().min(1, "Kode divisi wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama divisi wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(300, "Deskripsi maksimal 300 karakter").optional(),
  isActive: z.boolean().default(true),
});

// Create Divisi Schema
export const createDivisiSchema = divisiSchema;

// Update Divisi Schema
export const updateDivisiSchema = divisiSchema.partial();

// Query Schema
export const divisiQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type DivisiInput = z.infer<typeof createDivisiSchema>;
export type UpdateDivisiInput = z.infer<typeof updateDivisiSchema>;
export type DivisiQuery = z.infer<typeof divisiQuerySchema>;

