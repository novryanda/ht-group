import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { WarehouseAPI } from "~/server/api/pt-pks/warehouses";

const warehouseAPI = new WarehouseAPI();

/**
 * GET /api/pt-pks/material-inventory/bins?warehouseId=xxx
 * Get bins, optionally filtered by warehouse
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
    const warehouseId = searchParams.get("warehouseId");

    if (!warehouseId) {
      return NextResponse.json(
        { error: "warehouseId query parameter is required" },
        { status: 400 }
      );
    }

    const result = await warehouseAPI.getBinsByWarehouseId(warehouseId);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/bins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pt-pks/material-inventory/bins
 * Create a new bin (warehouseId in body)
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
    const result = await warehouseAPI.createBin(body);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ POST /api/pt-pks/material-inventory/bins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
