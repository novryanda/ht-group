import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseOutboundAPI } from "~/server/api/pt-pks/warehouse-outbound";

const api = new WarehouseOutboundAPI();

/**
 * GET /api/pt-pks/transaksi-gudang/barang-keluar/[id]
 * Get warehouse outbound by ID
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
    console.error("❌ Error in GET /api/pt-pks/transaksi-gudang/barang-keluar/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pt-pks/transaksi-gudang/barang-keluar/[id]
 * Update warehouse outbound
 */
export async function PUT(
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
    const body = await request.json();
    const result = await api.update(id, body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in PUT /api/pt-pks/transaksi-gudang/barang-keluar/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pt-pks/transaksi-gudang/barang-keluar/[id]
 * Delete warehouse outbound
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
    console.error("❌ Error in DELETE /api/pt-pks/transaksi-gudang/barang-keluar/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
