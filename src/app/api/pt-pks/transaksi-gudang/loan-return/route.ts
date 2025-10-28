import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WarehouseInboundAPI } from "~/server/api/pt-pks/warehouse-inbound";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const api = new WarehouseInboundAPI();

/**
 * POST /api/pt-pks/transaksi-gudang/loan-return
 * Process loan return transaction
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
    const result = await api.processLoanReturn(body, session.user.id, company.id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ Error in POST /api/pt-pks/transaksi-gudang/loan-return:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
