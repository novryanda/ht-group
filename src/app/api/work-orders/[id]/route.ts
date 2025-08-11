import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import {
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
  canUpdateWorkOrder
} from "~/server/api/work-orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const workOrder = await getWorkOrderById(id);
    
    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error fetching work order:", error);
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the work order first to check permissions
    const { id } = await params;
    const existingWorkOrder = await getWorkOrderById(id);
    
    // Check if user can update this work order
    const userRole = session.user.role;
    const userId = session.user.employeeId || "";

    if (!canUpdateWorkOrder(existingWorkOrder, userRole, userId)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const workOrder = await updateWorkOrder(id, body);
    
    return NextResponse.json(workOrder);
  } catch (error) {
    console.error("Error updating work order:", error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only PT Manager and Unit Supervisor can delete work orders
    const userRole = session.user.role;
    if (!["PT_MANAGER", "UNIT_SUPERVISOR"].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteWorkOrder(id);
    
    return NextResponse.json({ message: "Work Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting work order:", error);
    
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
