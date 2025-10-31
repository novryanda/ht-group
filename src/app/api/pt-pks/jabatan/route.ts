import { NextRequest, NextResponse } from "next/server";
import { JabatanAPI } from "~/server/api/pt-pks/jabatan";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

/**
 * GET /api/pt-pks/jabatan
 * Get list of jabatan with pagination
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
    const query = {
      search: searchParams.get("search") ?? undefined,
      divisiId: searchParams.get("divisiId") ?? undefined,
      isActive: searchParams.get("isActive") ?? "all",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    };

    const result = await JabatanAPI.getList(query, companyId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/jabatan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pt-pks/jabatan
 * Create a new jabatan
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

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get company ID - use PT PKS company
    const company = await getPTPKSCompany();
    const companyId = company.id;

    const body = await request.json();
    const result = await JabatanAPI.create(body, companyId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ POST /api/pt-pks/jabatan error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

