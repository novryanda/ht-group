import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { WarehouseAPI } from "~/server/api/pt-pks/warehouses";

const warehouseAPI = new WarehouseAPI();

/**
 * GET /api/pt-pks/material-inventory/warehouses/[id]
 * Get warehouse details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeBins = searchParams.get("includeBins") === "true";

    const result = await warehouseAPI.getWarehouseById(id, includeBins);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/warehouses/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pt-pks/material-inventory/warehouses/[id]
 * Update warehouse
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const result = await warehouseAPI.updateWarehouse(id, body);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ PUT /api/pt-pks/material-inventory/warehouses/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pt-pks/material-inventory/warehouses/[id]
 * Delete warehouse
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const result = await warehouseAPI.deleteWarehouse(id);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ DELETE /api/pt-pks/material-inventory/warehouses/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
