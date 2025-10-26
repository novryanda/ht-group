/**
 * Service layer for PT PKS Mutu Produksi
 * Business logic for ingesting bulk production quality data
 */

import { mapRowToUpsert, toMutuProduksiDtoList } from "~/server/mappers/pt-pks/mutu-produksi.mapper";
import { upsertMutu, mutuProduksiRepository, type MutuProduksiFilters } from "~/server/repositories/pt-pks/mutu-produksi.repo";
import type { MutuRow, PksMutuProduksiDto } from "~/server/types/pt-pks/mutu-produksi";

/**
 * Ingest bulk rows of mutu produksi data
 * Returns count of inserted and updated records
 */
export async function ingestBulk(rows: MutuRow[]) {
  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const upsertInput = mapRowToUpsert(row);
    const res = await upsertMutu(upsertInput);
    
    // Check if it was newly created or updated
    // New records have createdAt === updatedAt
    if (res.createdAt.getTime() === res.updatedAt.getTime()) {
      inserted++;
    } else {
      updated++;
    }
  }

  return {
    upserted: inserted + updated,
    inserted,
    updated,
  };
}

/**
 * Service class for read operations
 */
export class MutuProduksiService {
  /**
   * Get mutu produksi records by filters
   * Returns mapped DTOs
   */
  async getMutuProduksiList(filters: MutuProduksiFilters): Promise<PksMutuProduksiDto[]> {
    const records = await mutuProduksiRepository.findManyByDateShift(filters);
    return toMutuProduksiDtoList(records);
  }

  /**
   * Get the latest mutu produksi record for KPI display
   */
  async getLatestMutuProduksi(): Promise<PksMutuProduksiDto | null> {
    const record = await mutuProduksiRepository.findLatest();
    if (!record) return null;
    
    return toMutuProduksiDtoList([record])[0] ?? null;
  }

  /**
   * Optional: Add aggregation methods here if needed
   * For example: getTrendData(), getAggregatedStats(), etc.
   */
}

export const mutuProduksiService = new MutuProduksiService();
