import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export class WarehouseInboundRepo {
  /**
   * Create new inbound transaction (goods receipt)
   */
  async create(
    data: Prisma.GoodsReceiptCreateInput,
    lines: Array<{
      itemId: string;
      unitId: string;
      qty: number;
      unitCost?: number;
      note?: string;
    }>
  ) {
    return db.goodsReceipt.create({
      data: {
        ...data,
        lines: {
          create: lines.map((line) => ({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
            unitCost: line.unitCost,
            note: line.note,
          })),
        },
      },
      include: {
        warehouse: true,
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
   * Update inbound transaction
   */
  async update(
    id: string,
    data: Prisma.GoodsReceiptUpdateInput,
    lines?: Array<{
      itemId: string;
      unitId: string;
      qty: number;
      unitCost?: number;
      note?: string;
    }>
  ) {
    // If lines provided, delete old lines and create new ones
    if (lines) {
      await db.goodsReceiptLine.deleteMany({
        where: { receiptId: id },
      });

      return db.goodsReceipt.update({
        where: { id },
        data: {
          ...data,
          lines: {
            create: lines.map((line) => ({
              itemId: line.itemId,
              unitId: line.unitId,
              qty: line.qty,
              unitCost: line.unitCost,
              note: line.note,
            })),
          },
        },
        include: {
          warehouse: true,
          lines: {
            include: {
              item: true,
              unit: true,
            },
          },
        },
      });
    }

    return db.goodsReceipt.update({
      where: { id },
      data,
      include: {
        warehouse: true,
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
   * Delete inbound transaction
   */
  async delete(id: string) {
    return db.goodsReceipt.delete({
      where: { id },
    });
  }

  /**
   * Find by ID with relations
   */
  async findById(id: string) {
    return db.goodsReceipt.findUnique({
      where: { id },
      include: {
        warehouse: true,
        lines: {
          include: {
            item: {
              include: {
                category: true,
                itemType: true,
                baseUnit: true,
              },
            },
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Find by document number
   */
  async findByDocNumber(docNumber: string) {
    return db.goodsReceipt.findUnique({
      where: { docNumber },
      include: {
        warehouse: true,
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
   * Find many with pagination and filters
   */
  async findManyWithPagination(params: {
    search?: string;
    warehouseId?: string;
    sourceType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { search, warehouseId, sourceType, startDate, endDate } = params;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.GoodsReceiptWhereInput = {
      ...(warehouseId ? { warehouseId } : {}),
      ...(sourceType ? { sourceType } : {}),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { docNumber: { contains: search, mode: "insensitive" } },
              { sourceRef: { contains: search, mode: "insensitive" } },
              { note: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      db.goodsReceipt.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          lines: {
            include: {
              item: true,
              unit: true,
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      db.goodsReceipt.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate next document number for the month
   */
  async generateDocNumber(warehouseCode: string, date: Date): Promise<string> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Count existing docs in this month
    const startOfMonth = new Date(year, date.getMonth(), 1);
    const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);

    const count = await db.goodsReceipt.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const seq = String(count + 1).padStart(4, "0");
    return `IN/${warehouseCode}/${seq}/${month}/${year}`;
  }
}
