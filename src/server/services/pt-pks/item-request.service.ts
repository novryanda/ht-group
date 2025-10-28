import { db } from "~/server/db";
import type {
  CreateItemRequestDTO,
  UpdateItemRequestDTO,
  ApproveItemRequestDTO,
  WarehouseTransactionQuery,
} from "~/server/types/pt-pks/warehouse-transaction";
import { Prisma } from "@prisma/client";

export class ItemRequestService {
  /**
   * Get all item requests dengan pagination dan filter
   */
  static async list(query: WarehouseTransactionQuery, companyId: string) {
    const {
      search,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.ItemRequestWhereInput = {};

    if (search) {
      where.OR = [
        { reqNumber: { contains: search, mode: "insensitive" } },
        { requestDept: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      db.itemRequest.findMany({
        where,
        include: {
          lines: {
            include: {
              item: true,
              unit: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "desc" },
      }),
      db.itemRequest.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get item request by ID
   */
  static async getById(id: string) {
    return db.itemRequest.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Create item request
   */
  static async create(data: CreateItemRequestDTO, createdById: string) {
    // Generate request number
    const reqNumber = await this.generateReqNumber();

    // Create item request with lines
    const itemRequest = await db.itemRequest.create({
      data: {
        reqNumber,
        date: new Date(data.date),
        requestDept: data.requestDept,
        reason: data.reason,
        status: "DRAFT",
        relatedFunding: data.relatedFunding,
        createdById,
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
          })),
        },
      },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    return itemRequest;
  }

  /**
   * Update item request
   */
  static async update(
    id: string,
    data: UpdateItemRequestDTO,
    updatedById: string
  ) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Item request not found");
    }

    if (existing.status !== "DRAFT") {
      throw new Error("Can only update draft requests");
    }

    // If lines are provided, delete old lines and create new ones
    if (data.lines) {
      await db.itemRequestLine.deleteMany({
        where: { requestId: id },
      });
    }

    const updated = await db.itemRequest.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        requestDept: data.requestDept,
        reason: data.reason,
        status: data.status,
        relatedFunding: data.relatedFunding,
        lines: data.lines
          ? {
              create: data.lines.map((line) => ({
                itemId: line.itemId,
                unitId: line.unitId,
                qty: line.qty,
              })),
            }
          : undefined,
      },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Submit for approval
   */
  static async submit(id: string) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Item request not found");
    }

    if (existing.status !== "DRAFT") {
      throw new Error("Can only submit draft requests");
    }

    return db.itemRequest.update({
      where: { id },
      data: { status: "PENDING" },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Approve or reject item request
   */
  static async approve(data: ApproveItemRequestDTO, approvedById: string) {
    const existing = await this.getById(data.requestId);
    if (!existing) {
      throw new Error("Item request not found");
    }

    if (existing.status !== "PENDING") {
      throw new Error("Can only approve pending requests");
    }

    const newStatus = data.approved ? "APPROVED" : "REJECTED";

    return db.itemRequest.update({
      where: { id: data.requestId },
      data: {
        status: newStatus,
      },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Mark as fulfilled (after goods issued)
   */
  static async markFulfilled(id: string) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Item request not found");
    }

    if (existing.status !== "APPROVED") {
      throw new Error("Can only fulfill approved requests");
    }

    return db.itemRequest.update({
      where: { id },
      data: { status: "FULFILLED" },
      include: {
        lines: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Delete item request
   */
  static async delete(id: string) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error("Item request not found");
    }

    if (existing.status !== "DRAFT") {
      throw new Error("Can only delete draft requests");
    }

    await db.itemRequest.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Generate request number
   */
  private static async generateReqNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `REQ/${year}/${month}/`;

    const lastReq = await db.itemRequest.findFirst({
      where: {
        reqNumber: { startsWith: prefix },
      },
      orderBy: { reqNumber: "desc" },
    });

    let sequence = 1;
    if (lastReq) {
      const lastSeq = parseInt(lastReq.reqNumber.split("/").pop() || "0");
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, "0")}`;
  }
}
