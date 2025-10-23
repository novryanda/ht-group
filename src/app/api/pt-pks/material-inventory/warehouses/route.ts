import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { WarehouseAPI } from "~/server/api/pt-pks/warehouses";

const warehouseAPI = new WarehouseAPI();

/**
 * GET /api/pt-pks/material-inventory/warehouses
 * Get paginated list of warehouses with search and filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasCompanyAccess(session as any, "PT-PKS")) {
      return NextResponse.json(
        { error: "Forbidden: Akses ditolak untuk PT PKS" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const params = {
      search: searchParams.get("search") ?? undefined,
      isActive: (searchParams.get("isActive") ?? "all") as "true" | "false" | "all",
      page: parseInt(searchParams.get("page") ?? "1", 10),
      limit: parseInt(searchParams.get("limit") ?? "10", 10),
    };

    const result = await warehouseAPI.getWarehouses(params);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/warehouses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pt-pks/material-inventory/warehouses
 * Create a new warehouse
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasCompanyAccess(session as any, "PT-PKS")) {
      return NextResponse.json(
        { error: "Forbidden: Akses ditolak untuk PT PKS" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = await warehouseAPI.createWarehouse(body);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ POST /api/pt-pks/material-inventory/warehouses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
