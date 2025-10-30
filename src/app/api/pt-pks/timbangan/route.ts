/**
 * API Route: Timbangan (Phase 2 - Pricing Input)
 * GET: List tickets with pricing, PATCH: Bulk update pricing
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const VIEW_ROLES = [
  "PT_PKS_ADMIN",
  "OPERATOR",
  "FINANCE_AP",
  "FINANCE_AR",
  "GL_ACCOUNTANT",
  "PT_MANAGER",
  "EXECUTIVE",
  "GROUP_VIEWER",
];

const EDIT_ROLES = ["PT_PKS_ADMIN", "FINANCE_AP"];

/**
 * GET: List weighbridge tickets (for pricing input)
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
          error: "Forbidden - Tidak memiliki akses timbangan",
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
 * PATCH: Update pricing for a single ticket
 * Body: { id: string, hargaPerKg: number, pphRate: number, upahBongkarPerKg: number }
 */
export async function PATCH(request: NextRequest) {
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
          error: "Forbidden - Tidak boleh mengubah data timbangan",
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { id: string; [key: string]: unknown };
    const { id, ...pricingData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID tiket wajib diisi" },
        { status: 400 }
      );
    }

    const result = await WeighbridgeAPI.updatePricing(id, pricingData);
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
