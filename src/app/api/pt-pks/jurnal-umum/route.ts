import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { JournalService } from "~/server/services/pt-pks/journal.service";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const journalService = new JournalService();

/**
 * GET /api/pt-pks/jurnal-umum
 * Get journal entries with filters
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
    const params = {
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      sourceType: searchParams.get("sourceType") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      accountId: searchParams.get("accountId") ?? undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
    };

    // Get PT PKS company ID
    const company = await getPTPKSCompany();

    const result = await journalService.getJournalEntries(company.id, params);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error in GET /api/pt-pks/jurnal-umum:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
