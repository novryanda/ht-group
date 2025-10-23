/**
 * Items API Routes - Individual Resource
 * GET /api/pt-pks/material-inventory/items/[id] - Get item by ID
 * PUT /api/pt-pks/material-inventory/items/[id] - Update item
 * DELETE /api/pt-pks/material-inventory/items/[id] - Delete item
 */

import { NextRequest, NextResponse } from "next/server";
import { ItemsAPI } from "~/server/api/pt-pks/items";

const itemsAPI = new ItemsAPI();

/**
 * GET - Get item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await itemsAPI.getById(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /items/[id] error:", error);
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
 * PUT - Update item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await itemsAPI.update(id, body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ PUT /items/[id] error:", error);
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
 * DELETE - Delete item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await itemsAPI.delete(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ DELETE /items/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
