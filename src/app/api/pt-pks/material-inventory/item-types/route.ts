import { NextRequest, NextResponse } from "next/server";
import { ItemTypesAPI } from "~/server/api/pt-pks/item-types";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";

/**
 * GET /api/pt-pks/material-inventory/item-types
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

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      isActive: searchParams.get("isActive") ?? "all",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    };

    const result = await ItemTypesAPI.getList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/item-types error:", error);
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
 * POST /api/pt-pks/material-inventory/item-types
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

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = await ItemTypesAPI.create(body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ POST /api/pt-pks/material-inventory/item-types error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
