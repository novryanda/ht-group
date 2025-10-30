/**
 * Zod Validation Schemas for Weighbridge Ticket
 */

import { z } from "zod";

// ============================================
// Phase 1: PB Harian (Weighing Input)
// ============================================

export const createPBHarianSchema = z.object({
  companyId: z.string().min(1, "Company ID wajib diisi"),
  noSeri: z.string().min(1, "No. Seri wajib diisi"),
  vehicleId: z.string().min(1, "Kendaraan wajib dipilih"),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  itemId: z.string().min(1, "Produk wajib dipilih"),
  tanggal: z.coerce.date(),
  jamMasuk: z.coerce.date(),
  jamKeluar: z.coerce.date().nullable().optional(),
  timbang1: z.number().min(0, "Timbang 1 harus >= 0"),
  timbang2: z.number().min(0, "Timbang 2 harus >= 0"),
  netto1: z.number().min(0, "Netto 1 harus >= 0"),
  potPercent: z.number().min(0).max(1, "Potongan % harus 0-1 (0-100%)"),
  potKg: z.number().min(0, "Potongan Kg harus >= 0"),
  beratTerima: z.number().min(0, "Berat terima harus >= 0"),
  lokasiKebun: z.string().nullable().optional(),
  penimbang: z.string().nullable().optional(),
});

export const bulkCreatePBHarianSchema = z.object({
  tickets: z.array(createPBHarianSchema).min(1, "Minimal 1 tiket"),
});

// ============================================
// Phase 2: Timbangan (Pricing Input)
// ============================================

export const updateTimbanganPricingSchema = z.object({
  hargaPerKg: z.number().min(0, "Harga per kg harus >= 0"),
  pphRate: z.number().min(0).max(1, "PPh rate harus 0-1 (0-100%)"),
  upahBongkarPerKg: z.number().min(0, "Upah bongkar per kg harus >= 0"),
});

// ============================================
// Query/Filter Schemas
// ============================================

export const weighbridgeQuerySchema = z.object({
  companyId: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  supplierId: z.string().optional(),
  vehicleId: z.string().optional(),
  itemId: z.string().optional(),
  status: z.enum(["DRAFT", "APPROVED", "POSTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// Validation Helpers
// ============================================

export function validateCalculations(data: {
  timbang1: number;
  timbang2: number;
  netto1: number;
  potPercent: number;
  potKg: number;
  beratTerima: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate netto1 = abs(timbang1 - timbang2)
  const expectedNetto = Math.abs(data.timbang1 - data.timbang2);
  if (Math.abs(data.netto1 - expectedNetto) > 0.01) {
    errors.push(`Netto 1 (${data.netto1}) harus sama dengan |Timbang1 - Timbang2| (${expectedNetto})`);
  }

  // Validate potKg = netto1 * potPercent
  const expectedPotKg = data.netto1 * data.potPercent;
  if (Math.abs(data.potKg - expectedPotKg) > 0.01) {
    errors.push(`Potongan Kg (${data.potKg}) harus sama dengan Netto1 × Potongan% (${expectedPotKg.toFixed(2)})`);
  }

  // Validate beratTerima = netto1 - potKg
  const expectedBeratTerima = data.netto1 - data.potKg;
  if (Math.abs(data.beratTerima - expectedBeratTerima) > 0.01) {
    errors.push(`Berat Terima (${data.beratTerima}) harus sama dengan Netto1 - Potongan Kg (${expectedBeratTerima.toFixed(2)})`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculatePricing(
  beratTerima: number,
  hargaPerKg: number,
  upahBongkarPerKg: number,
  pphRate: number
) {
  const total = beratTerima * hargaPerKg;
  const totalUpahBongkar = beratTerima * upahBongkarPerKg;
  const totalPph = total * pphRate;
  const totalPembayaranSupplier = total - totalPph;

  return {
    total: Math.round(total * 100) / 100,
    totalUpahBongkar: Math.round(totalUpahBongkar * 100) / 100,
    totalPph: Math.round(totalPph * 100) / 100,
    totalPembayaranSupplier: Math.round(totalPembayaranSupplier * 100) / 100,
  };
}
