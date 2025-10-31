import { z } from "zod";

// Base Jabatan Schema
export const jabatanSchema = z.object({
  divisiId: z.string().min(1, "Divisi wajib dipilih"),
  code: z.string().min(1, "Kode jabatan wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama jabatan wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(300, "Deskripsi maksimal 300 karakter").optional(),
  isActive: z.boolean().default(true),
});

// Create Jabatan Schema
export const createJabatanSchema = jabatanSchema;

// Update Jabatan Schema
export const updateJabatanSchema = jabatanSchema.partial();

// Query Schema
export const jabatanQuerySchema = z.object({
  search: z.string().optional(),
  divisiId: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type JabatanInput = z.infer<typeof createJabatanSchema>;
export type UpdateJabatanInput = z.infer<typeof updateJabatanSchema>;
export type JabatanQuery = z.infer<typeof jabatanQuerySchema>;

