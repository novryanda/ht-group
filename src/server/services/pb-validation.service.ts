/**
 * PB Validation Service
 * Validates PB Import rows and provides matching suggestions
 */

import type {
  ParsedExcelRow,
  ValidationIssue,
  SupplierCandidate,
  VehicleCandidate,
  RowMatchSuggestions,
} from "~/server/types/pb-import";
import { SupplierService } from "~/server/services/supplier.service";
import { TransportRepository } from "~/server/repositories/transport.repo";

export class PbValidationService {
  /**
   * Validate a single row
   * Returns array of validation issues
   */
  static validateRow(row: ParsedExcelRow): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Required fields
    if (!row.noSeri) {
      issues.push({
        field: "noSeri",
        message: "No. Seri is required",
        severity: "error",
      });
    }

    // Tanggal is optional in Excel (will use upload date if null)
    // No validation needed here

    // Numeric validations
    if (row.timbang1Kg !== null && row.timbang1Kg < 0) {
      issues.push({
        field: "timbang1Kg",
        message: "Timbang 1 must be >= 0",
        severity: "error",
      });
    }

    if (row.timbang2Kg !== null && row.timbang2Kg < 0) {
      issues.push({
        field: "timbang2Kg",
        message: "Timbang 2 must be >= 0",
        severity: "error",
      });
    }

    if (row.netto1Kg !== null && row.netto1Kg < 0) {
      issues.push({
        field: "netto1Kg",
        message: "Netto 1 must be >= 0",
        severity: "error",
      });
    }

    if (row.potPct !== null && (row.potPct < 0 || row.potPct > 100)) {
      issues.push({
        field: "potPct",
        message: "Pot % must be between 0 and 100",
        severity: "error",
      });
    }

    if (row.potKg !== null && row.potKg < 0) {
      issues.push({
        field: "potKg",
        message: "Pot Kg must be >= 0",
        severity: "error",
      });
    }

    if (row.terimaKg !== null && row.terimaKg < 0) {
      issues.push({
        field: "terimaKg",
        message: "Terima Kg must be >= 0",
        severity: "error",
      });
    }

    // Logical validations
    if (
      row.timbang1Kg !== null &&
      row.timbang2Kg !== null &&
      row.timbang2Kg > row.timbang1Kg
    ) {
      issues.push({
        field: "timbang2Kg",
        message: "Tara (Timbang 2) cannot be greater than Bruto (Timbang 1)",
        severity: "error",
      });
    }

    // Netto1 = Bruto - Tara
    if (
      row.timbang1Kg !== null &&
      row.timbang2Kg !== null &&
      row.netto1Kg !== null
    ) {
      const expectedNetto = row.timbang1Kg - row.timbang2Kg;
      const diff = Math.abs(expectedNetto - row.netto1Kg);
      if (diff > 0.1) {
        // Allow 0.1 kg tolerance
        issues.push({
          field: "netto1Kg",
          message: `Netto1 should be ${expectedNetto.toFixed(3)} (Bruto - Tara)`,
          severity: "warning",
        });
      }
    }

    // PotKg = Netto1 * PotPct / 100
    if (
      row.netto1Kg !== null &&
      row.potPct !== null &&
      row.potKg !== null
    ) {
      const expectedPotKg = (row.netto1Kg * row.potPct) / 100;
      const diff = Math.abs(expectedPotKg - row.potKg);
      if (diff > 0.1) {
        issues.push({
          field: "potKg",
          message: `Pot Kg should be ${expectedPotKg.toFixed(3)} (Netto1 × Pot%)`,
          severity: "warning",
        });
      }
    }

    // TerimaKg = Netto1 - PotKg
    if (
      row.netto1Kg !== null &&
      row.potKg !== null &&
      row.terimaKg !== null
    ) {
      const expectedTerima = row.netto1Kg - row.potKg;
      const diff = Math.abs(expectedTerima - row.terimaKg);
      if (diff > 0.1) {
        issues.push({
          field: "terimaKg",
          message: `Terima Kg should be ${expectedTerima.toFixed(3)} (Netto1 - Pot Kg)`,
          severity: "warning",
        });
      }
    }

    // Total = TerimaKg * Harga
    if (
      row.terimaKg !== null &&
      row.harga !== null &&
      row.total !== null
    ) {
      const expectedTotal = row.terimaKg * row.harga;
      const diff = Math.abs(expectedTotal - row.total);
      if (diff > 1) {
        // Allow 1 rupiah tolerance
        issues.push({
          field: "total",
          message: `Total should be ${expectedTotal.toFixed(2)} (Terima × Harga)`,
          severity: "warning",
        });
      }
    }

    // TotalPay = Total - PPH
    if (
      row.total !== null &&
      row.pph !== null &&
      row.totalPay !== null
    ) {
      const expectedTotalPay = row.total - row.pph;
      const diff = Math.abs(expectedTotalPay - row.totalPay);
      if (diff > 1) {
        issues.push({
          field: "totalPay",
          message: `Total Pay should be ${expectedTotalPay.toFixed(2)} (Total - PPH)`,
          severity: "warning",
        });
      }
    }

    return issues;
  }

  /**
   * Get matching suggestions for a row
   */
  static async getMatchSuggestions(
    row: ParsedExcelRow
  ): Promise<RowMatchSuggestions> {
    const [supplierCandidates, vehicleCandidates] = await Promise.all([
      this.findSupplierCandidates(row.namaRelasi),
      this.findVehicleCandidates(row.noPolisi),
    ]);

    return {
      rowId: "", // Will be set by caller
      supplierCandidates,
      vehicleCandidates,
    };
  }

  /**
   * Find supplier candidates by fuzzy matching
   */
  private static async findSupplierCandidates(
    namaRelasi: string | null
  ): Promise<SupplierCandidate[]> {
    if (!namaRelasi) return [];

    try {
      const matches = await SupplierService.fuzzyFindByName(namaRelasi, 5);
      return matches.map((match) => ({
        id: match.id,
        name: match.namaPerusahaan || match.namaPemilik,
        similarity: match.similarity,
      }));
    } catch (error) {
      console.error("Error finding supplier candidates:", error);
      return [];
    }
  }

  /**
   * Find vehicle candidates by fuzzy matching
   */
  private static async findVehicleCandidates(
    noPolisi: string | null
  ): Promise<VehicleCandidate[]> {
    if (!noPolisi) return [];

    try {
      const matches = await TransportRepository.fuzzyFindVehicleByPlate(noPolisi, 5);
      return matches.map((match) => ({
        id: match.id,
        plateNo: match.plateNo,
        similarity: match.similarity,
      }));
    } catch (error) {
      console.error("Error finding vehicle candidates:", error);
      return [];
    }
  }

  /**
   * Check for duplicate serial numbers within a batch
   */
  static findDuplicates(rows: ParsedExcelRow[]): Map<string, number[]> {
    const duplicates = new Map<string, number[]>();
    const seen = new Map<string, number>();

    rows.forEach((row, index) => {
      if (!row.noSeri) return;

      const existing = seen.get(row.noSeri);
      if (existing !== undefined) {
        if (!duplicates.has(row.noSeri)) {
          duplicates.set(row.noSeri, [existing]);
        }
        duplicates.get(row.noSeri)!.push(index);
      } else {
        seen.set(row.noSeri, index);
      }
    });

    return duplicates;
  }
}

