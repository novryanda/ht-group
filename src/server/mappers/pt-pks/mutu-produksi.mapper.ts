/**
 * Mapper for PT PKS Mutu Produksi data
 * Transforms raw data from Google Sheets to database format
 */

import type { MutuRow, PksMutuProduksiDto } from "~/server/types/pt-pks/mutu-produksi";

/**
 * Converts input to date-only format (UTC midnight)
 * Handles: Date object, ISO datetime string, and "YYYY-MM-DD" format
 */
function toDateOnly(input?: string | Date): Date | null {
  if (!input) return null;

  // Jika sudah Date object
  if (input instanceof Date) {
    return new Date(
      Date.UTC(input.getFullYear(), input.getMonth(), input.getDate())
    );
  }

  const s = String(input).trim();
  if (!s) return null;

  // 1) Coba parse ISO/umum dulu (untuk format "2025-10-26T00:00:00.000Z")
  const isoTry = new Date(s);
  if (!isNaN(isoTry.getTime())) {
    // Gunakan komponen UTC supaya benar-benar date-only UTC
    return new Date(
      Date.UTC(
        isoTry.getUTCFullYear(),
        isoTry.getUTCMonth(),
        isoTry.getUTCDate()
      )
    );
  }

  // 2) Fallback: pecah "YYYY-MM-DD" (abaikan jam di belakang kalau ada)
  const [y, m, dRaw] = s.split("-");
  const d = Number((dRaw || "").slice(0, 2)); // "01T00:00:00Z" -> "01"
  const yy = Number(y);
  const mm = Number(m);
  if (!yy || !mm || !d) return null;

  return new Date(Date.UTC(yy, mm - 1, d));
}

/**
 * Converts input to DateTime format
 */
function toDateTime(input?: string | Date | null): Date | null {
  if (!input) return null;
  
  if (input instanceof Date) return new Date(input);
  
  const s = String(input).trim();
  if (!s) return null;
  
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

/**
 * Maps a raw row from Sheets to upsert input format
 */
export function mapRowToUpsert(row: MutuRow) {
  const tanggal = toDateOnly(row.tanggal);
  const shiftRaw = row.shift ?? "";
  const shift = String(shiftRaw ?? "").trim();
  const rowId = String(
    row.row_id ?? `${row.tanggal ?? "NA"}_${shift || "NA"}`
  ).trim() || crypto.randomUUID();

  const sentAt = toDateTime(row.sent_at) ?? new Date();
  
  // Automatically change DRAFT to SENT when ingested to database
  const incomingSyncStatus = row.sync_status ? String(row.sync_status) : "DRAFT";
  const syncStatus = incomingSyncStatus === "DRAFT" ? "SENT" : incomingSyncStatus;

  // Keep entire row as payload for future-proof storage
  const payload = { ...row };

  return {
    rowId,
    tanggal,
    shift,
    payload,
    sentAt,
    syncStatus,
  };
}

/**
 * Map Prisma PksMutuProduksi to DTO for read operations
 * Converts dates to ISO strings
 */
export function toMutuProduksiDto(record: any): PksMutuProduksiDto {
  return {
    id: record.id,
    rowId: record.rowId,
    tanggal: record.tanggal instanceof Date 
      ? record.tanggal.toISOString().slice(0, 10) 
      : String(record.tanggal).slice(0, 10),
    shift: record.shift,
    payload: record.payload as Record<string, unknown>,
    syncStatus: record.syncStatus ?? null,
    sentAt: record.sentAt 
      ? (record.sentAt instanceof Date 
          ? record.sentAt.toISOString() 
          : String(record.sentAt))
      : null,
    createdAt: record.createdAt instanceof Date 
      ? record.createdAt.toISOString() 
      : String(record.createdAt),
    updatedAt: record.updatedAt instanceof Date 
      ? record.updatedAt.toISOString() 
      : String(record.updatedAt),
  };
}

/**
 * Map array of Prisma records to DTOs
 */
export function toMutuProduksiDtoList(records: any[]): PksMutuProduksiDto[] {
  return records.map(toMutuProduksiDto);
}
