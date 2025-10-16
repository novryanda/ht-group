import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { TransporterAPI } from "~/server/api/transporters";

/**
 * GET /api/transporters/[id]
 * Get transporter by ID
 * Access: PT_PKS_ADMIN, FINANCE_AP, FINANCE_AR, GL_ACCOUNTANT, EXECUTIVE, GROUP_VIEWER
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
    const allowedRoles = [
      "PT_PKS_ADMIN",
      "FINANCE_AP",
      "FINANCE_AR",
      "GL_ACCOUNTANT",
      "PT_MANAGER",
      "EXECUTIVE",
      "GROUP_VIEWER",
    ];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await TransporterAPI.getTransporterById(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/transporters/[id]:", error);
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
 * PUT /api/transporters/[id]
 * Update transporter
 * Access: PT_PKS_ADMIN only
 */
export async function PUT(
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
        { success: false, error: "Forbidden - Only PT_PKS_ADMIN can update transporters" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body: unknown = await request.json();

    const result = await TransporterAPI.updateTransporter(id, body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in PUT /api/transporters/[id]:", error);
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
 * DELETE /api/transporters/[id]
 * Hard delete transporter (permanently remove from database)
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
        { success: false, error: "Forbidden - Only PT_PKS_ADMIN can delete transporters" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await TransporterAPI.hardDeleteTransporter(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in DELETE /api/transporters/[id]:", error);
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

