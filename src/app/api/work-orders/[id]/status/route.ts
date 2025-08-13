import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {
  getWorkOrderById,
  updateWorkOrderStatus,
  getAvailableStatusTransitions
} from "~/server/api/work-orders";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the work order first to check current status and permissions
    const { id } = await params;
    const existingWorkOrder = await getWorkOrderById(id);
    
    const body = await request.json();
    const { status: newStatus } = body;

    // Check if the status transition is allowed for this user role
    const userRole = (session.user as any).role;
    const availableTransitions = getAvailableStatusTransitions(
      existingWorkOrder.status,
      userRole
    );

    if (!availableTransitions.includes(newStatus)) {
      return NextResponse.json(
        { 
          error: "Status transition not allowed",
          availableTransitions 
        },
        { status: 400 }
      );
    }

    const workOrder = await updateWorkOrderStatus(id, { status: newStatus });
    
    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error updating work order status:", error);
    
    if (error instanceof Error) {
      if (error.message === "Work Order not found") {
        return NextResponse.json(
          { error: "Work Order not found" },
          { status: 404 }
        );
      }
      
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the work order to check current status
    const { id } = await params;
    const workOrder = await getWorkOrderById(id);
    
    // Get available status transitions for this user
    const userRole = (session.user as any).role;
    const availableTransitions = getAvailableStatusTransitions(
      workOrder.status,
      userRole
    );
    
    return NextResponse.json({
      currentStatus: workOrder.status,
      availableTransitions,
    });
  } catch (error) {
    console.error("Error getting work order status transitions:", error);
    
    if (error instanceof Error && error.message === "Work Order not found") {
      return NextResponse.json(
        { error: "Work Order not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
