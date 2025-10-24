import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseInboundAPI } from "~/server/api/pt-pks/warehouse-inbound";

const api = new WarehouseInboundAPI();

/**
 * GET /api/pt-pks/transaksi-gudang/barang-masuk
 * Get all warehouse inbound transactions with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") ?? undefined,
      warehouseId: searchParams.get("warehouseId") ?? undefined,
      sourceType: searchParams.get("sourceType") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    };

    const result = await api.getAll(query);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/transaksi-gudang/barang-masuk:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pt-pks/transaksi-gudang/barang-masuk
 * Create new warehouse inbound transaction
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
    const result = await api.create(body, session.user.id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in POST /api/pt-pks/transaksi-gudang/barang-masuk:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
