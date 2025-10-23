/**
 * Generate SKU API Route
 * POST /api/pt-pks/material-inventory/items/generate-sku
 * Body: { categoryId, itemTypeId }
 */

import { NextRequest, NextResponse } from "next/server";
import { ItemsAPI } from "~/server/api/pt-pks/items";

const itemsAPI = new ItemsAPI();

/**
 * POST - Generate SKU
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, itemTypeId } = body;

    if (!categoryId || !itemTypeId) {
      return NextResponse.json(
        {
          success: false,
          error: "categoryId and itemTypeId are required",
        },
        { status: 400 },
      );
    }

    const result = await itemsAPI.generateSKU(categoryId, itemTypeId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ POST /items/generate-sku error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
