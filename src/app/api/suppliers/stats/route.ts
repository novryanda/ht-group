import { type NextRequest, NextResponse } from "next/server";
import { SupplierAPI } from "~/server/api/suppliers";

/**
 * GET /api/suppliers/stats
 * Get supplier statistics
 */
export async function GET(request: NextRequest) {
  try {
    const result = await SupplierAPI.getSupplierStats();

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
