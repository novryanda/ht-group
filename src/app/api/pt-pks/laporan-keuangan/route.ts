import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { IncomeStatementService } from "~/server/services/pt-pks/income-statement.service";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const incomeStatementService = new IncomeStatementService();

/**
 * GET /api/pt-pks/laporan-keuangan
 * Generate income statement
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
    
    // Default to current month if not provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    
    const startDate = searchParams.get("startDate") ?? defaultStartDate!;
    const endDate = searchParams.get("endDate") ?? defaultEndDate!;

    // Get PT PKS company ID
    const company = await getPTPKSCompany();

    const result = await incomeStatementService.generateIncomeStatement(
      company.id,
      startDate,
      endDate
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/laporan-keuangan:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
