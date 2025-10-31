import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

const VIEW_ROLES = [
  "PT_PKS_ADMIN",
  "FINANCE_AP",
  "GL_ACCOUNTANT",
  "PT_MANAGER",
  "EXECUTIVE",
];

const APPROVE_ROLES = ["PT_PKS_ADMIN", "FINANCE_AP", "PT_MANAGER"];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (!role || !VIEW_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const company = await getPTPKSCompany();
    const { searchParams } = new URL(request.url);
    const query = {
      companyId: company.id,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      supplierId: searchParams.get("supplierId") ?? undefined,
      status: searchParams.get("status") as "DRAFT" | "POSTED" | "APPROVED" | undefined,
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "20",
    };

    const result = await WeighbridgeAPI.listForApproval(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/pt-pks/approve-pb:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (!role || !APPROVE_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { ticketId, approved, warehouseId } = body as { ticketId: string; approved: boolean; warehouseId?: string };
    const result = await WeighbridgeAPI.approveTicket(ticketId, approved, session.user.id as string, warehouseId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/approve-pb:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}


