import { type NextRequest, NextResponse } from "next/server";
import { SupplierAPI } from "~/server/api/suppliers";

/**
 * GET /api/suppliers/[id]
 * Get supplier by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await SupplierAPI.getSupplierById(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/suppliers/[id]
 * Update supplier
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const result = await SupplierAPI.updateSupplier(id, body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/suppliers/[id]
 * Delete supplier
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await SupplierAPI.deleteSupplier(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
