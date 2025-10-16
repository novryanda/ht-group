import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { InventoryAPI } from "~/server/api/inventory";
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
      categoryId: searchParams.get("categoryId") ?? undefined,
      isActive: searchParams.get("isActive") === "true" ? true : searchParams.get("isActive") === "false" ? false : undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortDir: searchParams.get("sortDir") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      pageSize: parseInt(searchParams.get("pageSize") ?? "20"),
    };

    const result = await InventoryAPI.getMaterialList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("GET /api/inventory/materials error:", error);
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
    const result = await InventoryAPI.createMaterial(body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("POST /api/inventory/materials error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

