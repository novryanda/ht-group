import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { KaryawanAPI } from "~/server/api/karyawan";
import { normalizeEmptyStrings } from "~/lib/select-utils";

/**
 * GET /api/pt-pks/karyawan/[id]
 * Get employee detail with families
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check
    const { role } = session.user as any;
    const allowedRoles = ["PT_PKS_ADMIN", "UNIT_SUPERVISOR", "HR", "EXECUTIVE", "GROUP_VIEWER"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const result = await KaryawanAPI.getKaryawanWithFamily(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pt-pks/karyawan/[id]
 * Update employee
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - only admins and HR can update
    const { role } = session.user as any;
    const allowedRoles = ["PT_PKS_ADMIN", "HR", "EXECUTIVE"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const rawBody: unknown = await request.json();

    // ✅ FIX: Normalize empty strings to undefined before validation
    const body = normalizeEmptyStrings(rawBody as Record<string, unknown>);

    const result = await KaryawanAPI.updateKaryawan(id, body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

