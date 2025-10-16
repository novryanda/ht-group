import { db } from "~/server/db";
import { type Prisma, type LedgerType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { StockFilter, LedgerFilter } from "~/server/types/inventory";

// ============================================================================
// STOCK REPOSITORY
// ============================================================================

export class StockRepository {
  /**
   * Get stock by material and location
   */
  static async findByMaterialAndLocation(materialId: string, locationId: string) {
    return db.stock.findUnique({
      where: {
        materialId_locationId: { materialId, locationId },
      },
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
    });
  }

  /**
   * Upsert stock (create or update)
   */
  static async upsert(materialId: string, locationId: string, qtyOnHand: Decimal, avgCost?: Decimal) {
    return db.stock.upsert({
      where: {
        materialId_locationId: { materialId, locationId },
      },
      create: {
        materialId,
        locationId,
        qtyOnHand,
        avgCost,
      },
      update: {
        qtyOnHand,
        ...(avgCost !== undefined && { avgCost }),
      },
      include: {
        material: true,
        location: true,
      },
    });
  }

  /**
   * Find many stocks with filters
   */
  static async findMany(filter: StockFilter & { page: number; pageSize: number }) {
    const { materialId, locationId, warehouseId, minQty, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockWhereInput = {
      ...(materialId && { materialId }),
      ...(locationId && { locationId }),
      ...(warehouseId && { location: { warehouseId } }),
      ...(minQty !== undefined && { qtyOnHand: { gte: new Decimal(minQty) } }),
    };

    const [stocks, total] = await Promise.all([
      db.stock.findMany({
        where,
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
        orderBy: [{ material: { name: "asc" } }, { location: { code: "asc" } }],
        skip,
        take: pageSize,
      }),
      db.stock.count({ where }),
    ]);

    return { stocks, total };
  }

  /**
   * Get low stock items (below reorder point)
   */
  static async findLowStock() {
    return db.stock.findMany({
      where: {
        material: {
          reorderPoint: { not: null },
        },
      },
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
    }).then((stocks) =>
      stocks.filter((stock) => {
        const reorderPoint = stock.material.reorderPoint;
        return reorderPoint && stock.qtyOnHand.lte(reorderPoint);
      })
    );
  }
}

// ============================================================================
// STOCK LEDGER REPOSITORY
// ============================================================================

export class StockLedgerRepository {
  /**
   * Create ledger entry
   */
  static async create(data: {
    materialId: string;
    locationId: string;
    ledgerType: LedgerType;
    qty: Decimal;
    beforeQty?: Decimal;
    afterQty?: Decimal;
    refTable?: string;
    refId?: string;
    note?: string;
  }) {
    return db.stockLedger.create({
      data: {
        ...data,
        ts: new Date(),
      },
    });
  }

  /**
   * Find many ledger entries with filters
   */
  static async findMany(filter: LedgerFilter & { page: number; pageSize: number }) {
    const { materialId, locationId, warehouseId, ledgerType, dateFrom, dateTo, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockLedgerWhereInput = {
      ...(materialId && { materialId }),
      ...(locationId && { locationId }),
      ...(warehouseId && { location: { warehouseId } }),
      ...(ledgerType && { ledgerType }),
      ...(dateFrom && { ts: { gte: dateFrom } }),
      ...(dateTo && { ts: { lte: dateTo } }),
    };

    const [ledgers, total] = await Promise.all([
      db.stockLedger.findMany({
        where,
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
        orderBy: { ts: "desc" },
        skip,
        take: pageSize,
      }),
      db.stockLedger.count({ where }),
    ]);

    return { ledgers, total };
  }

  /**
   * Get ledger entries by reference
   */
  static async findByReference(refTable: string, refId: string) {
    return db.stockLedger.findMany({
      where: {
        refTable,
        refId,
      },
      include: {
        material: true,
        location: true,
      },
      orderBy: { ts: "asc" },
    });
  }

  /**
   * Get ledger entries for a material
   */
  static async findByMaterial(materialId: string, limit = 100) {
    return db.stockLedger.findMany({
      where: { materialId },
      include: {
        location: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { ts: "desc" },
      take: limit,
    });
  }

  /**
   * Get ledger entries for a location
   */
  static async findByLocation(locationId: string, limit = 100) {
    return db.stockLedger.findMany({
      where: { locationId },
      include: {
        material: {
          include: {
            category: true,
            baseUom: true,
          },
        },
      },
      orderBy: { ts: "desc" },
      take: limit,
    });
  }
}

