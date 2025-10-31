import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const divisiRepo = {
  /**
   * Create a new divisi
   */
  async create(data: Prisma.DivisiCreateInput, companyId: string) {
    return db.divisi.create({ 
      data: {
        ...data,
        companyId,
      } as any
    });
  },

  /**
   * Update an existing divisi
   */
  async update(id: string, data: Prisma.DivisiUpdateInput) {
    return db.divisi.update({ where: { id }, data });
  },

  /**
   * Delete a divisi
   */
  async delete(id: string) {
    return db.divisi.delete({ where: { id } });
  },

  /**
   * Find divisi by ID
   */
  async findById(id: string, includeJabatan: boolean = true) {
    return db.divisi.findUnique({
      where: { id },
      include: includeJabatan
        ? {
            jabatan: {
              orderBy: { name: "asc" },
            },
          }
        : undefined,
    });
  },

  /**
   * Find divisi by code
   */
  async findByCode(code: string, companyId: string) {
    return db.divisi.findFirst({
      where: {
        code: { equals: code },
        companyId: { equals: companyId },
      } as Prisma.DivisiWhereInput,
    });
  },

  /**
   * Find divisi with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
    companyId: string;
  }) {
    const { search, isActive, page, limit, companyId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.DivisiWhereInput = {
      companyId: { equals: companyId },
      ...(isActive !== "all" && isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    } as Prisma.DivisiWhereInput;

    const [data, total] = await Promise.all([
      db.divisi.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              jabatan: true,
              employees: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      db.divisi.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active divisi for dropdown/select
   */
  async findAllActive(companyId: string) {
    return db.divisi.findMany({
      where: { 
        isActive: true, 
        companyId: { equals: companyId },
      } as Prisma.DivisiWhereInput,
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists
   */
  async existsByCode(code: string, companyId: string, excludeId?: string) {
    const count = await db.divisi.count({
      where: {
        code: { equals: code },
        companyId: { equals: companyId },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      } as Prisma.DivisiWhereInput,
    });
    return count > 0;
  },
};

