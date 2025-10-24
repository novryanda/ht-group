import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseInboundAPI } from "~/server/api/pt-pks/warehouse-inbound";

const api = new WarehouseInboundAPI();

/**
 * GET /api/pt-pks/transaksi-gudang/barang-masuk/[id]
 * Get warehouse inbound by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await api.getById(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/transaksi-gudang/barang-masuk/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pt-pks/transaksi-gudang/barang-masuk/[id]
 * Delete warehouse inbound
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await api.delete(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in DELETE /api/pt-pks/transaksi-gudang/barang-masuk/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
