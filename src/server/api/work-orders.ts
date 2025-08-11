import { z } from "zod";
import { WorkOrderService } from "~/server/services/work-order.service";

// Define types locally until Prisma generates them
type WorkOrderStatus = "DRAFT" | "IN_PROGRESS" | "WAITING_REVIEW" | "APPROVED" | "BILLED" | "CLOSED" | "CANCELLED";

// Validation schemas
export const createWorkOrderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["PREVENTIVE_MAINTENANCE", "CORRECTIVE_MAINTENANCE", "INSPECTION", "REPAIR", "INSTALLATION"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  scheduledDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  companyId: z.string().min(1, "Company ID is required"),
  unitId: z.string().min(1, "Unit ID is required"),
  assetId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const updateWorkOrderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["PREVENTIVE_MAINTENANCE", "CORRECTIVE_MAINTENANCE", "INSPECTION", "REPAIR", "INSTALLATION"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "WAITING_REVIEW", "APPROVED", "BILLED", "CLOSED", "CANCELLED"]).optional(),
  scheduledDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const workOrderFiltersSchema = z.object({
  companyId: z.string().optional(),
  unitId: z.string().optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "WAITING_REVIEW", "APPROVED", "BILLED", "CLOSED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  type: z.enum(["PREVENTIVE_MAINTENANCE", "CORRECTIVE_MAINTENANCE", "INSPECTION", "REPAIR", "INSTALLATION"]).optional(),
  assignedToId: z.string().optional(),
  assetId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "IN_PROGRESS", "WAITING_REVIEW", "APPROVED", "BILLED", "CLOSED", "CANCELLED"]),
});

// API Functions
export async function createWorkOrder(input: z.infer<typeof createWorkOrderSchema>, createdById: string) {
  const validatedInput = createWorkOrderSchema.parse(input);
  
  const workOrderData = {
    ...validatedInput,
    scheduledDate: validatedInput.scheduledDate ? new Date(validatedInput.scheduledDate) : undefined,
    createdById,
  };

  return WorkOrderService.create(workOrderData);
}

export async function getWorkOrders(filters: z.infer<typeof workOrderFiltersSchema>) {
  const validatedFilters = workOrderFiltersSchema.parse(filters);
  
  const processedFilters = {
    ...validatedFilters,
    dateFrom: validatedFilters.dateFrom ? new Date(validatedFilters.dateFrom) : undefined,
    dateTo: validatedFilters.dateTo ? new Date(validatedFilters.dateTo) : undefined,
  };

  return WorkOrderService.findMany(processedFilters);
}

export async function getWorkOrderById(id: string) {
  if (!id) {
    throw new Error("Work Order ID is required");
  }

  const workOrder = await WorkOrderService.findById(id);
  
  if (!workOrder) {
    throw new Error("Work Order not found");
  }

  return workOrder;
}

export async function updateWorkOrder(id: string, input: z.infer<typeof updateWorkOrderSchema>) {
  const validatedInput = updateWorkOrderSchema.parse(input);
  
  const updateData = {
    ...validatedInput,
    scheduledDate: validatedInput.scheduledDate ? new Date(validatedInput.scheduledDate) : undefined,
    startDate: validatedInput.startDate ? new Date(validatedInput.startDate) : undefined,
    endDate: validatedInput.endDate ? new Date(validatedInput.endDate) : undefined,
  };

  return WorkOrderService.update(id, updateData);
}

export async function deleteWorkOrder(id: string) {
  if (!id) {
    throw new Error("Work Order ID is required");
  }

  return WorkOrderService.delete(id);
}

export async function updateWorkOrderStatus(id: string, input: z.infer<typeof updateStatusSchema>) {
  const { status } = updateStatusSchema.parse(input);
  
  return WorkOrderService.updateStatus(id, status);
}

export async function getWorkOrderStatistics(companyId?: string, unitId?: string) {
  return WorkOrderService.getStatistics(companyId, unitId);
}

// Helper functions for business logic
export function canUpdateWorkOrder(workOrder: any, userRole: string, userId: string): boolean {
  // Group Viewer and Executive can only view
  if (["GROUP_VIEWER", "EXECUTIVE"].includes(userRole)) {
    return false;
  }

  // PT Manager can update all WOs in their company
  if (userRole === "PT_MANAGER") {
    return true;
  }

  // Unit Supervisor can update WOs in their unit
  if (userRole === "UNIT_SUPERVISOR") {
    return true; // Additional check for unit ownership should be done in the calling code
  }

  // Technician/Operator can only update WOs assigned to them
  if (["TECHNICIAN", "OPERATOR"].includes(userRole)) {
    return workOrder.assignedToId === userId;
  }

  return false;
}

export function getAvailableStatusTransitions(currentStatus: WorkOrderStatus, userRole: string): WorkOrderStatus[] {
  const transitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    DRAFT: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["WAITING_REVIEW", "CANCELLED"],
    WAITING_REVIEW: ["APPROVED", "IN_PROGRESS"], // Can send back for revision
    APPROVED: ["BILLED", "CLOSED"],
    BILLED: ["CLOSED"],
    CLOSED: [], // Final state
    CANCELLED: [], // Final state
  };

  let availableTransitions = transitions[currentStatus] || [];

  // Role-based restrictions
  if (["TECHNICIAN", "OPERATOR"].includes(userRole)) {
    // Technicians can only move to WAITING_REVIEW or CANCELLED
    availableTransitions = availableTransitions.filter(status => 
      ["WAITING_REVIEW", "CANCELLED"].includes(status)
    );
  }

  return availableTransitions;
}
