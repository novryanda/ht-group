/**
 * Bulk delete warehouses API
 * POST /api/pt-pks/material-inventory/warehouses/bulk-delete
 * Body: { ids: string[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { WarehouseAPI } from "~/server/api/pt-pks/warehouses";
const warehouseAPI = new WarehouseAPI();

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No warehouse IDs provided",
      }, { status: 400 });
    }
  const results = await Promise.all(ids.map((id) => warehouseAPI.deleteWarehouse(id)));
  const failed = results.filter((r: any) => !r.success);
    return NextResponse.json({
      success: failed.length === 0,
      failed,
      statusCode: failed.length === 0 ? 200 : 207,
    }, { status: failed.length === 0 ? 200 : 207 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    }, { status: 500 });
  }
}
