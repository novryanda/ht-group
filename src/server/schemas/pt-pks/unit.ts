import { z } from "zod";

// Base Unit Schema
export const unitSchema = z.object({
  code: z.string().min(1, "Kode satuan wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama satuan wajib diisi").max(100, "Nama maksimal 100 karakter"),
  isBase: z.boolean().default(false),
  conversionToBase: z.number().positive("Konversi harus lebih dari 0").default(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create Unit Schema
export const createUnitSchema = unitSchema.refine(
  (data) => {
    // Jika isBase = true, maka conversionToBase harus = 1
    if (data.isBase && data.conversionToBase !== 1) {
      return false;
    }
    return true;
  },
  {
    message: "Satuan dasar (base unit) harus memiliki konversi = 1",
    path: ["conversionToBase"],
  }
);

// Update Unit Schema
export const updateUnitSchema = unitSchema.partial().refine(
  (data) => {
    // Jika isBase = true, maka conversionToBase harus = 1
    if (data.isBase && data.conversionToBase !== undefined && data.conversionToBase !== 1) {
      return false;
    }
    return true;
  },
  {
    message: "Satuan dasar (base unit) harus memiliki konversi = 1",
    path: ["conversionToBase"],
  }
);

// Query Schema
export const unitQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type UnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type UnitQuery = z.infer<typeof unitQuerySchema>;
