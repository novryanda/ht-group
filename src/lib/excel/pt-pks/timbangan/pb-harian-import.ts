/**
 * PB Harian Excel Import Parser
 * Field names as column headers, data in rows below
 */

import * as XLSX from "xlsx";

export interface PBHarianRow {
  noSeri: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar?: string;
  plateNo: string;
  namaPemilik: string;
  productName: string;
  timbang1: number;
  timbang2: number;
  potPercent: number;
  penimbang?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  data: PBHarianRow[];
  errors: ValidationError[];
}

/**
 * Parse Excel file for PB Harian
 * Expected format:
 * Row 1: Headers (noSeri, tanggal, jamMasuk, ...)
 * Row 2+: Data rows
 */
export async function parsePBHarianExcel(
  file: File
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          reject(new Error("Excel file is empty"));
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          reject(new Error("Worksheet not found"));
          return;
        }

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
          worksheet,
          {
            raw: false, // Get formatted strings
            dateNF: "yyyy-mm-dd", // Date format
          }
        );

        const result: ImportResult = {
          data: [],
          errors: [],
        };

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // Excel row (header = 1, data starts at 2)

          try {
            // Map columns - field names as headers
            const parsed: Partial<PBHarianRow> = {
              noSeri: String(row["noSeri"] ?? row["No. Seri"] ?? "").trim(),
              tanggal: parseExcelDate(row["tanggal"] ?? row["Tanggal"]),
              jamMasuk: parseExcelDateTime(
                row["jamMasuk"] ?? row["Jam Masuk"]
              ),
              jamKeluar: row["jamKeluar"] ?? row["Jam Keluar"]
                ? parseExcelDateTime(row["jamKeluar"] ?? row["Jam Keluar"])
                : undefined,
              plateNo: String(
                row["plateNo"] ?? row["Plat Nomor"] ?? row["plateNo"] ?? ""
              ).trim(),
              namaPemilik: String(
                row["namaPemilik"] ??
                  row["Nama Supplier"] ??
                  row["supplier"] ??
                  ""
              ).trim(),
              productName: String(
                row["productName"] ?? row["Produk"] ?? row["item"] ?? ""
              ).trim(),
              timbang1: parseFloat(
                String(row["timbang1"] ?? row["Timbang 1"] ?? "0")
              ),
              timbang2: parseFloat(
                String(row["timbang2"] ?? row["Timbang 2"] ?? "0")
              ),
              potPercent: parseFloat(
                String(row["potPercent"] ?? row["Potongan %"] ?? row["Pot %"] ?? "0")
              ),
              penimbang: row["penimbang"] ?? row["Penimbang"]
                ? String(row["penimbang"] ?? row["Penimbang"]).trim()
                : undefined,
            };

            // Validation
            const rowErrors = validatePBHarianRow(parsed, rowNumber);

            if (rowErrors.length > 0) {
              result.errors.push(...rowErrors);
            } else {
              result.data.push(parsed as PBHarianRow);
            }
          } catch (error) {
            result.errors.push({
              row: rowNumber,
              field: "parse",
              message: `Error parsing row: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
          }
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

function validatePBHarianRow(
  row: Partial<PBHarianRow>,
  rowNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!row.noSeri) {
    errors.push({
      row: rowNumber,
      field: "noSeri",
      message: "No. Seri wajib diisi",
    });
  }

  if (!row.tanggal) {
    errors.push({
      row: rowNumber,
      field: "tanggal",
      message: "Tanggal wajib diisi",
    });
  }

  if (!row.jamMasuk) {
    errors.push({
      row: rowNumber,
      field: "jamMasuk",
      message: "Jam Masuk wajib diisi",
    });
  }

  if (!row.plateNo) {
    errors.push({
      row: rowNumber,
      field: "plateNo",
      message: "Plat Nomor wajib diisi",
    });
  }

  if (!row.namaPemilik) {
    errors.push({
      row: rowNumber,
      field: "namaPemilik",
      message: "Nama Supplier wajib diisi",
    });
  }

  if (!row.productName) {
    errors.push({
      row: rowNumber,
      field: "productName",
      message: "Produk wajib diisi",
    });
  }

  if (!row.timbang1 || row.timbang1 <= 0) {
    errors.push({
      row: rowNumber,
      field: "timbang1",
      message: "Timbang 1 harus > 0",
    });
  }

  if (!row.timbang2 || row.timbang2 <= 0) {
    errors.push({
      row: rowNumber,
      field: "timbang2",
      message: "Timbang 2 harus > 0",
    });
  }

  if (
    row.potPercent !== undefined &&
    (row.potPercent < 0 || row.potPercent > 1)
  ) {
    errors.push({
      row: rowNumber,
      field: "potPercent",
      message: "Potongan % harus antara 0-1 (contoh: 0.05 untuk 5%)",
    });
  }

  return errors;
}

function parseExcelDate(value: unknown): string {
  if (!value) return "";

  // If already string in YYYY-MM-DD format
  if (typeof value === "string") {
    // Try various date formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    // Try DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const parts = value.split("/");
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // If Excel serial date number
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }

  // Try parsing as Date
  try {
    const parsed = new Date(value as string | number);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Ignore parse errors
  }

  return "";
}

function parseExcelDateTime(value: unknown): string {
  if (!value) return "";

  // If already string in ISO format
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)
  ) {
    return value.replace(" ", "T").slice(0, 16); // YYYY-MM-DDTHH:mm
  }

  // If Excel serial date number
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}T${String(date.H).padStart(2, "0")}:${String(date.M).padStart(2, "0")}`;
  }

  // Try parsing as Date
  try {
    const parsed = new Date(value as string | number);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 16);
    }
  } catch {
    // Ignore parse errors
  }

  return "";
}

