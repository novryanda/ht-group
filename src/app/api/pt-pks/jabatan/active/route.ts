import { NextRequest, NextResponse } from "next/server";
import { JabatanAPI } from "~/server/api/pt-pks/jabatan";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

/**
 * GET /api/pt-pks/jabatan/active
 * Get all active jabatan for dropdown/select
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

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get company ID - use PT PKS company
    const company = await getPTPKSCompany();
    const companyId = company.id;

    const { searchParams } = new URL(request.url);
    const divisiId = searchParams.get("divisiId") ?? undefined;

    const result = await JabatanAPI.getAllActive(companyId, divisiId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/jabatan/active error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

