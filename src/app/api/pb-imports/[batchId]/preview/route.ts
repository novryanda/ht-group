/**
 * GET /api/pb-imports/:batchId/preview
 * Get batch preview with sample rows and validation
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { ensureRoleOrThrow } from "~/server/auth/role";
import { PbImportAPI } from "~/server/api/pb-import";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Role check - read access
    const allowed = [
      "PT_PKS_ADMIN",
      "EXECUTIVE",
      "UNIT_SUPERVISOR",
      "GROUP_VIEWER",
    ] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    // Await params (Next.js 15 requirement)
    const { batchId } = await params;

    // Call application API
    const result = await PbImportAPI.getPreview(batchId);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("GET /api/pb-imports/[batchId]/preview error:", error);
    
    // Handle role authorization error
    if (error instanceof Error && "status" in error && (error as any).status === 403) {
      return NextResponse.json(
        { success: false, error: "Forbidden - insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

