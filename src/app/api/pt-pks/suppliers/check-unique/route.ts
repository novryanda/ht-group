import { type NextRequest, NextResponse } from "next/server";
import { SupplierAPI } from "~/server/api/pt-pks/suppliers";

/**
 * GET /api/suppliers/check-unique
 * Check if NIB or NPWP is unique
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const nib = searchParams.get('nib') ?? undefined;
    const npwp = searchParams.get('npwp') ?? undefined;
    const excludeId = searchParams.get('excludeId') ?? undefined;

    const result = await SupplierAPI.checkUnique(nib, npwp, excludeId);

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
