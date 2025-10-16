/**
 * PUT /api/pb-imports/:batchId/map
 * Update row mappings (supplier/vehicle)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { ensureRoleOrThrow } from "~/server/auth/role";
import { PbImportAPI } from "~/server/api/pb-import";
import { mapRowSchema } from "~/server/schemas/pb-import";

export async function PUT(
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

    // Role check - write access
    const allowed = ["PT_PKS_ADMIN", "EXECUTIVE"] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    // Await params (Next.js 15 requirement)
    const { batchId } = await params;

    // Parse and validate request body
    const body = await req.json();
    const validated = mapRowSchema.parse(body);

    // Call application API
    const result = await PbImportAPI.mapRows(batchId, validated);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("PUT /api/pb-imports/[batchId]/map error:", error);
    
    // Handle role authorization error
    if (error instanceof Error && "status" in error && (error as any).status === 403) {
      return NextResponse.json(
        { success: false, error: "Forbidden - insufficient permissions" },
        { status: 403 }
      );
    }

    // Handle validation error
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

