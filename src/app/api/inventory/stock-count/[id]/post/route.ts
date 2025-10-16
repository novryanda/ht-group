import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { InventoryDocsAPI } from "~/server/api/inventory-docs";
import { ensureRoleOrThrow } from "~/server/auth/role";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowed = ["UNIT_SUPERVISOR", "PT_PKS_ADMIN", "EXECUTIVE", "GROUP_VIEWER"] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    const { id } = await params;
    const result = await InventoryDocsAPI.postCount(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("POST /api/inventory/stock-count/[id]/post error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

