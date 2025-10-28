import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { BalanceSheetService } from "~/server/services/pt-pks/balance-sheet.service";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const balanceSheetService = new BalanceSheetService();

/**
 * GET /api/pt-pks/neraca
 * Generate balance sheet
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
    const asOfDate = searchParams.get("asOfDate") ?? new Date().toISOString().split("T")[0]!;

    // Get PT PKS company ID
    const company = await getPTPKSCompany();

    const result = await balanceSheetService.generateBalanceSheet(company.id, asOfDate);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/neraca:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
