/**
 * Repository for PT PKS Mutu Produksi
 * Database operations using Prisma
 */

import { db } from "~/server/db";

type UpsertArgs = {
  rowId: string;
  tanggal: Date | null;
  shift: string;
  payload: any;
  sentAt?: Date;
  syncStatus?: string;
};

/**
 * Upsert mutu produksi data based on (tanggal, shift) unique constraint
 */
export async function upsertMutu(args: UpsertArgs) {
  if (!args.tanggal) {
    throw new Error("tanggal is required (YYYY-MM-DD)");
  }
  if (!args.shift) {
    throw new Error("shift is required");
  }

  return (db as any).pksMutuProduksi.upsert({
    where: {
      tanggal_shift: {
        tanggal: args.tanggal,
        shift: args.shift,
      },
    },
    update: {
      rowId: args.rowId,
      payload: args.payload,
      sentAt: args.sentAt,
      syncStatus: args.syncStatus,
    },
    create: {
      rowId: args.rowId,
      tanggal: args.tanggal,
      shift: args.shift,
      payload: args.payload,
      sentAt: args.sentAt,
      syncStatus: args.syncStatus,
    },
  });
}

export interface MutuProduksiFilters {
  from: Date;
  to: Date;
  shift?: "1" | "2" | "3";
}

export class MutuProduksiRepository {
  /**
   * Find all mutu produksi records by date range and optional shift
   * Sorted by tanggal ASC, then shift ASC
   */
  async findManyByDateShift(
    filters: MutuProduksiFilters
  ): Promise<any[]> {
    const { from, to, shift } = filters;

    const where: any = {
      tanggal: {
        gte: from,
        lte: to,
      },
    };

    if (shift) {
      where.shift = shift;
    }

    const records = await (db as any).pksMutuProduksi.findMany({
      where,
      orderBy: [{ tanggal: "asc" }, { shift: "asc" }],
    });

    return records;
  }

  /**
   * Find the most recent mutu produksi record (by tanggal DESC, updatedAt DESC)
   * Used for displaying the latest KPI values
   */
  async findLatest(): Promise<any | null> {
    const record = await (db as any).pksMutuProduksi.findFirst({
      orderBy: [{ tanggal: "desc" }, { updatedAt: "desc" }],
    });

    return record;
  }

  /**
   * Count total records (for debugging/monitoring)
   */
  async count(): Promise<number> {
    return (db as any).pksMutuProduksi.count();
  }
}

export const mutuProduksiRepository = new MutuProduksiRepository();
