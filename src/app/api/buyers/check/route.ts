import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { BuyerAPI } from "~/server/api/buyers";

/**
 * GET /api/buyers/check
 * Check for duplicate buyers
 * Query params: npwp, legalName, city, province
 * Access: PT_PKS_ADMIN, EXECUTIVE, GROUP_VIEWER
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role
    const userRole = (session.user as any).role;
    const allowedRoles = ["PT_PKS_ADMIN", "EXECUTIVE", "GROUP_VIEWER"];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      npwp: searchParams.get("npwp") ?? undefined,
      legalName: searchParams.get("legalName") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      province: searchParams.get("province") ?? undefined,
    };

    const result = await BuyerAPI.checkDuplicate(queryParams);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/buyers/check:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

