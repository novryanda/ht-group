/**
 * API Route: PB Harian (Phase 1 - Weighbridge Data Entry)
 * GET: List tickets, POST: Bulk create tickets
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const VIEW_ROLES = [
  "PT_PKS_ADMIN",
  "FINANCE_AP",
  "FINANCE_AR",
  "GL_ACCOUNTANT",
  "PT_MANAGER",
  "EXECUTIVE",
  "GROUP_VIEWER",
  "OPERATOR",
];

const EDIT_ROLES = ["PT_PKS_ADMIN", "FINANCE_AP", "OPERATOR"];

/**
 * GET: List weighbridge tickets with filters
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

    const role = session.user.role;
    if (!role || !VIEW_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Tidak memiliki akses PB Harian",
        },
        { status: 403 }
      );
    }

    const company = await getPTPKSCompany();
    const { searchParams } = new URL(request.url);

    const query = {
      companyId: company.id,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      supplierId: searchParams.get("supplierId") ?? undefined,
      vehicleId: searchParams.get("vehicleId") ?? undefined,
      itemId: searchParams.get("itemId") ?? undefined,
      status: searchParams.get("status") as
        | "DRAFT"
        | "APPROVED"
        | "POSTED"
        | undefined,
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    };

    const result = await WeighbridgeAPI.getList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST: Bulk create PB Harian tickets
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

    const role = session.user.role;
    if (!role || !EDIT_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - Tidak boleh membuat PB Harian",
        },
        { status: 403 }
      );
    }

  const userId = session.user.id;
    const body = (await request.json()) as unknown;

    const result = await WeighbridgeAPI.bulkCreatePBHarian(body, userId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
