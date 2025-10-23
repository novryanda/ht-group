/**
 * Items API Routes - Collection
 * GET /api/pt-pks/material-inventory/items - List items with filters
 * POST /api/pt-pks/material-inventory/items - Create new item
 */

import { NextRequest, NextResponse } from "next/server";
import { ItemsAPI } from "~/server/api/pt-pks/items";
import type { ItemQueryParams } from "~/server/schemas/pt-pks/item";

const itemsAPI = new ItemsAPI();

/**
 * GET - Get all items with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params: ItemQueryParams = {
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "10"),
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      itemTypeId: searchParams.get("itemTypeId") ?? undefined,
      unitId: searchParams.get("unitId") ?? undefined,
      isActive:
        searchParams.get("isActive") === "true"
          ? true
          : searchParams.get("isActive") === "false"
            ? false
            : undefined,
    };

    const result = await itemsAPI.getAll(params);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /items error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Create new item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await itemsAPI.create(body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ POST /items error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
