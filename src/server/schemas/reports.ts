/**
 * Reports Module - Zod Validation Schemas
 */

import { z } from "zod";

// ============================================================================
// MONTHLY REPORT QUERY SCHEMA
// ============================================================================

export const monthlyReportQuerySchema = z.object({
  companyCode: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  includeBreakdown: z.coerce.boolean().default(false),
}).refine(
  (data) => {
    // Either month OR (startDate AND endDate) must be provided
    const hasMonth = !!data.month;
    const hasDateRange = !!data.startDate && !!data.endDate;
    return hasMonth || hasDateRange;
  },
  {
    message: "Either 'month' or both 'startDate' and 'endDate' must be provided",
  }
);

export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;

