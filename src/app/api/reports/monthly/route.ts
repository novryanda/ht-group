/**
 * Monthly Report API Route
 * Tier 1 - Controller Layer
 */

import { NextResponse, type NextRequest } from "next/server";
import { getMonthlyReport } from "~/server/api/reports";

/**
 * GET /api/reports/monthly
 * 
 * Query Parameters:
 * - companyCode (optional): Filter by company code
 * - month (optional): Month in YYYY-MM format
 * - startDate (optional): Start date (ISO string)
 * - endDate (optional): End date (ISO string)
 * - includeBreakdown (optional): Include detailed breakdowns (default: false)
 * 
 * Either 'month' OR both 'startDate' and 'endDate' must be provided
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const input = {
      companyCode: searchParams.get("companyCode") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      includeBreakdown: searchParams.get("includeBreakdown") === "true",
    };

    const result = await getMonthlyReport(input);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Monthly report API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

