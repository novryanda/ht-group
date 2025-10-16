/**
 * PB Import Application API
 * Tier 2 - Application Services Layer
 */

import crypto from "crypto";
import { Decimal } from "@prisma/client/runtime/library";
import { parseWorkbook } from "~/server/services/pb-workbook-parser.service";
import { PbValidationService } from "~/server/services/pb-validation.service";
import {
  PbImportBatchRepository,
  PbImportRowRepository,
  PbTicketRepository,
} from "~/server/repositories/pb-import.repo";
import type {
  UploadPbExcelResponse,
  PreviewBatchResponse,
  CommitBatchResponse,
  PbImportRowDTO,
  CreatePbImportRowInput,
  CreatePbTicketInput,
  MapRowRequest,
  CommitBatchRequest,
  SheetSummary,
  ParsedExcelRow,
} from "~/server/types/pb-import";
import { db } from "~/server/db";

// ============================================================================
// API RESPONSE TYPE
// ============================================================================

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// ============================================================================
// PB IMPORT API
// ============================================================================

export class PbImportAPI {
  /**
   * Upload and parse Excel file (multi-sheet support)
   */
  static async uploadExcel(
    buffer: Buffer,
    fileName: string,
    createdById?: string
  ): Promise<APIResponse<UploadPbExcelResponse>> {
    try {
      // Parse entire workbook (all sheets)
      const workbook = parseWorkbook(buffer, fileName);
      const { fileHash, sheets, totalRows } = workbook;

      console.log(`[PB Import] Parsed ${sheets.length} sheet(s), ${totalRows} total rows`);

      // Check if file already uploaded
      const existing = await PbImportBatchRepository.findByFileHash(fileHash);
      if (existing) {
        return {
          success: false,
          error: `File sudah pernah diupload sebelumnya (Batch ID: ${existing.id})`,
          statusCode: 409,
        };
      }

      // Extract metadata from first sheet
      const firstSheet = sheets[0];
      if (!firstSheet) {
        return {
          success: false,
          error: "Tidak ada sheet yang berhasil di-parse",
          statusCode: 400,
        };
      }

      // Create batch
      const batch = await PbImportBatchRepository.create({
        fileName,
        fileHash,
        periodFrom: firstSheet.headerInfo.periodFrom,
        periodTo: firstSheet.headerInfo.periodTo,
        printedAt: firstSheet.headerInfo.printedAt,
        createdById,
      });

      // Process all sheets
      const sheetSummaries: SheetSummary[] = [];
      const allRowsToInsert: CreatePbImportRowInput[] = [];
      let totalValid = 0;
      let totalIssues = 0;

      // Use upload time as default date for all rows
      const uploadDate = new Date();

      for (const sheet of sheets) {
        let sheetValid = 0;
        let sheetIssues = 0;

        // Process each row in sheet
        sheet.rows.forEach((row, rowIdx) => {
          const issues = PbValidationService.validateRow(row);
          const hasErrors = issues.some((i) => i.severity === "error");

          if (!hasErrors) sheetValid++;
          if (issues.length > 0) sheetIssues++;

          // Generate unique key: sha256(fileHash + sheetName + (noSeri || rowIndex))
          const uniqueKey = crypto
            .createHash("sha256")
            .update(`${fileHash}:${sheet.sheetName}:${row.noSeri || rowIdx}`)
            .digest("hex");

          allRowsToInsert.push({
            batchId: batch.id,
            sheetName: sheet.sheetName,
            rowIndex: rowIdx,
            noSeri: row.noSeri,
            noPolisi: row.noPolisi,
            namaRelasi: row.namaRelasi,
            produk: row.produk,
            timbang1Kg: row.timbang1Kg,
            timbang2Kg: row.timbang2Kg,
            netto1Kg: row.netto1Kg,
            potPct: row.potPct,
            potKg: row.potKg,
            terimaKg: row.terimaKg,
            harga: row.harga,
            total: row.total,
            pph: row.pph,
            totalPay: row.totalPay,
            tanggal: row.tanggal || uploadDate, // Use upload date if Excel tanggal is null
            jamMasuk: row.jamMasuk,
            jamKeluar: row.jamKeluar,
            lokasiKebun: row.lokasiKebun,
            payeeName: row.payeeName,
            bankName: row.bankName,
            accountNo: row.accountNo,
            penimbang: row.penimbang,
            supplierId: null,
            vehicleId: null,
            uniqueKey,
          });
        });

        totalValid += sheetValid;
        totalIssues += sheetIssues;

        sheetSummaries.push({
          sheetName: sheet.sheetName,
          rowCount: sheet.rows.length,
          validCount: sheetValid,
          issueCount: sheetIssues,
          unknownColumns: sheet.unknownColumns,
        });

        console.log(
          `[PB Import] Sheet "${sheet.sheetName}": ${sheet.rows.length} rows, ${sheetValid} valid, ${sheetIssues} with issues`
        );
        if (sheet.unknownColumns.length > 0) {
          console.log(`[PB Import] Unknown columns in "${sheet.sheetName}":`, sheet.unknownColumns);
        }
      }

      // Insert all rows
      console.log(`[PB Import] Inserting ${allRowsToInsert.length} rows to database...`);
      await PbImportRowRepository.createMany(allRowsToInsert);

      return {
        success: true,
        data: {
          batchId: batch.id,
          meta: {
            fileName,
            periodFrom: firstSheet.headerInfo.periodFrom?.toISOString() || null,
            periodTo: firstSheet.headerInfo.periodTo?.toISOString() || null,
            printedAt: firstSheet.headerInfo.printedAt?.toISOString() || null,
            totalRows,
            totalValid,
            totalIssues,
            sheets: sheetSummaries,
          },
        },
        statusCode: 201,
      };
    } catch (error) {
      console.error("Error uploading PB Excel:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload Excel",
        statusCode: 500,
      };
    }
  }

  /**
   * Get batch preview with sample rows and validation
   */
  static async getPreview(batchId: string): Promise<APIResponse<PreviewBatchResponse>> {
    try {
      const batch = await PbImportBatchRepository.findById(batchId);
      if (!batch) {
        return {
          success: false,
          error: "Batch not found",
          statusCode: 404,
        };
      }

      // Get first 10 rows for preview
      const { rows } = await PbImportRowRepository.findByBatchId(batchId, {
        page: 1,
        pageSize: 10,
        showInvalidOnly: false,
      });

      // Get all rows for statistics
      const allRows = await PbImportRowRepository.getAllByBatchId(batchId);

      // Validate rows and add issues
      const sampleRowsWithValidation: PbImportRowDTO[] = rows.map((row) => {
        const parsedRow = this.rowEntityToParsed(row);
        const issues = PbValidationService.validateRow(parsedRow);
        const hasErrors = issues.some((i) => i.severity === "error");

        // Debug logging for first invalid row
        if (hasErrors && rows.indexOf(row) === 0) {
          console.log("[PB Import] First row validation:");
          console.log("  Parsed row:", JSON.stringify(parsedRow, null, 2));
          console.log("  Issues:", JSON.stringify(issues, null, 2));
        }

        return {
          id: row.id,
          batchId: row.batchId,
          sheetName: row.sheetName,
          rowIndex: row.rowIndex,
          noSeri: row.noSeri,
          noPolisi: row.noPolisi,
          namaRelasi: row.namaRelasi,
          produk: row.produk,
          timbang1Kg: row.timbang1Kg?.toString() || null,
          timbang2Kg: row.timbang2Kg?.toString() || null,
          netto1Kg: row.netto1Kg?.toString() || null,
          potPct: row.potPct?.toString() || null,
          potKg: row.potKg?.toString() || null,
          terimaKg: row.terimaKg?.toString() || null,
          harga: row.harga?.toString() || null,
          total: row.total?.toString() || null,
          pph: row.pph?.toString() || null,
          totalPay: row.totalPay?.toString() || null,
          tanggal: row.tanggal?.toISOString() || null,
          jamMasuk: row.jamMasuk?.toISOString() || null,
          jamKeluar: row.jamKeluar?.toISOString() || null,
          lokasiKebun: row.lokasiKebun,
          payeeName: row.payeeName,
          bankName: row.bankName,
          accountNo: row.accountNo,
          penimbang: row.penimbang,
          supplierId: row.supplierId,
          vehicleId: row.vehicleId,
          issues,
          isValid: !hasErrors,
        };
      });

      // Calculate statistics
      let validRows = 0;
      let totalTerimaKg = new Decimal(0);
      let totalPph = new Decimal(0);
      let totalPembayaran = new Decimal(0);

      allRows.forEach((row) => {
        const parsedRow = this.rowEntityToParsed(row);
        const issues = PbValidationService.validateRow(parsedRow);
        const hasErrors = issues.some((i) => i.severity === "error");

        if (!hasErrors) {
          validRows++;
          if (row.terimaKg) totalTerimaKg = totalTerimaKg.add(row.terimaKg);
          if (row.pph) totalPph = totalPph.add(row.pph);
          if (row.totalPay) totalPembayaran = totalPembayaran.add(row.totalPay);
        }
      });

      return {
        success: true,
        data: {
          batch: {
            id: batch.id,
            fileName: batch.fileName,
            fileHash: batch.fileHash,
            periodFrom: batch.periodFrom?.toISOString() || null,
            periodTo: batch.periodTo?.toISOString() || null,
            printedAt: batch.printedAt?.toISOString() || null,
            note: batch.note,
            status: batch.status,
            createdById: batch.createdById,
            createdAt: batch.createdAt.toISOString(),
            postedAt: batch.postedAt?.toISOString() || null,
            rowCount: batch._count?.rows || 0,
            ticketCount: batch._count?.tickets || 0,
          },
          sampleRows: sampleRowsWithValidation,
          totalRows: allRows.length,
          validRows,
          invalidRows: allRows.length - validRows,
          summary: {
            totalTerimaKg: totalTerimaKg.toString(),
            totalPph: totalPph.toString(),
            totalPembayaran: totalPembayaran.toString(),
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error getting batch preview:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get preview",
        statusCode: 500,
      };
    }
  }

  /**
   * Helper: Convert row entity to parsed row for validation
   */
  private static rowEntityToParsed(row: any) {
    return {
      noSeri: row.noSeri,
      noPolisi: row.noPolisi,
      namaRelasi: row.namaRelasi,
      produk: row.produk,
      timbang1Kg: row.timbang1Kg ? parseFloat(row.timbang1Kg.toString()) : null,
      timbang2Kg: row.timbang2Kg ? parseFloat(row.timbang2Kg.toString()) : null,
      netto1Kg: row.netto1Kg ? parseFloat(row.netto1Kg.toString()) : null,
      potPct: row.potPct ? parseFloat(row.potPct.toString()) : null,
      potKg: row.potKg ? parseFloat(row.potKg.toString()) : null,
      terimaKg: row.terimaKg ? parseFloat(row.terimaKg.toString()) : null,
      harga: row.harga ? parseFloat(row.harga.toString()) : null,
      total: row.total ? parseFloat(row.total.toString()) : null,
      pph: row.pph ? parseFloat(row.pph.toString()) : null,
      totalPay: row.totalPay ? parseFloat(row.totalPay.toString()) : null,
      tanggal: row.tanggal,
      jamMasuk: row.jamMasuk,
      jamKeluar: row.jamKeluar,
      lokasiKebun: row.lokasiKebun,
      payeeName: row.payeeName,
      bankName: row.bankName,
      accountNo: row.accountNo,
      penimbang: row.penimbang,
    };
  }

  /**
   * Update row mappings (supplier/vehicle)
   */
  static async mapRows(
    batchId: string,
    request: MapRowRequest
  ): Promise<APIResponse<{ updated: number }>> {
    try {
      // Verify batch exists and is DRAFT
      const batch = await PbImportBatchRepository.findById(batchId);
      if (!batch) {
        return {
          success: false,
          error: "Batch not found",
          statusCode: 404,
        };
      }

      if (batch.status !== "DRAFT") {
        return {
          success: false,
          error: "Cannot update mappings for posted batch",
          statusCode: 422,
        };
      }

      // Update mappings
      await PbImportRowRepository.updateMappings(request.items);

      return {
        success: true,
        data: { updated: request.items.length },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error mapping rows:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to map rows",
        statusCode: 500,
      };
    }
  }

  /**
   * Commit batch - create tickets from valid rows
   */
  static async commitBatch(
    batchId: string,
    request: CommitBatchRequest
  ): Promise<APIResponse<CommitBatchResponse>> {
    try {
      if (!request.confirm) {
        return {
          success: false,
          error: "Confirmation required",
          statusCode: 400,
        };
      }

      // Verify batch exists and is DRAFT
      const batch = await PbImportBatchRepository.findById(batchId);
      if (!batch) {
        return {
          success: false,
          error: "Batch not found",
          statusCode: 404,
        };
      }

      if (batch.status !== "DRAFT") {
        return {
          success: false,
          error: "Batch already posted",
          statusCode: 422,
        };
      }

      // Get all rows
      const allRows = await PbImportRowRepository.getAllByBatchId(batchId);

      // Validate and prepare tickets
      const ticketsToCreate: CreatePbTicketInput[] = [];
      const errors: Array<{ rowId: string; noSeri: string | null; reason: string }> = [];

      for (const row of allRows) {
        const parsedRow = this.rowEntityToParsed(row);
        const issues = PbValidationService.validateRow(parsedRow);
        const hasErrors = issues.some((i) => i.severity === "error");

        if (hasErrors) {
          errors.push({
            rowId: row.id,
            noSeri: row.noSeri,
            reason: issues.filter((i) => i.severity === "error").map((i) => i.message).join("; "),
          });
          continue;
        }

        // Required fields check
        if (!row.tanggal || !row.noSeri || !row.timbang1Kg || !row.timbang2Kg || !row.netto1Kg || !row.potPct || !row.potKg || !row.terimaKg || !row.harga || !row.total || !row.pph || !row.totalPay) {
          errors.push({
            rowId: row.id,
            noSeri: row.noSeri,
            reason: "Missing required fields",
          });
          continue;
        }

        // Parse datetime (jamMasuk/jamKeluar are now Date | null)
        const wbInAt = row.jamMasuk || null;
        const wbOutAt = row.jamKeluar || null;

        ticketsToCreate.push({
          batchId: batch.id,
          rowId: row.id,
          sheetName: row.sheetName,
          date: row.tanggal,
          ticketNo: row.noSeri,
          vehiclePlate: row.noPolisi,
          supplierId: row.supplierId,
          cluster: row.lokasiKebun,
          wbInAt,
          wbOutAt,
          grossKg: parseFloat(row.timbang1Kg.toString()),
          tareKg: parseFloat(row.timbang2Kg.toString()),
          netto1Kg: parseFloat(row.netto1Kg.toString()),
          potPct: parseFloat(row.potPct.toString()),
          potKg: parseFloat(row.potKg.toString()),
          receiveKg: parseFloat(row.terimaKg.toString()),
          price: parseFloat(row.harga.toString()),
          total: parseFloat(row.total.toString()),
          pph: parseFloat(row.pph.toString()),
          totalPay: parseFloat(row.totalPay.toString()),
          payeeName: row.payeeName,
          bankName: row.bankName,
          accountNo: row.accountNo,
          weigherName: row.penimbang,
        });
      }

      // Create tickets in transaction
      let created = 0;
      if (ticketsToCreate.length > 0) {
        await db.$transaction(async (tx) => {
          // Create tickets
          for (const ticket of ticketsToCreate) {
            await tx.pbTicket.create({ data: ticket });
            created++;
          }

          // Mark batch as POSTED
          await tx.pbImportBatch.update({
            where: { id: batchId },
            data: {
              status: "POSTED",
              postedAt: new Date(),
            },
          });
        });
      } else {
        // No valid tickets, but still mark as posted
        await PbImportBatchRepository.markAsPosted(batchId);
      }

      // Calculate summary
      const summary = await PbTicketRepository.getSummaryByBatchId(batchId);

      return {
        success: true,
        data: {
          batchId: batch.id,
          created,
          skipped: errors.length,
          errors,
          summary: {
            totalTerimaKg: summary.totalReceiveKg.toString(),
            totalPph: summary.totalPph.toString(),
            totalPembayaran: summary.totalPay.toString(),
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error committing batch:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to commit batch",
        statusCode: 500,
      };
    }
  }

  /**
   * Helper: Parse datetime from date and time string
   */
  private static parseDateTime(date: Date, timeStr: string): Date | null {
    try {
      const timeRegex = /(\d{1,2}):(\d{2})/;
      const timeMatch = timeRegex.exec(timeStr);
      if (!timeMatch) return null;

      const hours = parseInt(timeMatch[1]!, 10);
      const minutes = parseInt(timeMatch[2]!, 10);

      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);

      return result;
    } catch {
      return null;
    }
  }
}

