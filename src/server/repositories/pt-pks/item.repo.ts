import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export class ItemRepo {
  /**
   * Create a new item
   */
  async create(data: Prisma.ItemCreateInput) {
    return db.item.create({ data });
  }

  /**
   * Update an existing item
   */
  async update(id: string, data: Prisma.ItemUpdateInput) {
    return db.item.update({ where: { id }, data });
  }

  /**
   * Delete an item
   */
  async delete(id: string) {
    return db.item.delete({ where: { id } });
  }

  /**
   * Find item by ID with all relations
   */
  async findById(id: string) {
    return db.item.findUnique({
      where: { id },
      include: {
        category: true,
        itemType: true,
        baseUnit: true,
        defaultIssueUnit: true,
      },
    });
  }

  /**
   * Find item by SKU
   */
  async findBySKU(sku: string) {
    return db.item.findUnique({
      where: { sku },
      include: {
        category: true,
        itemType: true,
        baseUnit: true,
        defaultIssueUnit: true,
      },
    });
  }

  /**
   * Find items with pagination and filters
   */
  async findManyWithPagination(params: {
    search?: string;
    categoryId?: string;
    itemTypeId?: string;
    unitId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, itemTypeId, unitId, isActive } = params;
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(itemTypeId ? { itemTypeId } : {}),
      ...(unitId ? { unitId } : {}),
      ...(search
        ? {
            OR: [
              { sku: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      db.item.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          itemType: true,
          baseUnit: true,
          defaultIssueUnit: true,
        },
        orderBy: { name: "asc" },
      }),
      db.item.count({ where }),
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
   * Get all active items for dropdown/select
   */
  async findAllActive(filters?: { categoryId?: string; itemTypeId?: string }) {
    return db.item.findMany({
      where: {
        isActive: true,
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters?.itemTypeId ? { itemTypeId: filters.itemTypeId } : {}),
      },
      include: {
        category: true,
        itemType: true,
        baseUnit: true,
        defaultIssueUnit: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Count items by filters (for SKU generation)
   */
  async countByFilters(filters: { categoryId?: string; itemTypeId?: string }) {
    return db.item.count({
      where: {
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.itemTypeId ? { itemTypeId: filters.itemTypeId } : {}),
      },
    });
  }
}
