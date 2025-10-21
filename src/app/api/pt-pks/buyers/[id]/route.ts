import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { BuyerAPI } from "~/server/api/pt-pks/buyers";

/**
 * GET /api/buyers/[id]
 * Get buyer by ID
 * Access: PT_PKS_ADMIN, EXECUTIVE, GROUP_VIEWER
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role
    const userRole = (session.user as any).role;
    const allowedRoles = ["PT_PKS_ADMIN", "EXECUTIVE", "GROUP_VIEWER"];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await BuyerAPI.getBuyerById(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/buyers/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/buyers/[id]
 * Update buyer
 * Access: PT_PKS_ADMIN only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only PT_PKS_ADMIN can update
    const userRole = (session.user as any).role;
    if (userRole !== "PT_PKS_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only PT_PKS_ADMIN can update buyers" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: unknown = await request.json();

    const result = await BuyerAPI.updateBuyer(id, body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in PATCH /api/buyers/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body or internal error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/buyers/[id]
 * Delete buyer
 * Access: PT_PKS_ADMIN only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only PT_PKS_ADMIN can delete
    const userRole = (session.user as any).role;
    if (userRole !== "PT_PKS_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only PT_PKS_ADMIN can delete buyers" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await BuyerAPI.deleteBuyer(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in DELETE /api/buyers/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

