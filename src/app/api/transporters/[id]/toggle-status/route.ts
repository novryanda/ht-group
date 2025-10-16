import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { TransporterAPI } from "~/server/api/transporters";

/**
 * PATCH /api/transporters/[id]/toggle-status
 * Toggle transporter status (AKTIF <-> NONAKTIF)
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

    // Check role - only PT_PKS_ADMIN can toggle status
    const userRole = (session.user as any).role;
    if (userRole !== "PT_PKS_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only PT_PKS_ADMIN can toggle transporter status" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await TransporterAPI.toggleTransporterStatus(id);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in PATCH /api/transporters/[id]/toggle-status:", error);
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
