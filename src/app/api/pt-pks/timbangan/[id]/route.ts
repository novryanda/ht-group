/**
 * API Route: Single Weighbridge Ticket Operations
 * GET: Get by ID, DELETE: Delete ticket
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";

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

const DELETE_ROLES = ["PT_PKS_ADMIN", "FINANCE_AP"];

/**
 * GET: Get ticket by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const result = await WeighbridgeAPI.getById(id);
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
 * DELETE: Delete ticket (only DRAFT status)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;
    if (!role || !DELETE_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const result = await WeighbridgeAPI.delete(id);
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
