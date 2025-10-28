import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { LoanIssueAPI } from "~/server/api/pt-pks/loan-issue";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId") || undefined;

    const result = await LoanIssueAPI.getActiveLoans(warehouseId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/pt-pks/peminjaman-barang/active-loans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
