import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseInboundAPI } from "~/server/api/pt-pks/warehouse-inbound";

const api = new WarehouseInboundAPI();

/**
 * POST /api/pt-pks/transaksi-gudang/barang-masuk/new-item
 * Create new item + inbound transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await api.createNewItem(body, session.user.id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in POST /api/pt-pks/transaksi-gudang/barang-masuk/new-item:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
