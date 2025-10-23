/**
 * Active Items API Route
 * GET /api/pt-pks/material-inventory/items/active - Get all active items
 */

import { NextRequest, NextResponse } from "next/server";
import { ItemsAPI } from "~/server/api/pt-pks/items";

const itemsAPI = new ItemsAPI();

/**
 * GET - Get all active items (for dropdowns)
 */
export async function GET(request: NextRequest) {
  try {
    const result = await itemsAPI.getAllActive();

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /items/active error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
