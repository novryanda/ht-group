/**
 * Reports Application API
 * Tier 2 - Application Services Layer
 */

"use server";

import { ReportsService } from "~/server/services/reports.service";
import { monthlyReportQuerySchema } from "~/server/schemas/reports";
import { toMonthRange } from "~/server/lib/date-utils";
import type {
  MonthlyReportRequest,
  MonthlyReportResponse,
  ReportAPIResponse,
} from "~/server/types/reports";

// ============================================================================
// MONTHLY REPORT API
// ============================================================================

/**
 * Get monthly report with aggregated data
 */
export async function getMonthlyReport(
  input: MonthlyReportRequest
): Promise<ReportAPIResponse<MonthlyReportResponse>> {
  try {
    // Validate input
    const validated = monthlyReportQuerySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "Invalid input",
        statusCode: 400,
      };
    }

    const { companyCode, month, startDate, endDate, includeBreakdown } = validated.data;

    // Determine date range
    let start: Date;
    let end: Date;

    if (month) {
      const range = toMonthRange(month);
      start = range.start;
      end = range.end;
    } else if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      return {
        success: false,
        error: "Either 'month' or both 'startDate' and 'endDate' must be provided",
        statusCode: 400,
      };
    }

    // Build report
    const report = await ReportsService.buildMonthlyReport({
      companyCode,
      start,
      end,
      includeBreakdown,
    });

    return {
      success: true,
      data: report,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error generating monthly report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report",
      statusCode: 500,
    };
  }
}

