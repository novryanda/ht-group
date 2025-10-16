import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { KaryawanAPI } from "~/server/api/karyawan";
import { normalizeEmptyStrings } from "~/lib/select-utils";

/**
 * GET /api/pt-pks/karyawan
 * Get list of employees with pagination, search, and filters
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - PT_PKS_ADMIN, UNIT_SUPERVISOR, HR can access
    const { role } = session.user as any;
    const allowedRoles = ["PT_PKS_ADMIN", "UNIT_SUPERVISOR", "HR", "EXECUTIVE", "GROUP_VIEWER"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Extract query parameters - only include non-null values
    const query: Record<string, string> = {};

    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy");
    const sortDir = searchParams.get("sortDir");
    const devisi = searchParams.get("devisi");
    const level = searchParams.get("level");
    const jabatan = searchParams.get("jabatan");
    const companyId = searchParams.get("companyId");

    if (page) query.page = page;
    if (pageSize) query.pageSize = pageSize;
    if (search) query.search = search;
    if (sortBy) query.sortBy = sortBy;
    if (sortDir) query.sortDir = sortDir;
    if (devisi) query.devisi = devisi;
    if (level) query.level = level;
    if (jabatan) query.jabatan = jabatan;
    if (companyId) query.companyId = companyId;

    const result = await KaryawanAPI.listKaryawan(query);

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
 * POST /api/pt-pks/karyawan
 * Create new employee
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - Only PT_PKS_ADMIN, HR, EXECUTIVE can create
    const { role } = session.user as any;
    const allowedRoles = ["PT_PKS_ADMIN", "HR", "EXECUTIVE"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Normalize empty strings to undefined
    const normalizedData = normalizeEmptyStrings(body);

    // Call API module
    const result = await KaryawanAPI.createKaryawan(normalizedData);

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
 * PUT /api/pt-pks/karyawan?id=xxx
 * Update employee
 */
export async function PUT(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - Only PT_PKS_ADMIN, HR, EXECUTIVE can update
    const { role } = session.user as any;
    const allowedRoles = ["PT_PKS_ADMIN", "HR", "EXECUTIVE"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get employee ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();

    // Normalize empty strings to undefined
    const normalizedData = normalizeEmptyStrings(body);

    // Call API module
    const result = await KaryawanAPI.updateKaryawan(id, normalizedData);

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
 * DELETE /api/pt-pks/karyawan?id=xxx
 * Delete employee
 */
export async function DELETE(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - Only PT_PKS_ADMIN, HR, EXECUTIVE can delete
    const { role } = session.user as any;
    const allowedRoles = ["PT_PKS_ADMIN", "HR", "EXECUTIVE"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get employee ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Call API module
    const result = await KaryawanAPI.deleteKaryawan(id);

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

