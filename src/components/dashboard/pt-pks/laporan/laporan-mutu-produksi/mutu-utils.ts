/**
 * Utility functions for Mutu Produksi components
 * Number parsing and payload value extraction
 */

/**
 * Convert a value to number, handling comma decimal separator
 * Returns null if value is empty, null, or invalid
 */
export function num(v: unknown): number | null {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

/**
 * Safely get a numeric value from payload by key
 */
export function val(p: Record<string, any> | undefined, key: string): number | null {
  return p ? num((p as any)[key]) : null;
}

/**
 * Format number with suffix for display
 */
export function formatValue(value: number | null, suffix: string): string {
  if (value === null) return "-";
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${suffix}`;
}

/**
 * Get badge variant based on sync status
 */
export function getSyncStatusVariant(status?: string | null): "default" | "secondary" | "outline" {
  if (!status) return "secondary";
  if (status === "SENT") return "default";
  if (status === "DRAFT") return "secondary";
  return "outline";
}

/**
 * Aggregate data by date for charts
 * TBS: sum across shifts
 * OER: average across shifts
 */
export function aggregateByDate(
  data: Array<{ tanggal: string; payload: Record<string, unknown> }>
) {
  const grouped = new Map<
    string,
    {
      tbsSum: number;
      oerSum: number;
      oerCount: number;
      cpoSum: number;
    }
  >();

  for (const item of data) {
    const date = item.tanggal;
    const tbs = val(item.payload, "A_TBS_tbs_diolah_hari") ?? 0;
    const oer = val(item.payload, "A_TBS_oer_hari");
    const cpo = val(item.payload, "C_cpo_produksi_hari") ?? 0;

    if (!grouped.has(date)) {
      grouped.set(date, {
        tbsSum: 0,
        oerSum: 0,
        oerCount: 0,
        cpoSum: 0,
      });
    }

    const entry = grouped.get(date)!;
    entry.tbsSum += tbs;
    entry.cpoSum += cpo;
    if (oer !== null) {
      entry.oerSum += oer;
      entry.oerCount += 1;
    }
  }

  const tbsDiolah = Array.from(grouped.entries())
    .map(([tanggal, data]) => ({
      tanggal,
      value: data.tbsSum,
    }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const oer = Array.from(grouped.entries())
    .map(([tanggal, data]) => ({
      tanggal,
      value: data.oerCount > 0 ? data.oerSum / data.oerCount : 0,
    }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const cpoProduksi = Array.from(grouped.entries())
    .map(([tanggal, data]) => ({
      tanggal,
      value: data.cpoSum,
    }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  return { tbsDiolah, oer, cpoProduksi };
}
