import { z } from "zod";
import { BuyerType, PkpStatus, BuyerStatus } from "@prisma/client";

// ============================================================================
// Contact & Document Schemas
// ============================================================================

export const buyerContactSchema = z.object({
  name: z.string().min(2, "Nama kontak minimal 2 karakter"),
  role: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter"),
  isBilling: z.boolean().optional().default(false),
});

export const buyerDocSchema = z.object({
  kind: z.string().min(2, "Jenis dokumen wajib diisi"),
  fileUrl: z.string().url("URL file tidak valid"),
  fileName: z.string().min(1, "Nama file wajib diisi"),
});

// ============================================================================
// Create Buyer Schema
// ============================================================================

export const createBuyerSchema = z.object({
  type: z.nativeEnum(BuyerType, {
    errorMap: () => ({ message: "Tipe buyer tidak valid" }),
  }),
  legalName: z.string().min(2, "Nama legal minimal 2 karakter"),
  tradeName: z.string().optional(),
  npwp: z
    .string()
    .regex(/^\d{15}$/, "NPWP harus 15 digit angka")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  pkpStatus: z.nativeEnum(PkpStatus, {
    errorMap: () => ({ message: "Status PKP tidak valid" }),
  }),
  addressLine: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
  postalCode: z.string().optional(),
  billingEmail: z.string().email("Email penagihan tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter"),
  destinationName: z.string().min(2, "Nama tujuan minimal 2 karakter"),
  destinationAddr: z.string().min(5, "Alamat tujuan minimal 5 karakter"),
  contacts: z
    .array(buyerContactSchema)
    .min(1, "Minimal 1 kontak wajib diisi"),
  docs: z.array(buyerDocSchema).optional(),
});

// ============================================================================
// Update Buyer Schema
// ============================================================================

export const updateBuyerSchema = z.object({
  type: z.nativeEnum(BuyerType).optional(),
  legalName: z.string().min(2, "Nama legal minimal 2 karakter").optional(),
  tradeName: z.string().optional(),
  npwp: z
    .string()
    .regex(/^\d{15}$/, "NPWP harus 15 digit angka")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  pkpStatus: z.nativeEnum(PkpStatus).optional(),
  addressLine: z.string().min(5, "Alamat minimal 5 karakter").optional(),
  city: z.string().min(2, "Kota minimal 2 karakter").optional(),
  province: z.string().min(2, "Provinsi minimal 2 karakter").optional(),
  postalCode: z.string().optional(),
  billingEmail: z.string().email("Email penagihan tidak valid").optional(),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter").optional(),
  destinationName: z.string().min(2, "Nama tujuan minimal 2 karakter").optional(),
  destinationAddr: z.string().min(5, "Alamat tujuan minimal 5 karakter").optional(),
  status: z.nativeEnum(BuyerStatus).optional(),
  contacts: z.array(buyerContactSchema).optional(),
  docs: z.array(buyerDocSchema).optional(),
});

// ============================================================================
// Query Schemas
// ============================================================================

export const listBuyerQuerySchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(BuyerType).optional(),
  pkpStatus: z.nativeEnum(PkpStatus).optional(),
  status: z.nativeEnum(BuyerStatus).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const checkDuplicateQuerySchema = z.object({
  npwp: z.string().optional(),
  legalName: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
export type ListBuyerQuery = z.infer<typeof listBuyerQuerySchema>;
export type CheckDuplicateQuery = z.infer<typeof checkDuplicateQuerySchema>;

