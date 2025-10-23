import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const warehouseRepo = {
  /**
   * Create a new warehouse
   */
  async create(data: Prisma.WarehouseCreateInput) {
    return db.warehouse.create({ data });
  },

  /**
   * Update an existing warehouse
   */
  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    return db.warehouse.update({ where: { id }, data });
  },

  /**
   * Delete a warehouse
   */
  async delete(id: string) {
    return db.warehouse.delete({ where: { id } });
  },

  /**
   * Find warehouse by ID
   */
  async findById(id: string) {
    return db.warehouse.findUnique({ where: { id } });
  },

  /**
   * Find warehouse by code
   */
  async findByCode(code: string) {
    return db.warehouse.findUnique({ where: { code } });
  },

  /**
   * Find warehouses with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
  }) {
    const { search, isActive, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = {
      ...(isActive !== "all" && isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      db.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      db.warehouse.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active warehouses for dropdown/select
   */
  async findAllActive() {
    return db.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists
   */
  async existsByCode(code: string, excludeId?: string) {
    const count = await db.warehouse.count({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  },
};

export const binRepo = {
  /**
   * Create a new bin
   */
  async create(data: Prisma.BinCreateInput) {
    return db.bin.create({ data });
  },

  /**
   * Update an existing bin
   */
  async update(id: string, data: Prisma.BinUpdateInput) {
    return db.bin.update({ where: { id }, data });
  },

  /**
   * Delete a bin
   */
  async delete(id: string) {
    return db.bin.delete({ where: { id } });
  },

  /**
   * Find bin by ID with warehouse
   */
  async findById(id: string) {
    return db.bin.findUnique({
      where: { id },
      include: { warehouse: true },
    });
  },

  /**
   * Find bins with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    warehouseId?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
  }) {
    const { search, warehouseId, isActive, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BinWhereInput = {
      ...(isActive !== "all" && isActive !== undefined ? { isActive } : {}),
      ...(warehouseId ? { warehouseId } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      db.bin.findMany({
        where,
        skip,
        take: limit,
        include: { warehouse: true },
        orderBy: { name: "asc" },
      }),
      db.bin.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active bins for dropdown/select
   */
  async findAllActive(warehouseId?: string) {
    return db.bin.findMany({
      where: {
        isActive: true,
        ...(warehouseId ? { warehouseId } : {}),
      },
      include: { warehouse: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists for a warehouse
   */
  async existsByCodeAndWarehouse(
    code: string,
    warehouseId: string,
    excludeId?: string
  ) {
    const count = await db.bin.count({
      where: {
        code,
        warehouseId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  },
};
