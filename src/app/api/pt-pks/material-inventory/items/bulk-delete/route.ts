/**
 * Bulk delete items API
 * POST /api/pt-pks/material-inventory/items/bulk-delete
 * Body: { ids: string[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { ItemsAPI } from "~/server/api/pt-pks/items";

const itemsAPI = new ItemsAPI();

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No item IDs provided",
      }, { status: 400 });
    }
    const results = await Promise.all(ids.map((id) => itemsAPI.delete(id)));
    const failed = results.filter((r) => !r.success);
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
