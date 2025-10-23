import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const unitRepo = {
  /**
   * Create a new unit
   */
  async create(data: Prisma.UnitCreateInput) {
    return db.unit.create({ data });
  },

  /**
   * Update an existing unit
   */
  async update(id: string, data: Prisma.UnitUpdateInput) {
    return db.unit.update({ where: { id }, data });
  },

  /**
   * Delete a unit
   */
  async delete(id: string) {
    return db.unit.delete({ where: { id } });
  },

  /**
   * Find unit by ID
   */
  async findById(id: string) {
    return db.unit.findUnique({ where: { id } });
  },

  /**
   * Find unit by code
   */
  async findByCode(code: string) {
    return db.unit.findUnique({ where: { code } });
  },

  /**
   * Find units with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
  }) {
    const { search, isActive, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UnitWhereInput = {
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
      db.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      db.unit.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active units for dropdown/select
   */
  async findAllActive() {
    return db.unit.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists
   */
  async existsByCode(code: string, excludeId?: string) {
    const count = await db.unit.count({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  },
};
