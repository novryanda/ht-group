import { NextRequest, NextResponse } from "next/server";
import { DivisiAPI } from "~/server/api/pt-pks/divisi";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

/**
 * GET /api/pt-pks/divisi/active
 * Get all active divisi for dropdown/select
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

    const result = await DivisiAPI.getAllActive(companyId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/divisi/active error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

