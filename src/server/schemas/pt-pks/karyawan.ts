import { z } from "zod";
import { FamilyRelation } from "@prisma/client";

// ============================================================================
// EMPLOYEE LIST QUERY SCHEMA
// ============================================================================

export const EmployeeListQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val) return 1;
    return typeof val === "string" ? parseInt(val, 10) : val;
  }),
  pageSize: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val) return 10;
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    return num > 100 ? 100 : num;
  }),
  search: z.string().optional(),
  sortBy: z.string().optional().transform((val) => val || "createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().transform((val) => val || "desc"),
  // Filters
  devisi: z.string().optional(),
  level: z.string().optional(),
  jabatan: z.string().optional(),
  companyId: z.string().optional(),
}).passthrough(); // Allow extra fields

export type EmployeeListQueryInput = z.infer<typeof EmployeeListQuerySchema>;

// ============================================================================
// EMPLOYEE FAMILY SCHEMAS
// ============================================================================

export const EmployeeFamilyCreateSchema = z.object({
  // Required fields
  nama: z.string().min(1, "Nama wajib diisi"),
  hubungan: z.nativeEnum(FamilyRelation),

  // Optional fields
  jenis_kelamin: z
    .string()
    .regex(/^[LP]$/, "Jenis kelamin harus L atau P")
    .optional()
    .nullable(),
  tanggal_lahir: z.coerce.date().optional().nullable(),
  umur: z.coerce.number().int().min(0).max(150).optional().nullable(),
  no_nik_ktp: z.string().max(20).optional().nullable(),
  no_bpjs_kesehatan: z.string().max(50).optional().nullable(),
  no_telp_hp: z.string().max(20).optional().nullable(),
});

export type EmployeeFamilyCreateInput = z.infer<typeof EmployeeFamilyCreateSchema>;

export const EmployeeFamilyUpdateSchema = z.object({
  nama: z.string().min(1).optional(),
  hubungan: z.nativeEnum(FamilyRelation).optional(),
  jenis_kelamin: z
    .string()
    .regex(/^[LP]$/, "Jenis kelamin harus L atau P")
    .optional()
    .nullable(),
  tanggal_lahir: z.coerce.date().optional().nullable(),
  umur: z.coerce.number().int().min(0).max(150).optional().nullable(),
  no_nik_ktp: z.string().max(20).optional().nullable(),
  no_bpjs_kesehatan: z.string().max(50).optional().nullable(),
  no_telp_hp: z.string().max(20).optional().nullable(),
});

export type EmployeeFamilyUpdateInput = z.infer<typeof EmployeeFamilyUpdateSchema>;

// ============================================================================
// EMPLOYEE CREATE SCHEMA
// ============================================================================

export const EmployeeCreateSchema = z.object({
  // Required fields
  nama: z.string().min(1, "Nama wajib diisi").max(100),
  jenis_kelamin: z
    .string()
    .regex(/^[LP]$/, "Jenis kelamin harus L atau P"),
  no_nik_ktp: z.string().min(1, "NIK/KTP wajib diisi").max(20),

  // Optional fields
  status_kk: z.string().max(50).optional().nullable(),
  agama: z.string().max(30).optional().nullable(),
  suku: z.string().max(50).optional().nullable(),
  golongan_darah: z.string().max(5).optional().nullable(),
  no_telp_hp: z.string().max(20).optional().nullable(),
  tempat_lahir: z.string().max(50).optional().nullable(),
  tanggal_lahir: z.coerce.date().optional().nullable(),
  umur: z.coerce.number().int().min(0).max(150).optional().nullable(),
  alamat_rt_rw: z.string().max(20).optional().nullable(),
  alamat_desa: z.string().max(100).optional().nullable(),
  alamat_kecamatan: z.string().max(100).optional().nullable(),
  alamat_kabupaten: z.string().max(100).optional().nullable(),
  alamat_provinsi: z.string().max(100).optional().nullable(),
  pendidikan_terakhir: z.string().max(50).optional().nullable(),
  jurusan: z.string().max(100).optional().nullable(),
  jabatan: z.string().max(100).optional().nullable(),
  // ✅ Devisi & Level: free text input (bukan enum)
  devisi: z.string().max(100).optional().nullable(),
  level: z.string().max(50).optional().nullable(),
  tgl_masuk_kerja: z.coerce.date().optional().nullable(),
  tgl_terakhir_kerja: z.coerce.date().optional().nullable(),
  masa_kerja: z.string().max(50).optional().nullable(),
  status_pkwt: z.string().max(50).optional().nullable(),
  no_bpjs_tenaga_kerja: z.string().max(50).optional().nullable(),
  no_bpjs_kesehatan: z.string().max(50).optional().nullable(),
  no_npwp: z.string().max(50).optional().nullable(),
  status_pajak: z.string().max(20).optional().nullable(),
  no_rekening_bank: z.string().max(50).optional().nullable(),
  perusahaan_sebelumnya: z.string().max(100).optional().nullable(),
  companyId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export type EmployeeCreateInput = z.infer<typeof EmployeeCreateSchema>;

// ============================================================================
// EMPLOYEE UPDATE SCHEMA
// ============================================================================

export const EmployeeUpdateSchema = z.object({
  nama: z.string().max(100).optional().nullable(),
  status_kk: z.string().max(50).optional().nullable(),
  jenis_kelamin: z
    .string()
    .regex(/^[LP]$/, "Jenis kelamin harus L atau P")
    .optional()
    .nullable(),
  agama: z.string().max(30).optional().nullable(),
  suku: z.string().max(50).optional().nullable(),
  golongan_darah: z.string().max(5).optional().nullable(),
  no_telp_hp: z.string().max(20).optional().nullable(),
  tempat_lahir: z.string().max(50).optional().nullable(),
  tanggal_lahir: z.coerce.date().optional().nullable(),
  umur: z.coerce.number().int().min(0).max(150).optional().nullable(),
  alamat_rt_rw: z.string().max(20).optional().nullable(),
  alamat_desa: z.string().max(100).optional().nullable(),
  alamat_kecamatan: z.string().max(100).optional().nullable(),
  alamat_kabupaten: z.string().max(100).optional().nullable(),
  alamat_provinsi: z.string().max(100).optional().nullable(),
  pendidikan_terakhir: z.string().max(50).optional().nullable(),
  jurusan: z.string().max(100).optional().nullable(),
  jabatan: z.string().max(100).optional().nullable(),
  devisi: z.string().max(100).optional().nullable(),
  level: z.string().max(50).optional().nullable(),
  tgl_masuk_kerja: z.coerce.date().optional().nullable(),
  tgl_terakhir_kerja: z.coerce.date().optional().nullable(),
  masa_kerja: z.string().max(50).optional().nullable(),
  status_pkwt: z.string().max(50).optional().nullable(),
  no_bpjs_tenaga_kerja: z.string().max(50).optional().nullable(),
  no_nik_ktp: z.string().max(20).optional().nullable(),
  no_bpjs_kesehatan: z.string().max(50).optional().nullable(),
  no_npwp: z.string().max(50).optional().nullable(),
  status_pajak: z.string().max(20).optional().nullable(),
  no_rekening_bank: z.string().max(50).optional().nullable(),
  perusahaan_sebelumnya: z.string().max(100).optional().nullable(),
});

export type EmployeeUpdateInput = z.infer<typeof EmployeeUpdateSchema>;

