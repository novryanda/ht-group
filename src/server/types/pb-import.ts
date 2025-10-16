/**
 * PB Import Module - Types & DTOs
 * Supplier & Timbangan Excel Import
 */

import type { Decimal } from "@prisma/client/runtime/library";
import type { ImportStatus } from "@prisma/client";

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

export interface PbImportBatchEntity {
  id: string;
  fileName: string;
  fileHash: string;
  periodFrom: Date | null;
  periodTo: Date | null;
  printedAt: Date | null;
  note: string | null;
  status: ImportStatus;
  createdById: string | null;
  createdAt: Date;
  postedAt: Date | null;
}

export interface PbImportRowEntity {
  id: string;
  batchId: string;
  sheetName: string;
  rowIndex: number;
  noSeri: string | null;
  noPolisi: string | null;
  namaRelasi: string | null;
  produk: string | null;
  timbang1Kg: Decimal | null;
  timbang2Kg: Decimal | null;
  netto1Kg: Decimal | null;
  potPct: Decimal | null;
  potKg: Decimal | null;
  terimaKg: Decimal | null;
  harga: Decimal | null;
  total: Decimal | null;
  pph: Decimal | null;
  totalPay: Decimal | null;
  tanggal: Date | null;
  jamMasuk: Date | null;
  jamKeluar: Date | null;
  lokasiKebun: string | null;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  penimbang: string | null;
  supplierId: string | null;
  vehicleId: string | null;
  uniqueKey: string;
  createdAt: Date;
}

export interface PbTicketEntity {
  id: string;
  batchId: string;
  rowId: string;
  sheetName: string;
  date: Date;
  ticketNo: string;
  vehiclePlate: string | null;
  supplierId: string | null;
  cluster: string | null;
  wbInAt: Date | null;
  wbOutAt: Date | null;
  grossKg: Decimal;
  tareKg: Decimal;
  netto1Kg: Decimal;
  potPct: Decimal;
  potKg: Decimal;
  receiveKg: Decimal;
  price: Decimal;
  total: Decimal;
  pph: Decimal;
  totalPay: Decimal;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  weigherName: string | null;
  createdAt: Date;
}

// ============================================================================
// DTOs - Data Transfer Objects
// ============================================================================

export interface PbImportBatchDTO {
  id: string;
  fileName: string;
  fileHash: string;
  periodFrom: string | null;
  periodTo: string | null;
  printedAt: string | null;
  note: string | null;
  status: ImportStatus;
  createdById: string | null;
  createdAt: string;
  postedAt: string | null;
  rowCount?: number;
  ticketCount?: number;
}

export interface PbImportRowDTO {
  id: string;
  batchId: string;
  sheetName: string;
  rowIndex: number;
  noSeri: string | null;
  noPolisi: string | null;
  namaRelasi: string | null;
  produk: string | null;
  timbang1Kg: string | null;
  timbang2Kg: string | null;
  netto1Kg: string | null;
  potPct: string | null;
  potKg: string | null;
  terimaKg: string | null;
  harga: string | null;
  total: string | null;
  pph: string | null;
  totalPay: string | null;
  tanggal: string | null;
  jamMasuk: string | null;
  jamKeluar: string | null;
  lokasiKebun: string | null;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  penimbang: string | null;
  supplierId: string | null;
  vehicleId: string | null;
  supplierName?: string | null;
  vehiclePlate?: string | null;
  issues?: ValidationIssue[];
  isValid?: boolean;
}

export interface PbTicketDTO {
  id: string;
  batchId: string;
  rowId: string;
  sheetName: string;
  date: string;
  ticketNo: string;
  vehiclePlate: string | null;
  supplierId: string | null;
  cluster: string | null;
  wbInAt: string | null;
  wbOutAt: string | null;
  grossKg: string;
  tareKg: string;
  netto1Kg: string;
  potPct: string;
  potKg: string;
  receiveKg: string;
  price: string;
  total: string;
  pph: string;
  totalPay: string;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  weigherName: string | null;
  createdAt: string;
}

// ============================================================================
// VALIDATION & MATCHING
// ============================================================================

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface SupplierCandidate {
  id: string;
  name: string;
  similarity: number;
}

export interface VehicleCandidate {
  id: string;
  plateNo: string;
  similarity: number;
}

export interface RowMatchSuggestions {
  rowId: string;
  supplierCandidates: SupplierCandidate[];
  vehicleCandidates: VehicleCandidate[];
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface UploadPbExcelRequest {
  file: File;
}

export interface SheetSummary {
  sheetName: string;
  rowCount: number;
  validCount: number;
  issueCount: number;
  unknownColumns: string[];
}

export interface UploadPbExcelResponse {
  batchId: string;
  meta: {
    fileName: string;
    periodFrom: string | null;
    periodTo: string | null;
    printedAt: string | null;
    totalRows: number;
    totalValid: number;
    totalIssues: number;
    sheets: SheetSummary[];
  };
}

export interface PreviewBatchResponse {
  batch: PbImportBatchDTO;
  sampleRows: PbImportRowDTO[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  summary: {
    totalTerimaKg: string;
    totalPph: string;
    totalPembayaran: string;
  };
}

export interface MapRowRequest {
  items: Array<{
    rowId: string;
    supplierId?: string;
    vehicleId?: string;
  }>;
}

export interface CommitBatchRequest {
  confirm: boolean;
}

export interface CommitBatchResponse {
  batchId: string;
  created: number;
  skipped: number;
  errors: Array<{
    rowId: string;
    noSeri: string | null;
    reason: string;
  }>;
  summary: {
    totalTerimaKg: string;
    totalPph: string;
    totalPembayaran: string;
  };
}

// ============================================================================
// EXCEL PARSING
// ============================================================================

export interface ExcelHeaderInfo {
  reportTitle: string | null;
  periodFrom: Date | null;
  periodTo: Date | null;
  printedAt: Date | null;
  headerRowIndex: number;
}

export interface ExcelColumnMapping {
  noSeri: number;
  noPolisi: number;
  namaRelasi: number;
  produk: number;
  timbang1: number;
  timbang2: number;
  netto1: number;
  potPct: number;
  potKg: number;
  terima: number;
  harga: number;
  total: number;
  pph: number;
  totalPay: number;
  tanggal: number;
  jamMasuk: number;
  jamKeluar: number;
  lokasiKebun: number;
  payeeName: number;
  bankName: number;
  accountNo: number;
  penimbang: number;
}

export interface ParsedSheet {
  sheetName: string;
  headerInfo: ExcelHeaderInfo;
  rows: ParsedExcelRow[];
  unknownColumns: string[];
}

export interface ParsedWorkbook {
  fileName: string;
  fileHash: string;
  sheets: ParsedSheet[];
  totalRows: number;
}

export interface ParsedExcelRow {
  noSeri: string | null;
  noPolisi: string | null;
  namaRelasi: string | null;
  produk: string | null;
  timbang1Kg: number | null;
  timbang2Kg: number | null;
  netto1Kg: number | null;
  potPct: number | null;
  potKg: number | null;
  terimaKg: number | null;
  harga: number | null;
  total: number | null;
  pph: number | null;
  totalPay: number | null;
  tanggal: Date | null;
  jamMasuk: Date | null;  // Changed from string to Date
  jamKeluar: Date | null; // Changed from string to Date
  lokasiKebun: string | null;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  penimbang: string | null;
}

// ============================================================================
// CREATE INPUT TYPES (for repositories)
// ============================================================================

export interface CreatePbImportRowInput {
  batchId: string;
  sheetName: string;
  rowIndex: number;
  noSeri: string | null;
  noPolisi: string | null;
  namaRelasi: string | null;
  produk: string | null;
  timbang1Kg: number | null;
  timbang2Kg: number | null;
  netto1Kg: number | null;
  potPct: number | null;
  potKg: number | null;
  terimaKg: number | null;
  harga: number | null;
  total: number | null;
  pph: number | null;
  totalPay: number | null;
  tanggal: Date | null;
  jamMasuk: Date | null;
  jamKeluar: Date | null;
  lokasiKebun: string | null;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  penimbang: string | null;
  supplierId: string | null;
  vehicleId: string | null;
  uniqueKey: string;
}

export interface CreatePbTicketInput {
  batchId: string;
  rowId: string;
  sheetName: string;
  date: Date;
  ticketNo: string;
  vehiclePlate: string | null;
  supplierId: string | null;
  cluster: string | null;
  wbInAt: Date | null;
  wbOutAt: Date | null;
  grossKg: number;
  tareKg: number;
  netto1Kg: number;
  potPct: number;
  potKg: number;
  receiveKg: number;
  price: number;
  total: number;
  pph: number;
  totalPay: number;
  payeeName: string | null;
  bankName: string | null;
  accountNo: string | null;
  weigherName: string | null;
}

export interface ListBatchesQuery {
  page: number;
  pageSize: number;
  status?: "DRAFT" | "POSTED";
  search?: string;
  sortBy: "createdAt" | "fileName" | "status";
  sortDir: "asc" | "desc";
}

export interface ListRowsQuery {
  page: number;
  pageSize: number;
  showInvalidOnly: boolean;
}

