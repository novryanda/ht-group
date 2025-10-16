import { db } from "~/server/db";
import { type Prisma } from "@prisma/client";
import type {
  CreateGrnDTO,
  CreateIssueDTO,
  CreateTransferDTO,
  CreateAdjustmentDTO,
  CreateCountDTO,
} from "~/server/types/inventory";

// ============================================================================
// GOODS RECEIPT NOTE (GRN) REPOSITORY
// ============================================================================

export class GoodsReceiptRepository {
  static async create(receiptNo: string, data: CreateGrnDTO) {
    return db.goodsReceipt.create({
      data: {
        receiptNo,
        warehouseId: data.warehouseId,
        date: data.date,
        note: data.note,
        items: {
          create: data.items.map((item) => ({
            materialId: item.materialId,
            locationId: item.locationId,
            uomId: item.uomId,
            qty: item.qty,
            note: item.note,
          })),
        },
      },
      include: {
        warehouse: true,
        items: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: true,
            uom: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return db.goodsReceipt.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: true,
            uom: true,
          },
        },
      },
    });
  }

  static async findByReceiptNo(receiptNo: string) {
    return db.goodsReceipt.findUnique({
      where: { receiptNo },
      include: {
        warehouse: true,
        items: {
          include: {
            material: true,
            location: true,
            uom: true,
          },
        },
      },
    });
  }

  static async findMany(filter: { warehouseId?: string; dateFrom?: Date; dateTo?: Date; page: number; pageSize: number }) {
    const { warehouseId, dateFrom, dateTo, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.GoodsReceiptWhereInput = {
      ...(warehouseId && { warehouseId }),
      ...(dateFrom && { date: { gte: dateFrom } }),
      ...(dateTo && { date: { lte: dateTo } }),
    };

    const [grns, total] = await Promise.all([
      db.goodsReceipt.findMany({
        where,
        include: {
          warehouse: true,
          items: {
            include: {
              material: true,
              location: true,
              uom: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      db.goodsReceipt.count({ where }),
    ]);

    return { grns, total };
  }

  static async getLastReceiptNoForMonth(yearMonth: string) {
    const prefix = `GRN-${yearMonth}-`;
    const lastGrn = await db.goodsReceipt.findFirst({
      where: {
        receiptNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        receiptNo: "desc",
      },
      select: {
        receiptNo: true,
      },
    });

    return lastGrn?.receiptNo ?? null;
  }
}

// ============================================================================
// GOODS ISSUE REPOSITORY
// ============================================================================

export class GoodsIssueRepository {
  static async create(issueNo: string, data: CreateIssueDTO) {
    return db.goodsIssue.create({
      data: {
        issueNo,
        warehouseId: data.warehouseId,
        date: data.date,
        requesterId: data.requesterId,
        costCenter: data.costCenter,
        note: data.note,
        items: {
          create: data.items.map((item) => ({
            materialId: item.materialId,
            locationId: item.locationId,
            uomId: item.uomId,
            qty: item.qty,
            note: item.note,
          })),
        },
      },
      include: {
        warehouse: true,
        items: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: true,
            uom: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return db.goodsIssue.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: true,
            uom: true,
          },
        },
      },
    });
  }

  static async findMany(filter: { warehouseId?: string; dateFrom?: Date; dateTo?: Date; page: number; pageSize: number }) {
    const { warehouseId, dateFrom, dateTo, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.GoodsIssueWhereInput = {
      ...(warehouseId && { warehouseId }),
      ...(dateFrom && { date: { gte: dateFrom } }),
      ...(dateTo && { date: { lte: dateTo } }),
    };

    const [issues, total] = await Promise.all([
      db.goodsIssue.findMany({
        where,
        include: {
          warehouse: true,
          items: {
            include: {
              material: true,
              location: true,
              uom: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      db.goodsIssue.count({ where }),
    ]);

    return { issues, total };
  }

  static async getLastIssueNoForMonth(yearMonth: string) {
    const prefix = `ISS-${yearMonth}-`;
    const lastIssue = await db.goodsIssue.findFirst({
      where: {
        issueNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        issueNo: "desc",
      },
      select: {
        issueNo: true,
      },
    });

    return lastIssue?.issueNo ?? null;
  }
}

// ============================================================================
// STOCK TRANSFER REPOSITORY
// ============================================================================

export class StockTransferRepository {
  static async create(transferNo: string, data: CreateTransferDTO) {
    return db.stockTransfer.create({
      data: {
        transferNo,
        date: data.date,
        fromLocId: data.fromLocId,
        toLocId: data.toLocId,
        materialId: data.materialId,
        uomId: data.uomId,
        qty: data.qty,
        note: data.note,
      },
      include: {
        fromLoc: {
          include: {
            warehouse: true,
          },
        },
        toLoc: {
          include: {
            warehouse: true,
          },
        },
        material: {
          include: {
            category: true,
            baseUom: true,
          },
        },
        uom: true,
      },
    });
  }

  static async findById(id: string) {
    return db.stockTransfer.findUnique({
      where: { id },
      include: {
        fromLoc: {
          include: {
            warehouse: true,
          },
        },
        toLoc: {
          include: {
            warehouse: true,
          },
        },
        material: {
          include: {
            category: true,
            baseUom: true,
          },
        },
        uom: true,
      },
    });
  }

  static async findMany(filter: { materialId?: string; dateFrom?: Date; dateTo?: Date; page: number; pageSize: number }) {
    const { materialId, dateFrom, dateTo, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockTransferWhereInput = {
      ...(materialId && { materialId }),
      ...(dateFrom && { date: { gte: dateFrom } }),
      ...(dateTo && { date: { lte: dateTo } }),
    };

    const [transfers, total] = await Promise.all([
      db.stockTransfer.findMany({
        where,
        include: {
          fromLoc: {
            include: {
              warehouse: true,
            },
          },
          toLoc: {
            include: {
              warehouse: true,
            },
          },
          material: true,
          uom: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      db.stockTransfer.count({ where }),
    ]);

    return { transfers, total };
  }

  static async getLastTransferNoForMonth(yearMonth: string) {
    const prefix = `TRF-${yearMonth}-`;
    const lastTransfer = await db.stockTransfer.findFirst({
      where: {
        transferNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        transferNo: "desc",
      },
      select: {
        transferNo: true,
      },
    });

    return lastTransfer?.transferNo ?? null;
  }
}

// ============================================================================
// STOCK ADJUSTMENT REPOSITORY
// ============================================================================

export class StockAdjustmentRepository {
  static async create(adjNo: string, data: CreateAdjustmentDTO) {
    return db.stockAdjustment.create({
      data: {
        adjNo,
        date: data.date,
        reason: data.reason,
        items: {
          create: data.items.map((item) => ({
            materialId: item.materialId,
            locationId: item.locationId,
            qtyDiff: item.qtyDiff,
            note: item.note,
          })),
        },
      },
      include: {
        items: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return db.stockAdjustment.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  static async findMany(filter: { dateFrom?: Date; dateTo?: Date; page: number; pageSize: number }) {
    const { dateFrom, dateTo, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockAdjustmentWhereInput = {
      ...(dateFrom && { date: { gte: dateFrom } }),
      ...(dateTo && { date: { lte: dateTo } }),
    };

    const [adjustments, total] = await Promise.all([
      db.stockAdjustment.findMany({
        where,
        include: {
          items: {
            include: {
              material: true,
              location: {
                include: {
                  warehouse: true,
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      db.stockAdjustment.count({ where }),
    ]);

    return { adjustments, total };
  }

  static async getLastAdjNoForMonth(yearMonth: string) {
    const prefix = `ADJ-${yearMonth}-`;
    const lastAdj = await db.stockAdjustment.findFirst({
      where: {
        adjNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        adjNo: "desc",
      },
      select: {
        adjNo: true,
      },
    });

    return lastAdj?.adjNo ?? null;
  }
}

// ============================================================================
// STOCK COUNT (OPNAME) REPOSITORY
// ============================================================================

export class StockCountRepository {
  static async create(countNo: string, data: CreateCountDTO) {
    return db.stockCount.create({
      data: {
        countNo,
        warehouseId: data.warehouseId,
        date: data.date,
        areaNote: data.areaNote,
        status: "OPEN",
        lines: {
          create: data.lines.map((line) => ({
            materialId: line.materialId,
            locationId: line.locationId,
            countedQty: line.countedQty,
            systemQty: line.systemQty,
            diffQty: line.countedQty - line.systemQty,
            note: line.note,
          })),
        },
      },
      include: {
        warehouse: true,
        lines: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return db.stockCount.findUnique({
      where: { id },
      include: {
        warehouse: true,
        lines: {
          include: {
            material: {
              include: {
                category: true,
                baseUom: true,
              },
            },
            location: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  static async findMany(filter: { warehouseId?: string; status?: string; dateFrom?: Date; dateTo?: Date; page: number; pageSize: number }) {
    const { warehouseId, status, dateFrom, dateTo, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockCountWhereInput = {
      ...(warehouseId && { warehouseId }),
      ...(status && { status }),
      ...(dateFrom && { date: { gte: dateFrom } }),
      ...(dateTo && { date: { lte: dateTo } }),
    };

    const [counts, total] = await Promise.all([
      db.stockCount.findMany({
        where,
        include: {
          warehouse: true,
          lines: {
            include: {
              material: true,
              location: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: pageSize,
      }),
      db.stockCount.count({ where }),
    ]);

    return { counts, total };
  }

  static async updateStatus(id: string, status: string) {
    return db.stockCount.update({
      where: { id },
      data: { status },
      include: {
        warehouse: true,
        lines: {
          include: {
            material: true,
            location: true,
          },
        },
      },
    });
  }

  static async getLastCountNoForMonth(yearMonth: string) {
    const prefix = `CNT-${yearMonth}-`;
    const lastCount = await db.stockCount.findFirst({
      where: {
        countNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        countNo: "desc",
      },
      select: {
        countNo: true,
      },
    });

    return lastCount?.countNo ?? null;
  }
}

