import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { LedgerService } from "~/server/services/pt-pks/ledger.service";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const ledgerService = new LedgerService();

/**
 * GET /api/pt-pks/buku-besar
 * Get ledger for specific account or all accounts
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
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const asOfDate = searchParams.get("asOfDate") ?? undefined;

    // Get PT PKS company ID
    const company = await getPTPKSCompany();

    // If accountId provided, get specific account ledger
    if (accountId) {
      const result = await ledgerService.getAccountLedger(company.id, {
        accountId,
        startDate,
        endDate,
      });

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    // Otherwise, get all account balances
    const result = await ledgerService.getAllAccountBalances(company.id, asOfDate);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/buku-besar:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
