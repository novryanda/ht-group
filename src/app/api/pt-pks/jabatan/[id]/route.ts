import { NextRequest, NextResponse } from "next/server";
import { JabatanAPI } from "~/server/api/pt-pks/jabatan";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

/**
 * GET /api/pt-pks/jabatan/[id]
 * Get jabatan by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const result = await JabatanAPI.getById(id, companyId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/jabatan/[id] error:", error);
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
 * PUT /api/pt-pks/jabatan/[id]
 * Update jabatan by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const result = await JabatanAPI.update(id, body, companyId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ PUT /api/pt-pks/jabatan/[id] error:", error);
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
 * DELETE /api/pt-pks/jabatan/[id]
 * Delete jabatan by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await JabatanAPI.delete(id, companyId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE /api/pt-pks/jabatan/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

