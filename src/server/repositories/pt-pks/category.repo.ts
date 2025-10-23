import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const categoryRepo = {
  /**
   * Create a new category
   */
  async create(data: Prisma.CategoryCreateInput) {
    return db.category.create({ data });
  },

  /**
   * Update an existing category
   */
  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return db.category.update({ where: { id }, data });
  },

  /**
   * Delete a category
   */
  async delete(id: string) {
    return db.category.delete({ where: { id } });
  },

  /**
   * Find category by ID
   */
  async findById(id: string) {
    return db.category.findUnique({ where: { id } });
  },

  /**
   * Find category by code
   */
  async findByCode(code: string) {
    return db.category.findUnique({ where: { code } });
  },

  /**
   * Find categories with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
  }) {
    const { search, isActive, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
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
      db.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      db.category.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active categories for dropdown/select
   */
  async findAllActive() {
    return db.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists
   */
  async existsByCode(code: string, excludeId?: string) {
    const count = await db.category.count({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  },
};
