/**
 * PB Workbook Parser Service
 * Multi-sheet Excel parser with robust header normalization
 */

import * as XLSX from "xlsx";
import { createHash } from "crypto";
import type {
  ParsedWorkbook,
  ParsedSheet,
  ParsedExcelRow,
  ExcelHeaderInfo,
  ExcelColumnMapping,
} from "../types/pb-import";

// ============================================================================
// HEADER NORMALIZATION
// ============================================================================

/**
 * Normalize Excel header cell value
 * Handles: _x000D_, newlines, quotes, extra spaces, case
 */
export function normalizeHeader(raw: unknown): string {
  const s = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : "";
  return s
    .replace(/_x000D_/gi, " ") // Remove Excel carriage return code
    .replace(/\r?\n/g, " ") // Replace newlines with space
    .replace(/\r/g, " ") // Replace carriage returns
    .replace(/\s+/g, " ") // Compress multiple spaces to one
    .replace(/^"+|"+$/g, "") // Remove quotes at start/end
    .trim() // Remove leading/trailing spaces
    .toLowerCase(); // Lowercase for matching
}

/**
 * Normalize cell content (for data cells)
 */
function normalizeCell(raw: unknown): string {
  if (raw == null || raw === "") return "";
  const s = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : "";
  return s
    .replace(/_x000D_/gi, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================================
// NUMBER & DATE PARSING
// ============================================================================

/**
 * Parse number safely
 * Handles: thousand separators (.), comma decimals (,), spaces
 */
export function toNumberSafe(v: unknown): number | null {
  if (v == null || v === "") return null;
  
  // If already a number
  if (typeof v === "number") {
    return Number.isFinite(v) ? v : null;
  }

  // String parsing
  const s = (typeof v === 'string' || typeof v === 'number' ? String(v) : "")
    .replace(/_x000D_/gi, "")
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/\./g, "") // Remove thousand separators
    .replace(/,/g, "."); // Replace comma decimal with dot

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse Excel date
 * Handles: Excel serial numbers, ISO strings, DD/MM/YYYY, DD-MM-YYYY
 */
function parseExcelDate(v: unknown): Date | null {
  if (v == null || v === "") return null;

  // If already a Date
  if (v instanceof Date) {
    return isNaN(v.getTime()) ? null : v;
  }

  // Excel serial number
  if (typeof v === "number") {
    const date = XLSX.SSF.parse_date_code(v);
    if (date) {
      return new Date(date.y, date.m - 1, date.d);
    }
    return null;
  }

  // String parsing
  const s = normalizeCell(v);
  if (!s) return null;

  // Try ISO format first
  const isoDate = new Date(s);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = s.split(/[\/\-]/);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
      return new Date(year, month - 1, day);
    }
  }

  return null;
}

/**
 * Parse time and combine with date
 * Handles: HH:mm, HH:mm:ss, Excel time serial
 */
function parseExcelTime(timeValue: unknown, baseDate: Date | null): Date | null {
  if (timeValue == null || timeValue === "") return null;
  if (!baseDate) return null;

  // Excel time serial (fraction of day)
  if (typeof timeValue === "number") {
    const hours = Math.floor(timeValue * 24);
    const minutes = Math.floor((timeValue * 24 * 60) % 60);
    const seconds = Math.floor((timeValue * 24 * 60 * 60) % 60);
    
    const result = new Date(baseDate);
    result.setHours(hours, minutes, seconds, 0);
    return result;
  }

  // String parsing (HH:mm or HH:mm:ss)
  const s = normalizeCell(timeValue);
  const timeParts = s.split(":");
  if (timeParts.length >= 2 && timeParts[0] && timeParts[1]) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const result = new Date(baseDate);
      result.setHours(hours, minutes, seconds, 0);
      return result;
    }
  }

  return null;
}

// ============================================================================
// COLUMN MAPPING
// ============================================================================

/**
 * Canonical column alias map
 * Maps normalized headers to field names
 */
const PB_COLUMN_ALIAS: Record<string, keyof ExcelColumnMapping> = {
  // No. Seri
  "no. seri": "noSeri",
  "no seri": "noSeri",
  "seri": "noSeri",
  "no.seri": "noSeri",
  "noseri": "noSeri",
  "ticket no": "noSeri",
  
  // No. Polisi
  "no. polisi": "noPolisi",
  "no polisi": "noPolisi",
  "polisi": "noPolisi",
  "no.polisi": "noPolisi",
  "nopolisi": "noPolisi",
  "plat": "noPolisi",
  "plate": "noPolisi",
  
  // Nama Relasi
  "nama relasi": "namaRelasi",
  "namarelasi": "namaRelasi",
  "relasi": "namaRelasi",
  "supplier": "namaRelasi",
  "nama supplier": "namaRelasi",
  
  // Produk
  "produk": "produk",
  "product": "produk",
  "jenis": "produk",
  
  // Berat Timbang 1 (Bruto/Gross)
  "berat timbang 1": "timbang1",
  "timbang 1": "timbang1",
  "timbang1": "timbang1",
  "bruto": "timbang1",
  "gross": "timbang1",
  "gross weight": "timbang1",
  "berat bruto": "timbang1",
  
  // Berat Timbang 2 (Tara)
  "berat timbang 2": "timbang2",
  "timbang 2": "timbang2",
  "timbang2": "timbang2",
  "tara": "timbang2",
  "tare": "timbang2",
  "tare weight": "timbang2",
  "berat tara": "timbang2",
  
  // Netto1
  "netto1": "netto1",
  "netto 1": "netto1",
  "netto": "netto1",
  "net": "netto1",
  "net weight": "netto1",
  "berat netto": "netto1",
  
  // Potongan %
  "berat pot (%)": "potPct",
  "pot (%)": "potPct",
  "pot %": "potPct",
  "potongan %": "potPct",
  "potongan persen": "potPct",
  "% pot": "potPct",
  
  // Potongan kg
  "berat pot (kg)": "potKg",
  "pot (kg)": "potKg",
  "pot kg": "potKg",
  "potongan kg": "potKg",
  "potongan": "potKg",
  
  // Berat Terima
  "berat terima": "terima",
  "terima": "terima",
  "receive": "terima",
  "received": "terima",
  "berat diterima": "terima",
  
  // Harga
  "harga": "harga",
  "price": "harga",
  "harga satuan": "harga",
  "unit price": "harga",
  
  // Total
  "total": "total",
  "jumlah": "total",
  "amount": "total",
  "total harga": "total",
  
  // PPH
  "pph": "pph",
  "total pph": "pph",
  "totalpph": "pph",
  "pajak": "pph",
  "tax": "pph",
  
  // Total Pembayaran
  "total pembayaran ke suplier": "totalPay",
  "total pembayaran": "totalPay",
  "pembayaran": "totalPay",
  "payment": "totalPay",
  "total bayar": "totalPay",
  "net payment": "totalPay",
  
  // Tanggal
  "tanggal": "tanggal",
  "tgl": "tanggal",
  "date": "tanggal",
  
  // Jam Masuk
  "jam masuk": "jamMasuk",
  "jammasuk": "jamMasuk",
  "masuk": "jamMasuk",
  "time in": "jamMasuk",
  "in": "jamMasuk",
  
  // Jam Keluar
  "jam keluar": "jamKeluar",
  "jamkeluar": "jamKeluar",
  "keluar": "jamKeluar",
  "time out": "jamKeluar",
  "out": "jamKeluar",
  
  // Lokasi Kebun
  "lokasi kebun": "lokasiKebun",
  "lokasikebun": "lokasiKebun",
  "kebun": "lokasiKebun",
  "lokasi": "lokasiKebun",
  "location": "lokasiKebun",
  "cluster": "lokasiKebun",
  
  // Nama (Payee)
  "nama": "payeeName",
  "payee": "payeeName",
  "penerima": "payeeName",
  
  // Bank
  "bank": "bankName",
  "nama bank": "bankName",
  
  // No. Rekening
  "no. rekening": "accountNo",
  "no rekening": "accountNo",
  "rekening": "accountNo",
  "account": "accountNo",
  "account no": "accountNo",
  
  // Penimbang
  "penimbang": "penimbang",
  "weigher": "penimbang",
  "operator": "penimbang",
};

/**
 * Find header row in sheet
 * Scans rows 1-10 for row containing "no. seri" AND "no. polisi"
 */
export function findHeaderRow(
  getRowValues: (rowIndex: number) => unknown[],
  maxScan = 10
): number {
  for (let r = 1; r <= maxScan; r++) {
    const vals = getRowValues(r).map(normalizeHeader);
    const hasNoSeri = vals.some((h) =>
      ["no. seri", "no seri", "seri", "noseri"].includes(h)
    );
    const hasNoPolisi = vals.some((h) =>
      ["no. polisi", "no polisi", "polisi", "nopolisi"].includes(h)
    );
    
    if (hasNoSeri && hasNoPolisi) {
      return r;
    }
  }
  
  throw new Error(
    "Header PB tidak ditemukan. Pastikan sheet memiliki kolom 'No. Seri' dan 'No. Polisi'."
  );
}

/**
 * Map column headers to field indices
 */
function mapColumns(
  headerCells: unknown[]
): { mapping: Partial<ExcelColumnMapping>; unknownColumns: string[] } {
  const mapping: Partial<ExcelColumnMapping> = {};
  const unknownColumns: string[] = [];
  const normalized = headerCells.map(normalizeHeader);

  normalized.forEach((header, index) => {
    if (!header) return;

    const fieldName = PB_COLUMN_ALIAS[header];
    if (fieldName) {
      mapping[fieldName] = index;
    } else {
      unknownColumns.push(String(headerCells[index]));
    }
  });

  return { mapping, unknownColumns };
}

/**
 * Extract header info from first few rows
 * Looks for period dates and print date
 */
function extractHeaderInfo(
  sheet: XLSX.WorkSheet,
  headerRowIndex: number
): ExcelHeaderInfo {
  const info: ExcelHeaderInfo = {
    reportTitle: null,
    periodFrom: null,
    periodTo: null,
    printedAt: null,
    headerRowIndex,
  };

  // Scan rows before header for metadata
  for (let r = 0; r < headerRowIndex; r++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    const cellB = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
    const cellC = sheet[XLSX.utils.encode_cell({ r, c: 2 })];

    const textA = normalizeCell(cellA?.v);
    const textB = normalizeCell(cellB?.v);
    const textC = normalizeCell(cellC?.v);

    // Look for "Periode: DD/MM/YYYY - DD/MM/YYYY"
    if (textA.includes("periode") || textB.includes("periode")) {
      const text = textA + " " + textB + " " + textC;
      const dateMatches = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g);
      if (dateMatches && dateMatches.length >= 2) {
        info.periodFrom = parseExcelDate(dateMatches[0]);
        info.periodTo = parseExcelDate(dateMatches[1]);
      }
    }

    // Look for "Tanggal Cetak: DD/MM/YYYY"
    if (
      textA.includes("tanggal cetak") ||
      textA.includes("printed") ||
      textB.includes("tanggal cetak")
    ) {
      const text = textA + " " + textB + " " + textC;
      const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/;
      const dateMatch = dateRegex.exec(text);
      if (dateMatch) {
        info.printedAt = parseExcelDate(dateMatch[1]);
      }
    }

    // Report title (usually first row)
    if (r === 0 && textA && !info.reportTitle) {
      info.reportTitle = textA;
    }
  }

  return info;
}

/**
 * Check if row is empty (3 consecutive empty rows = end of data)
 */
function isRowEmpty(row: unknown[]): boolean {
  return row.every((cell) => {
    if (cell == null) return true;
    const str = typeof cell === 'string' || typeof cell === 'number' ? String(cell) : "";
    return str.trim() === "";
  });
}

/**
 * Parse single sheet
 */
function parseSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  fileHash: string
): ParsedSheet {
  // Find header row
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
  const getRowValues = (rowIndex: number): unknown[] => {
    const row: unknown[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex - 1, c })];
      row.push(cell?.v);
    }
    return row;
  };

  const headerRowIndex = findHeaderRow(getRowValues);
  const headerCells = getRowValues(headerRowIndex);
  const { mapping, unknownColumns } = mapColumns(headerCells);
  const headerInfo = extractHeaderInfo(sheet, headerRowIndex);

  // Debug logging
  console.log(`[PB Parser] Sheet "${sheetName}" - Header row: ${headerRowIndex}`);
  console.log(`[PB Parser] Sheet "${sheetName}" - Column mapping:`, {
    tanggal: mapping.tanggal != null ? `Column ${mapping.tanggal} (${headerCells[mapping.tanggal]})` : "NOT FOUND (will use upload date)",
    noSeri: mapping.noSeri != null ? `Column ${mapping.noSeri}` : "NOT FOUND",
    noPolisi: mapping.noPolisi != null ? `Column ${mapping.noPolisi}` : "NOT FOUND",
  });
  if (unknownColumns.length > 0) {
    console.log(`[PB Parser] Sheet "${sheetName}" - Unknown columns:`, unknownColumns);
  }

  // Parse data rows
  const rows: ParsedExcelRow[] = [];
  let emptyRowCount = 0;
  const maxEmptyRows = 3;

  for (let r = headerRowIndex; r <= range.e.r + 1; r++) {
    const rowValues = getRowValues(r + 1);

    // Check for empty row
    if (isRowEmpty(rowValues)) {
      emptyRowCount++;
      if (emptyRowCount >= maxEmptyRows) {
        break; // Stop parsing after 3 consecutive empty rows
      }
      continue;
    }

    emptyRowCount = 0; // Reset counter

    // Parse row (tanggal is optional - will use upload date if null)
    const tanggal = mapping.tanggal != null
      ? parseExcelDate(rowValues[mapping.tanggal])
      : null;

    const jamMasuk = mapping.jamMasuk != null
      ? parseExcelTime(rowValues[mapping.jamMasuk], tanggal)
      : null;

    const jamKeluar = mapping.jamKeluar != null
      ? parseExcelTime(rowValues[mapping.jamKeluar], tanggal)
      : null;

    const parsedRow: ParsedExcelRow = {
      noSeri: mapping.noSeri != null ? normalizeCell(rowValues[mapping.noSeri]) || null : null,
      noPolisi: mapping.noPolisi != null ? normalizeCell(rowValues[mapping.noPolisi]) || null : null,
      namaRelasi: mapping.namaRelasi != null ? normalizeCell(rowValues[mapping.namaRelasi]) || null : null,
      produk: mapping.produk != null ? normalizeCell(rowValues[mapping.produk]) || null : null,
      timbang1Kg: mapping.timbang1 != null ? toNumberSafe(rowValues[mapping.timbang1]) : null,
      timbang2Kg: mapping.timbang2 != null ? toNumberSafe(rowValues[mapping.timbang2]) : null,
      netto1Kg: mapping.netto1 != null ? toNumberSafe(rowValues[mapping.netto1]) : null,
      potPct: mapping.potPct != null ? toNumberSafe(rowValues[mapping.potPct]) : null,
      potKg: mapping.potKg != null ? toNumberSafe(rowValues[mapping.potKg]) : null,
      terimaKg: mapping.terima != null ? toNumberSafe(rowValues[mapping.terima]) : null,
      harga: mapping.harga != null ? toNumberSafe(rowValues[mapping.harga]) : null,
      total: mapping.total != null ? toNumberSafe(rowValues[mapping.total]) : null,
      pph: mapping.pph != null ? toNumberSafe(rowValues[mapping.pph]) : null,
      totalPay: mapping.totalPay != null ? toNumberSafe(rowValues[mapping.totalPay]) : null,
      tanggal,
      jamMasuk,
      jamKeluar,
      lokasiKebun: mapping.lokasiKebun != null ? normalizeCell(rowValues[mapping.lokasiKebun]) || null : null,
      payeeName: mapping.payeeName != null ? normalizeCell(rowValues[mapping.payeeName]) || null : null,
      bankName: mapping.bankName != null ? normalizeCell(rowValues[mapping.bankName]) || null : null,
      accountNo: mapping.accountNo != null ? normalizeCell(rowValues[mapping.accountNo]) || null : null,
      penimbang: mapping.penimbang != null ? normalizeCell(rowValues[mapping.penimbang]) || null : null,
    };

    rows.push(parsedRow);
  }

  return {
    sheetName,
    headerInfo,
    rows,
    unknownColumns,
  };
}

/**
 * Parse entire workbook (all sheets)
 */
export function parseWorkbook(buffer: Buffer, fileName: string): ParsedWorkbook {
  // Calculate file hash
  const fileHash = createHash("sha256").update(buffer).digest("hex");

  // Read workbook
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });

  // Parse all sheets
  const sheets: ParsedSheet[] = [];
  let totalRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    try {
      const parsedSheet = parseSheet(sheet, sheetName, fileHash);
      sheets.push(parsedSheet);
      totalRows += parsedSheet.rows.length;
    } catch (error) {
      console.error(`[PB Parser] Error parsing sheet "${sheetName}":`, error);
      // Continue with other sheets
    }
  }

  if (sheets.length === 0) {
    throw new Error("Tidak ada sheet yang berhasil di-parse. Periksa format Excel.");
  }

  return {
    fileName,
    fileHash,
    sheets,
    totalRows,
  };
}

