/**
 * PB Import Module - Zod Validation Schemas
 * Supplier & Timbangan Excel Import
 */

import { z } from "zod";

// ============================================================================
// API REQUEST SCHEMAS
// ============================================================================

/**
 * Schema for uploading Excel file
 * Note: File validation happens at API route level (multipart/form-data)
 */
export const uploadPbExcelSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().positive("File size must be positive"),
  mimeType: z.string().refine(
    (type) => 
      type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      type === "application/vnd.ms-excel",
    "File must be an Excel file (.xlsx or .xls)"
  ),
});

/**
 * Schema for mapping rows to suppliers/vehicles
 */
export const mapRowSchema = z.object({
  items: z.array(
    z.object({
      rowId: z.string().cuid("Invalid row ID"),
      supplierId: z.string().cuid("Invalid supplier ID").optional(),
      vehicleId: z.string().cuid("Invalid vehicle ID").optional(),
    })
  ).min(1, "At least one row mapping is required"),
});

export type MapRowInput = z.infer<typeof mapRowSchema>;

/**
 * Schema for committing batch
 */
export const commitBatchSchema = z.object({
  confirm: z.boolean().refine((val) => val === true, {
    message: "Confirmation is required to commit batch",
  }),
});

export type CommitBatchInput = z.infer<typeof commitBatchSchema>;

/**
 * Schema for batch ID parameter
 */
export const batchIdSchema = z.string().cuid("Invalid batch ID");

// ============================================================================
// EXCEL DATA VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for validating parsed Excel row data
 */
export const excelRowDataSchema = z.object({
  noSeri: z.string().nullable(),
  noPolisi: z.string().nullable(),
  namaRelasi: z.string().nullable(),
  produk: z.string().nullable(),
  timbang1Kg: z.number().nonnegative("Timbang 1 must be >= 0").nullable(),
  timbang2Kg: z.number().nonnegative("Timbang 2 must be >= 0").nullable(),
  netto1Kg: z.number().nonnegative("Netto 1 must be >= 0").nullable(),
  potPct: z.number().min(0, "Pot % must be >= 0").max(100, "Pot % must be <= 100").nullable(),
  potKg: z.number().nonnegative("Pot Kg must be >= 0").nullable(),
  terimaKg: z.number().nonnegative("Terima Kg must be >= 0").nullable(),
  harga: z.number().nonnegative("Harga must be >= 0").nullable(),
  total: z.number().nonnegative("Total must be >= 0").nullable(),
  pph: z.number().nonnegative("PPH must be >= 0").nullable(),
  totalPay: z.number().nonnegative("Total Pay must be >= 0").nullable(),
  tanggal: z.date().nullable(),
  jamMasuk: z.string().nullable(),
  jamKeluar: z.string().nullable(),
  lokasiKebun: z.string().nullable(),
  payeeName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNo: z.string().nullable(),
  penimbang: z.string().nullable(),
});

export type ExcelRowData = z.infer<typeof excelRowDataSchema>;

/**
 * Schema for creating PbImportRow
 */
export const createPbImportRowSchema = z.object({
  batchId: z.string().cuid(),
  noSeri: z.string().nullable(),
  noPolisi: z.string().nullable(),
  namaRelasi: z.string().nullable(),
  produk: z.string().nullable(),
  timbang1Kg: z.number().nullable(),
  timbang2Kg: z.number().nullable(),
  netto1Kg: z.number().nullable(),
  potPct: z.number().nullable(),
  potKg: z.number().nullable(),
  terimaKg: z.number().nullable(),
  harga: z.number().nullable(),
  total: z.number().nullable(),
  pph: z.number().nullable(),
  totalPay: z.number().nullable(),
  tanggal: z.date().nullable(),
  jamMasuk: z.string().nullable(),
  jamKeluar: z.string().nullable(),
  lokasiKebun: z.string().nullable(),
  payeeName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNo: z.string().nullable(),
  penimbang: z.string().nullable(),
  supplierId: z.string().cuid().nullable(),
  vehicleId: z.string().cuid().nullable(),
  uniqueKey: z.string().min(1),
});

export type CreatePbImportRowInput = z.infer<typeof createPbImportRowSchema>;

/**
 * Schema for creating PbTicket from validated row
 */
export const createPbTicketSchema = z.object({
  batchId: z.string().cuid(),
  rowId: z.string().cuid(),
  date: z.date(),
  ticketNo: z.string().min(1, "Ticket number is required"),
  vehiclePlate: z.string().nullable(),
  supplierId: z.string().cuid().nullable(),
  cluster: z.string().nullable(),
  wbInAt: z.date().nullable(),
  wbOutAt: z.date().nullable(),
  grossKg: z.number().positive("Gross weight must be positive"),
  tareKg: z.number().nonnegative("Tare weight must be >= 0"),
  netto1Kg: z.number().positive("Netto weight must be positive"),
  potPct: z.number().min(0).max(100),
  potKg: z.number().nonnegative(),
  receiveKg: z.number().positive("Receive weight must be positive"),
  price: z.number().nonnegative("Price must be >= 0"),
  total: z.number().nonnegative("Total must be >= 0"),
  pph: z.number().nonnegative("PPH must be >= 0"),
  totalPay: z.number().nonnegative("Total payment must be >= 0"),
  payeeName: z.string().nullable(),
  bankName: z.string().nullable(),
  accountNo: z.string().nullable(),
  weigherName: z.string().nullable(),
});

export type CreatePbTicketInput = z.infer<typeof createPbTicketSchema>;

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for listing batches
 */
export const listBatchesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["DRAFT", "POSTED"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "fileName", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListBatchesQuery = z.infer<typeof listBatchesQuerySchema>;

/**
 * Schema for listing rows in a batch
 */
export const listRowsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  showInvalidOnly: z.coerce.boolean().default(false),
});

export type ListRowsQuery = z.infer<typeof listRowsQuerySchema>;

// ============================================================================
// HELPER SCHEMAS
// ============================================================================

/**
 * Schema for fuzzy search query
 */
export const fuzzySearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().int().positive().max(10).default(5),
});

export type FuzzySearchInput = z.infer<typeof fuzzySearchSchema>;

