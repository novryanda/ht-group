/**
 * Zod schemas for PT PKS Mutu Produksi data validation
 * Validates incoming data from Google Sheets Apps Script
 */

import { z } from "zod";

export const MutuRowSchema = z
  .object({
    row_id: z.string().optional(),
    tanggal: z.union([z.string(), z.date()]).optional(),
    shift: z.union([z.string(), z.number()]).optional(),
    sent_at: z.union([z.string(), z.date()]).nullish(),
    sync_status: z.string().nullish(),
  })
  .catchall(z.any()); // Allow any additional dynamic columns from Sheets

export const BulkIngestSchema = z.object({
  mode: z.enum(["bulk", "single"]).optional(),
  rows: z.array(MutuRowSchema).nonempty("At least one row is required"),
});

/**
 * Query schema for GET /api/pt-pks/mutu-produksi
 * Supports date range and shift filtering
 */
export const mutuProduksiQuerySchema = z.object({
  from: z.string().optional(), // YYYY-MM-DD format
  to: z.string().optional(), // YYYY-MM-DD format
  shift: z.enum(["all", "1", "2", "3"]).optional().default("all"),
});

export type MutuProduksiQuery = z.infer<typeof mutuProduksiQuerySchema>;

/**
 * Sanitize and validate date range query
 * Returns Date objects with proper defaults
 */
export function sanitizeDateRange(query: MutuProduksiQuery) {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 14); // 14 days ago

  let fromDate: Date;
  let toDate: Date;

  // Parse 'from' date
  if (query.from) {
    const parsed = new Date(query.from);
    if (!isNaN(parsed.getTime())) {
      fromDate = parsed;
    } else {
      fromDate = defaultFrom;
    }
  } else {
    fromDate = defaultFrom;
  }

  // Parse 'to' date
  if (query.to) {
    const parsed = new Date(query.to);
    if (!isNaN(parsed.getTime())) {
      toDate = parsed;
    } else {
      toDate = now;
    }
  } else {
    toDate = now;
  }

  // Make 'to' inclusive (end of day)
  toDate.setHours(23, 59, 59, 999);

  // Ensure from <= to
  if (fromDate > toDate) {
    [fromDate, toDate] = [toDate, fromDate];
  }

  return {
    from: fromDate,
    to: toDate,
    shift: query.shift === "all" ? undefined : query.shift,
  };
}
