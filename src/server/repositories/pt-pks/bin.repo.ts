import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

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
   * Find bin by ID
   */
  async findById(id: string) {
    return db.bin.findUnique({ 
      where: { id },
      include: { warehouse: true },
    });
  },

  /**
   * Find bins by warehouse ID
   */
  async findByWarehouseId(warehouseId: string) {
    return db.bin.findMany({
      where: { warehouseId },
      include: { warehouse: true },
      orderBy: { code: "asc" },
    });
  },

  /**
   * Find active bins by warehouse ID
   */
  async findActiveByWarehouseId(warehouseId: string) {
    return db.bin.findMany({
      where: { 
        warehouseId,
        isActive: true,
      },
      include: { warehouse: true },
      orderBy: { code: "asc" },
    });
  },

  /**
   * Check if a bin code exists within a warehouse
   */
  async existsByCodeInWarehouse(warehouseId: string, code: string) {
    const bin = await db.bin.findFirst({
      where: { warehouseId, code },
    });
    return !!bin;
  },

  /**
   * Count bins by warehouse ID
   */
  async countByWarehouseId(warehouseId: string) {
    return db.bin.count({
      where: { warehouseId },
    });
  },

  /**
   * Find all active bins
   */
  async findAllActive() {
    return db.bin.findMany({
      where: { isActive: true },
      include: { warehouse: true },
      orderBy: [
        { warehouse: { code: "asc" } },
        { code: "asc" },
      ],
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

    const where: Prisma.BinWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Warehouse filter
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    // Active status filter
    if (isActive !== "all" && isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      db.bin.findMany({
        where,
        include: { warehouse: true },
        skip,
        take: limit,
        orderBy: [
          { warehouse: { code: "asc" } },
          { code: "asc" },
        ],
      }),
      db.bin.count({ where }),
    ]);

    return { data, total };
  },
};
