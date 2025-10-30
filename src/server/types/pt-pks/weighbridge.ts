/**
 * Types & DTOs for Weighbridge Ticket System
 * Two-phase input: PB Harian (weighing) → Timbangan (pricing)
 */

// import type { Decimal } from "@prisma/client"; // Prisma does not export Decimal type

// ============================================
// DTOs for API Responses
// ============================================

export interface WeighbridgeTicketDTO {
  id: string;
  companyId: string;
  noSeri: string;
  vehicleId: string;
  supplierId: string;
  itemId: string;
  tanggal: string; // ISO date
  jamMasuk: string; // ISO datetime
  jamKeluar: string | null;
  timbang1: number;
  timbang2: number;
  netto1: number;
  potPercent: number;
  potKg: number;
  beratTerima: number;
  lokasiKebun: string | null;
  penimbang: string | null;
  hargaPerKg: number;
  pphRate: number;
  upahBongkarPerKg: number;
  total: number;
  totalPph: number;
  totalUpahBongkar: number;
  totalPembayaranSupplier: number;
  status: "DRAFT" | "APPROVED" | "POSTED";
  purchaseJeId: string | null;
  unloadJeId: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;

  // Relations
  vehicle?: VehicleInfoDTO;
  supplier?: SupplierInfoDTO;
  item?: ItemInfoDTO;
}

export interface VehicleInfoDTO {
  id: string;
  plateNo: string;
  type: string;
  capacityTons: number | null;
}

export interface SupplierInfoDTO {
  id: string;
  namaPemilik: string;
  namaPerusahaan: string | null;
  alamatRampPeron: string | null;
  lokasiKebun: string | null; // from profilKebun JSON
  bankName: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
}

export interface ItemInfoDTO {
  id: string;
  sku: string;
  name: string;
}

// ============================================
// Input DTOs
// ============================================

/**
 * Phase 1: PB Harian (Weighing Input)
 * Fields entered at weighbridge station
 */
export interface CreatePBHarianDTO {
  companyId: string;
  noSeri: string;
  vehicleId: string;
  supplierId: string;
  itemId: string;
  tanggal: string | Date;
  jamMasuk: string | Date;
  jamKeluar?: string | Date | null;
  timbang1: number;
  timbang2: number;
  netto1: number;
  potPercent: number;
  potKg: number;
  beratTerima: number;
  lokasiKebun?: string | null;
  penimbang?: string | null;
}

/**
 * Phase 2: Timbangan (Pricing Input)
 * Fields entered for pricing & payment calculation
 */
export interface UpdateTimbanganPricingDTO {
  hargaPerKg: number;
  pphRate: number;
  upahBongkarPerKg: number;
}

/**
 * Bulk create for inline editable table
 */
export interface BulkCreatePBHarianDTO {
  tickets: CreatePBHarianDTO[];
}

// ============================================
// Query/Filter DTOs
// ============================================

export interface WeighbridgeQueryDTO {
  companyId: string;
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  vehicleId?: string;
  itemId?: string;
  status?: "DRAFT" | "APPROVED" | "POSTED";
  page?: number;
  pageSize?: number;
}

// ============================================
// Calculation Result
// ============================================

export interface WeighbridgeCalculation {
  beratTerima: number;
  hargaPerKg: number;
  upahBongkarPerKg: number;
  pphRate: number;
  total: number; // beratTerima * hargaPerKg
  totalUpahBongkar: number; // beratTerima * upahBongkarPerKg
  totalPph: number; // total * pphRate
  totalPembayaranSupplier: number; // total - totalPph
}

// ============================================
// Lookup/Reference DTOs
// ============================================

export interface VehicleLookupDTO {
  id: string;
  plateNo: string;
  type: string;
  transporterId: string;
  transporterName: string;
}

export interface SupplierLookupDTO {
  id: string;
  namaPemilik: string;
  namaPerusahaan: string | null;
  typeSupplier: string;
  pajakPKP: string;
  alamatRampPeron: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
}

export interface ItemLookupDTO {
  id: string;
  sku: string;
  name: string;
  categoryName: string;
}
