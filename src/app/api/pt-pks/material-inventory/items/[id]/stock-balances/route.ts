/**
 * GET /api/pt-pks/material-inventory/items/[id]/stock-balances
 * Get all stock balances for a specific item
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { StockAPI } from "~/server/api/pt-pks/stock";

const stockAPI = new StockAPI();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
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

    const { id: itemId } = await context.params;
    const result = await stockAPI.getItemStockBalances(itemId);

    return NextResponse.json(
      { success: result.success, data: result.data, error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/items/[id]/stock-balances error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}