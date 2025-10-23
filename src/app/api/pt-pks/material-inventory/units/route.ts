import { NextRequest, NextResponse } from "next/server";
import { UnitsAPI } from "~/server/api/pt-pks/units";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";

/**
 * GET /api/pt-pks/material-inventory/units
 * Get list of units with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check PT PKS access
    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") ?? undefined,
      isActive: searchParams.get("isActive") ?? "all",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    };

    const result = await UnitsAPI.getList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/units error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pt-pks/material-inventory/units
 * Create a new unit
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check PT PKS admin access
    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = await UnitsAPI.create(body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ POST /api/pt-pks/material-inventory/units error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
