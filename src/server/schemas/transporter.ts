import { z } from "zod";
import { TransporterType, PkpStatus, RecordStatus } from "@prisma/client";

// ============================================================================
// Nested Schemas (Vehicle, Driver, Tariff, Contract)
// ============================================================================

export const vehicleSchema = z.object({
  plateNo: z.string().min(5, "Nomor plat minimal 5 karakter"),
  type: z.string().min(2, "Jenis kendaraan wajib diisi"),
  capacityTons: z.coerce.number().positive("Kapasitas harus lebih dari 0").optional(),
  stnkUrl: z.string().url("URL STNK tidak valid").optional().or(z.literal("")),
  stnkValidThru: z.coerce.date().optional(),
  kirUrl: z.string().url("URL KIR tidak valid").optional().or(z.literal("")),
  kirValidThru: z.coerce.date().optional(),
  gpsId: z.string().optional(),
  photoUrl: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
});

export const driverSchema = z.object({
  name: z.string().min(2, "Nama pengemudi minimal 2 karakter"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter").optional(),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit").optional(),
  simType: z.string().optional(),
  simUrl: z.string().url("URL SIM tidak valid").optional().or(z.literal("")),
  simValidThru: z.coerce.date().optional(),
});

export const tariffSchema = z.object({
  origin: z.string().min(2, "Origin wajib diisi"),
  destination: z.string().min(2, "Destination wajib diisi"),
  commodity: z.string().min(2, "Komoditas wajib diisi"),
  unit: z.enum(["TON", "KM", "TRIP"], {
    errorMap: () => ({ message: "Unit harus TON, KM, atau TRIP" }),
  }),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  includeToll: z.boolean().optional().default(false),
  includeUnload: z.boolean().optional().default(false),
  includeTax: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

export const contractSchema = z.object({
  contractNo: z.string().min(3, "Nomor kontrak minimal 3 karakter"),
  buyerId: z.string().optional(),
  commodity: z.string().min(2, "Komoditas wajib diisi"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  baseTariffId: z.string().optional(),
  dokUrl: z.string().url("URL dokumen tidak valid").optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: "Tanggal akhir harus lebih besar atau sama dengan tanggal mulai",
    path: ["endDate"],
  }
);

// ============================================================================
// Create Transporter Schema
// ============================================================================

export const createTransporterSchema = z.object({
  type: z.nativeEnum(TransporterType, {
    errorMap: () => ({ message: "Tipe transportir tidak valid" }),
  }),
  legalName: z.string().min(3, "Nama legal minimal 3 karakter"),
  tradeName: z.string().optional(),
  npwp: z
    .string()
    .regex(/^\d{15}$/, "NPWP harus 15 digit angka")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  pkpStatus: z.nativeEnum(PkpStatus, {
    errorMap: () => ({ message: "Status PKP tidak valid" }),
  }),
  addressLine: z.string().min(5, "Alamat minimal 5 karakter").optional(),
  city: z.string().min(2, "Kota minimal 2 karakter").optional(),
  province: z.string().min(2, "Provinsi minimal 2 karakter").optional(),
  postalCode: z.string().optional(),
  picName: z.string().min(2, "Nama PIC minimal 2 karakter").optional(),
  picPhone: z.string().min(8, "Nomor telepon PIC minimal 8 karakter").optional(),
  picEmail: z.string().email("Email PIC tidak valid").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankAccountNm: z.string().optional(),
  statementUrl: z.string().url("URL surat pernyataan tidak valid").optional().or(z.literal("")),
  notes: z.string().optional(),
  vehicles: z.array(vehicleSchema).optional().default([]),
  drivers: z.array(driverSchema).optional().default([]),
  tariffs: z.array(tariffSchema).optional().default([]),
  contracts: z.array(contractSchema).optional().default([]),
}).refine(
  (data) => {
    // NPWP wajib jika PKP status bukan NON_PKP
    if (data.pkpStatus !== "NON_PKP" && !data.npwp) {
      return false;
    }
    return true;
  },
  {
    message: "NPWP wajib diisi untuk status PKP",
    path: ["npwp"],
  }
);

// ============================================================================
// Update Transporter Schema
// ============================================================================

export const updateTransporterSchema = z.object({
  type: z.nativeEnum(TransporterType).optional(),
  legalName: z.string().min(3, "Nama legal minimal 3 karakter").optional(),
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
  picName: z.string().min(2, "Nama PIC minimal 2 karakter").optional(),
  picPhone: z.string().min(8, "Nomor telepon PIC minimal 8 karakter").optional(),
  picEmail: z.string().email("Email PIC tidak valid").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankAccountNm: z.string().optional(),
  statementUrl: z.string().url("URL surat pernyataan tidak valid").optional().or(z.literal("")),
  status: z.nativeEnum(RecordStatus).optional(),
  notes: z.string().optional(),
  vehicles: z.array(vehicleSchema).optional(),
  drivers: z.array(driverSchema).optional(),
  tariffs: z.array(tariffSchema).optional(),
  contracts: z.array(contractSchema).optional(),
}).refine(
  (data) => {
    // NPWP wajib jika PKP status bukan NON_PKP
    if (data.pkpStatus && data.pkpStatus !== "NON_PKP" && !data.npwp) {
      return false;
    }
    return true;
  },
  {
    message: "NPWP wajib diisi untuk status PKP",
    path: ["npwp"],
  }
);

// ============================================================================
// Query Schemas
// ============================================================================

export const listTransporterQuerySchema = z.object({
  query: z.string().optional(),
  type: z.nativeEnum(TransporterType).optional(),
  pkpStatus: z.nativeEnum(PkpStatus).optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  commodity: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// Type exports
// ============================================================================

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type TariffInput = z.infer<typeof tariffSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type CreateTransporterInput = z.infer<typeof createTransporterSchema>;
export type UpdateTransporterInput = z.infer<typeof updateTransporterSchema>;
export type ListTransporterQuery = z.infer<typeof listTransporterQuerySchema>;

