/**
 * Reports Service
 * Business logic for monthly reports
 */

import {
  PbImportReportRepository,
  InventoryReportRepository,
} from "~/server/repositories/reports.repo";
import type { MonthlyReportResponse } from "~/server/types/reports";

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export class ReportsService {
  /**
   * Build comprehensive monthly report
   */
  static async buildMonthlyReport(params: {
    companyCode?: string;
    start: Date;
    end: Date;
    includeBreakdown?: boolean;
  }): Promise<MonthlyReportResponse> {
    // Fetch summary data in parallel
    const [pbSummary, inventorySummary] = await Promise.all([
      PbImportReportRepository.aggregateMonthly({
        companyCode: params.companyCode,
        start: params.start,
        end: params.end,
      }),
      InventoryReportRepository.aggregateMonthly({
        companyCode: params.companyCode,
        start: params.start,
        end: params.end,
      }),
    ]);

    const response: MonthlyReportResponse = {
      period: {
        start: params.start,
        end: params.end,
      },
      companyCode: params.companyCode,
      pbSummary,
      inventorySummary,
    };

    // Optionally include detailed breakdowns
    if (params.includeBreakdown) {
      const [
        pbDailyBreakdown,
        pbSupplierBreakdown,
        inventoryDailyBreakdown,
        inventoryMaterialBreakdown,
      ] = await Promise.all([
        PbImportReportRepository.getDailyBreakdown({
          companyCode: params.companyCode,
          start: params.start,
          end: params.end,
        }),
        PbImportReportRepository.getSupplierBreakdown({
          companyCode: params.companyCode,
          start: params.start,
          end: params.end,
        }),
        InventoryReportRepository.getDailyBreakdown({
          companyCode: params.companyCode,
          start: params.start,
          end: params.end,
        }),
        InventoryReportRepository.getMaterialBreakdown({
          companyCode: params.companyCode,
          start: params.start,
          end: params.end,
        }),
      ]);

      response.pbDailyBreakdown = pbDailyBreakdown;
      response.pbSupplierBreakdown = pbSupplierBreakdown;
      response.inventoryDailyBreakdown = inventoryDailyBreakdown;
      response.inventoryMaterialBreakdown = inventoryMaterialBreakdown;
    }

    return response;
  }
}

