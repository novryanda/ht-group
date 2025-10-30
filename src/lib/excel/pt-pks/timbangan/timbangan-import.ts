/**
 * Timbangan Excel Import Parser
 * Field names as column headers, data in rows below
 */

import * as XLSX from "xlsx";

export interface TimbanganPricingRow {
  noSeri: string;
  hargaPerKg: number;
  pphRate: number;
  upahBongkarPerKg: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  data: TimbanganPricingRow[];
  errors: ValidationError[];
}

/**
 * Parse Excel file for Timbangan Pricing
 * Expected format:
 * Row 1: Headers (noSeri, hargaPerKg, pphRate, upahBongkarPerKg)
 * Row 2+: Data rows
 */
export async function parseTimbanganExcel(
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
            raw: false,
          }
        );

        const result: ImportResult = {
          data: [],
          errors: [],
        };

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2;

          try {
            const parsed: Partial<TimbanganPricingRow> = {
              noSeri: String(row["noSeri"] ?? row["No. Seri"] ?? "").trim(),
              hargaPerKg: parseFloat(
                String(row["hargaPerKg"] ?? row["Harga Per Kg"] ?? row["harga"] ?? "0")
              ),
              pphRate: parseFloat(
                String(row["pphRate"] ?? row["PPh %"] ?? row["pph"] ?? "0")
              ),
              upahBongkarPerKg: parseFloat(
                String(
                  row["upahBongkarPerKg"] ??
                    row["Upah Bongkar Per Kg"] ??
                    row["upah"] ??
                    "0"
                )
              ),
            };

            const rowErrors = validateTimbanganRow(parsed, rowNumber);

            if (rowErrors.length > 0) {
              result.errors.push(...rowErrors);
            } else {
              result.data.push(parsed as TimbanganPricingRow);
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

function validateTimbanganRow(
  row: Partial<TimbanganPricingRow>,
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

  if (!row.hargaPerKg || row.hargaPerKg <= 0) {
    errors.push({
      row: rowNumber,
      field: "hargaPerKg",
      message: "Harga Per Kg harus > 0",
    });
  }

  if (row.pphRate !== undefined && (row.pphRate < 0 || row.pphRate > 100)) {
    errors.push({
      row: rowNumber,
      field: "pphRate",
      message: "PPh % harus antara 0-100 (contoh: 1.5 untuk 1.5%)",
    });
  }

  if (row.upahBongkarPerKg !== undefined && row.upahBongkarPerKg < 0) {
    errors.push({
      row: rowNumber,
      field: "upahBongkarPerKg",
      message: "Upah Bongkar tidak boleh negatif",
    });
  }

  return errors;
}

