import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { InventoryAPI } from "~/server/api/inventory";
import { ensureRoleOrThrow } from "~/server/auth/role";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await InventoryAPI.getMaterialById(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("GET /api/inventory/materials/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowed = ["UNIT_SUPERVISOR", "PT_PKS_ADMIN", "EXECUTIVE", "GROUP_VIEWER"] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    const { id } = await params;
    const body = await req.json();
    const result = await InventoryAPI.updateMaterial(id, body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("PATCH /api/inventory/materials/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allowed = ["PT_PKS_ADMIN", "EXECUTIVE"] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    const { id } = await params;
    const result = await InventoryAPI.deleteMaterial(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("DELETE /api/inventory/materials/[id] error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

