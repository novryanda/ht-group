import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {
  createWorkOrder,
  getWorkOrders,
  getWorkOrderStatistics,
  workOrderFiltersSchema
} from "~/server/api/work-orders";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const rawFilters = {
      companyId: searchParams.get("companyId") || undefined,
      unitId: searchParams.get("unitId") || undefined,
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      type: searchParams.get("type") || undefined,
      assignedToId: searchParams.get("assignedToId") || undefined,
      assetId: searchParams.get("assetId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Remove undefined values
    const filters = Object.fromEntries(
      Object.entries(rawFilters).filter(([_, value]) => value !== undefined)
    );

    // Check if requesting statistics
    if (searchParams.get("statistics") === "true") {
      const stats = await getWorkOrderStatistics(filters.companyId, filters.unitId);
      return NextResponse.json(stats);
    }

    const workOrders = await getWorkOrders(filters);
    
    return NextResponse.json(workOrders);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create work orders
    const userRole = (session.user as any).role;
    if (!["PT_MANAGER", "UNIT_SUPERVISOR"].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Get employee ID from session
    const employeeId = (session.user as any).employeeId;
    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 400 }
      );
    }

    const workOrder = await createWorkOrder(body, employeeId);
    
    return NextResponse.json(workOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating work order:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
