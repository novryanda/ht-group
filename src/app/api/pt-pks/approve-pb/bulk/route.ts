import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";

const APPROVE_ROLES = ["PT_PKS_ADMIN", "FINANCE_AP", "PT_MANAGER"];

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
    const { ticketIds } = body as { ticketIds: Array<{ ticketId: string; warehouseId: string }> };

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ success: false, error: "ticketIds required" }, { status: 400 });
    }

    const result = await WeighbridgeAPI.bulkApproveTickets(
      ticketIds,
      session.user.id as string
    );
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/approve-pb/bulk:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

