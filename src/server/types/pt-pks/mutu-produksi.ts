/**
 * Types for PT PKS Mutu Produksi (Production Quality Data)
 * Data ingested from Google Sheets via Apps Script
 */

export type MutuRow = Record<string, unknown> & {
  row_id?: string;
  tanggal?: string | Date;
  shift?: string | number;
  sent_at?: string | Date | null;
  sync_status?: string | null;
};

export type BulkIngestBody = {
  mode?: "bulk" | "single";
  rows: MutuRow[];
};

export type IngestResult = {
  ok: true;
  upserted: number;
  inserted: number;
  updated: number;
};

/**
 * DTO for reading/displaying mutu produksi data
 */
export type PksMutuProduksiDto = {
  id: string;
  rowId: string;
  tanggal: string; // ISO date (YYYY-MM-DD)
  shift: string;
  payload: Record<string, unknown>;
  syncStatus?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Payload keys that we care about for display
 */
export type MutuPayloadKeys = {
  // A_TBS section
  A_TBS_tbs_diolah_hari?: string | number | null;
  A_TBS_tbs_diolah_sd?: string | number | null;
  A_TBS_oer_hari?: string | number | null;
  A_TBS_oer_sd?: string | number | null;

  // C_CPO section
  C_cpo_produksi_hari?: string | number | null;
  C_cpo_produksi_sd?: string | number | null;
  C_ffa_hari?: string | number | null;
  C_moisture_hari?: string | number | null;
  C_dirt_hari?: string | number | null;
  C_dobi_hari?: string | number | null;

  // D_Kernel section
  D_moisture_hari?: string | number | null;
  D_dirt_hari?: string | number | null;
  D_broken_kernel_hari?: string | number | null;
};

/**
 * KPI Card data structure
 */
export type KpiCardData = {
  label: string;
  value: number | null;
  suffix: string;
  description?: string;
};

/**
 * Chart data point
 */
export type ChartDataPoint = {
  tanggal: string; // YYYY-MM-DD
  value: number;
  count?: number; // for averaging
};

/**
 * Aggregated data by date (for charts)
 */
export type AggregatedByDate = {
  tbsDiolah: ChartDataPoint[];
  oer: ChartDataPoint[];
  cpoProduksi: ChartDataPoint[];
};
