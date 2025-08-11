import { db } from "~/server/db";

// Define types locally until Prisma generates them
type WorkOrder = any;
type WorkOrderStatus = "DRAFT" | "IN_PROGRESS" | "WAITING_REVIEW" | "APPROVED" | "BILLED" | "CLOSED" | "CANCELLED";
type WorkOrderType = "PREVENTIVE_MAINTENANCE" | "CORRECTIVE_MAINTENANCE" | "INSPECTION" | "REPAIR" | "INSTALLATION";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type UnitType = "HVAC_RITTAL" | "HVAC_SPLIT" | "FABRIKASI" | "EFLUEN" | "CUTTING_GRASS";

export interface CreateWorkOrderInput {
  title: string;
  description?: string;
  type: WorkOrderType;
  priority: Priority;
  scheduledDate?: Date;
  estimatedHours?: number;
  companyId: string;
  unitId: string;
  assetId?: string;
  assignedToId?: string;
  createdById: string;
}

export interface UpdateWorkOrderInput {
  title?: string;
  description?: string;
  type?: WorkOrderType;
  priority?: Priority;
  status?: WorkOrderStatus;
  scheduledDate?: Date;
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  cost?: number;
  notes?: string;
  assignedToId?: string;
}

export interface WorkOrderFilters {
  companyId?: string;
  unitId?: string;
  status?: WorkOrderStatus;
  priority?: Priority;
  type?: WorkOrderType;
  assignedToId?: string;
  assetId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export class WorkOrderService {
  static async create(input: CreateWorkOrderInput): Promise<WorkOrder> {
    // Generate WO Number
    const year = new Date().getFullYear();
    const count = await db.workOrder.count({
      where: {
        companyId: input.companyId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });
    
    const woNumber = `WO-${year}-${String(count + 1).padStart(3, "0")}`;

    return db.workOrder.create({
      data: {
        ...input,
        woNumber,
      },
      include: {
        company: true,
        unit: true,
        asset: true,
        assignedTo: true,
        createdBy: true,
      },
    });
  }

  static async findMany(filters: WorkOrderFilters = {}) {
    const where: any = {};

    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.unitId) where.unitId = filters.unitId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.type) where.type = filters.type;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.assetId) where.assetId = filters.assetId;

    if (filters.dateFrom || filters.dateTo) {
      where.scheduledDate = {};
      if (filters.dateFrom) where.scheduledDate.gte = filters.dateFrom;
      if (filters.dateTo) where.scheduledDate.lte = filters.dateTo;
    }

    if (filters.search) {
      where.OR = [
        { woNumber: { contains: filters.search, mode: "insensitive" } },
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { asset: { assetCode: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    return db.workOrder.findMany({
      where,
      include: {
        company: true,
        unit: true,
        asset: true,
        assignedTo: true,
        createdBy: true,
        checklists: {
          include: {
            template: true,
            items: {
              include: {
                item: true,
              },
            },
          },
        },
        parts: {
          include: {
            part: true,
          },
        },
        timesheets: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findById(id: string) {
    return db.workOrder.findUnique({
      where: { id },
      include: {
        company: true,
        unit: true,
        asset: true,
        assignedTo: true,
        createdBy: true,
        checklists: {
          include: {
            template: true,
            items: {
              include: {
                item: true,
              },
            },
          },
        },
        parts: {
          include: {
            part: true,
          },
        },
        timesheets: {
          include: {
            employee: true,
          },
        },
        invoices: true,
      },
    });
  }

  static async update(id: string, input: UpdateWorkOrderInput) {
    return db.workOrder.update({
      where: { id },
      data: input,
      include: {
        company: true,
        unit: true,
        asset: true,
        assignedTo: true,
        createdBy: true,
      },
    });
  }

  static async delete(id: string) {
    return db.workOrder.delete({
      where: { id },
    });
  }

  static async updateStatus(id: string, status: WorkOrderStatus) {
    const updateData: any = { status };
    
    // Auto-set dates based on status
    if (status === "IN_PROGRESS" && !updateData.startDate) {
      updateData.startDate = new Date();
    }
    
    if (status === "CLOSED" && !updateData.endDate) {
      updateData.endDate = new Date();
    }

    return db.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        unit: true,
        asset: true,
        assignedTo: true,
        createdBy: true,
      },
    });
  }

  static async getStatistics(companyId?: string, unitId?: string) {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (unitId) where.unitId = unitId;

    const [
      total,
      draft,
      inProgress,
      waitingReview,
      approved,
      closed,
      overdue,
    ] = await Promise.all([
      db.workOrder.count({ where }),
      db.workOrder.count({ where: { ...where, status: "DRAFT" } }),
      db.workOrder.count({ where: { ...where, status: "IN_PROGRESS" } }),
      db.workOrder.count({ where: { ...where, status: "WAITING_REVIEW" } }),
      db.workOrder.count({ where: { ...where, status: "APPROVED" } }),
      db.workOrder.count({ where: { ...where, status: "CLOSED" } }),
      db.workOrder.count({
        where: {
          ...where,
          scheduledDate: { lt: new Date() },
          status: { notIn: ["CLOSED", "CANCELLED"] },
        },
      }),
    ]);

    return {
      total,
      draft,
      inProgress,
      waitingReview,
      approved,
      closed,
      overdue,
    };
  }
}
