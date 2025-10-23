import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const itemTypeRepo = {
  /**
   * Create a new item type
   */
  async create(data: Prisma.ItemTypeCreateInput) {
    return db.itemType.create({ data });
  },

  /**
   * Update an existing item type
   */
  async update(id: string, data: Prisma.ItemTypeUpdateInput) {
    return db.itemType.update({ where: { id }, data });
  },

  /**
   * Delete an item type
   */
  async delete(id: string) {
    return db.itemType.delete({ where: { id } });
  },

  /**
   * Find item type by ID with category
   */
  async findById(id: string) {
    return db.itemType.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  /**
   * Find item types with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    categoryId?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
  }) {
    const { search, categoryId, isActive, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemTypeWhereInput = {
      ...(isActive !== "all" && isActive !== undefined ? { isActive } : {}),
      ...(categoryId ? { categoryId } : {}),
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
      db.itemType.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      db.itemType.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active item types for dropdown/select
   */
  async findAllActive(categoryId?: string) {
    return db.itemType.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists for a category
   */
  async existsByCodeAndCategory(
    code: string,
    categoryId: string,
    excludeId?: string
  ) {
    const count = await db.itemType.count({
      where: {
        code,
        categoryId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  },
};
