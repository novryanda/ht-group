import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { InventoryDocsAPI } from "~/server/api/inventory-docs";
import { ensureRoleOrThrow } from "~/server/auth/role";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = {
      search: searchParams.get("search") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      pageSize: parseInt(searchParams.get("pageSize") ?? "20"),
    };

    const result = await InventoryDocsAPI.getAdjustmentList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("GET /api/inventory/adjustment error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowed = ["UNIT_SUPERVISOR", "PT_PKS_ADMIN", "EXECUTIVE", "GROUP_VIEWER"] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    const body = await req.json();
    const result = await InventoryDocsAPI.createAdjustment(body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("POST /api/inventory/adjustment error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

