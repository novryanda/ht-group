import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { TransporterAPI } from "~/server/api/pt-pks/transporters";

/**
 * GET /api/transporters
 * Get all transporters with filtering and pagination
 * Access: PT_PKS_ADMIN, FINANCE_AP, FINANCE_AR, GL_ACCOUNTANT, EXECUTIVE, GROUP_VIEWER
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - read access
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      query: searchParams.get("query") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      pkpStatus: searchParams.get("pkpStatus") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      province: searchParams.get("province") ?? undefined,
      commodity: searchParams.get("commodity") ?? undefined,
      page: searchParams.get("page") ?? "1",
      pageSize: searchParams.get("pageSize") ?? "10",
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: searchParams.get("sortOrder") ?? "desc",
    };

    const result = await TransporterAPI.getTransporters(queryParams);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/transporters:", error);
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
 * POST /api/transporters
 * Create new transporter
 * Access: PT_PKS_ADMIN only
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only PT_PKS_ADMIN can create
    const userRole = (session.user as any).role;
    if (userRole !== "PT_PKS_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only PT_PKS_ADMIN can create transporters" },
        { status: 403 }
      );
    }

    // Parse request body
    const body: unknown = await request.json();

    // Create transporter
    const result = await TransporterAPI.createTransporter(body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/transporters:", error);
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

