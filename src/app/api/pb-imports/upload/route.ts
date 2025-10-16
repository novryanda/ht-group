/**
 * POST /api/pb-imports/upload
 * Upload PB Excel file
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { ensureRoleOrThrow } from "~/server/auth/role";
import { PbImportAPI } from "~/server/api/pb-import";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Role check - only PT_PKS_ADMIN and EXECUTIVE can upload
    const allowed = ["PT_PKS_ADMIN", "EXECUTIVE"] as const;
    ensureRoleOrThrow(session.user.role, allowed);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      !file.type.includes("spreadsheet") &&
      !file.type.includes("excel") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      return NextResponse.json(
        { success: false, error: "File must be an Excel file (.xlsx or .xls)" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call application API
    const result = await PbImportAPI.uploadExcel(
      buffer,
      file.name,
      session.user.id
    );

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("POST /api/pb-imports/upload error:", error);
    
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

