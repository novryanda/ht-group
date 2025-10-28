import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseOutboundAPI } from "~/server/api/pt-pks/warehouse-outbound";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const api = new WarehouseOutboundAPI();

/**
 * GET /api/pt-pks/transaksi-gudang/barang-keluar
 * Get all warehouse outbound transactions with pagination
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") ?? undefined,
      warehouseId: searchParams.get("warehouseId") ?? undefined,
      purpose: searchParams.get("purpose") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    };

    const result = await api.getAll(query);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/transaksi-gudang/barang-keluar:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pt-pks/transaksi-gudang/barang-keluar
 * Create new warehouse outbound transaction
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

    // Get PT PKS company ID
    const company = await getPTPKSCompany();

    const body = await request.json();
    const result = await api.create(body, session.user.id, company.id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in POST /api/pt-pks/transaksi-gudang/barang-keluar:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
