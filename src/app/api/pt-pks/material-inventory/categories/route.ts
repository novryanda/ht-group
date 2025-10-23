import { NextRequest, NextResponse } from "next/server";
import { CategoriesAPI } from "~/server/api/pt-pks/categories";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";

/**
 * GET /api/pt-pks/material-inventory/categories
 * Get list of categories with pagination
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
      isActive: searchParams.get("isActive") ?? "all",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    };

    const result = await CategoriesAPI.getList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/categories error:", error);
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
 * POST /api/pt-pks/material-inventory/categories
 * Create a new category
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
    const result = await CategoriesAPI.create(body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ POST /api/pt-pks/material-inventory/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
