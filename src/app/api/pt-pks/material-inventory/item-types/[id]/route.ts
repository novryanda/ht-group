import { NextRequest, NextResponse } from "next/server";
import { ItemTypesAPI } from "~/server/api/pt-pks/item-types";
import { auth } from "~/server/auth";
import { hasCompanyAccess } from "~/lib/rbac";

/**
 * GET /api/pt-pks/material-inventory/item-types/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await ItemTypesAPI.getById(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ GET /api/pt-pks/material-inventory/item-types/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pt-pks/material-inventory/item-types/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = await ItemTypesAPI.update(id, body);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ PUT /api/pt-pks/material-inventory/item-types/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pt-pks/material-inventory/item-types/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!hasCompanyAccess(session, "PT-PKS")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await ItemTypesAPI.delete(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("❌ DELETE /api/pt-pks/material-inventory/item-types/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
