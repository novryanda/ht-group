import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseOutboundAPI } from "~/server/api/pt-pks/warehouse-outbound";

const api = new WarehouseOutboundAPI();

/**
 * GET /api/pt-pks/transaksi-gudang/active-loans
 * Get active loan transactions that can be returned
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
      purpose: "LOAN",
      warehouseId: searchParams.get("warehouseId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "50",
    };

    const result = await api.getAll(query);

    // Filter only loans that are not fully returned
    if (result.success && result.data) {
      result.data = result.data.filter(
        (loan) => loan.status === "APPROVED" && !loan.isLoanFullyReturned
      );
    }

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/transaksi-gudang/active-loans:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
