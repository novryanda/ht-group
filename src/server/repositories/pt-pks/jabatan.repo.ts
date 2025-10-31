import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const jabatanRepo = {
  /**
   * Create a new jabatan
   */
  async create(data: Prisma.JabatanCreateInput, companyId: string) {
    // Extract divisiId from nested relation if exists
    const divisiId = (data.divisi as any)?.connect?.id || (data as any).divisiId;
    
    return db.jabatan.create({ 
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
        divisiId: divisiId!,
        companyId,
      } as any
    });
  },

  /**
   * Update an existing jabatan
   */
  async update(id: string, data: Prisma.JabatanUpdateInput) {
    return db.jabatan.update({ where: { id }, data });
  },

  /**
   * Delete a jabatan
   */
  async delete(id: string) {
    return db.jabatan.delete({ where: { id } });
  },

  /**
   * Find jabatan by ID with divisi
   */
  async findById(id: string, includeCount: boolean = false) {
    return db.jabatan.findUnique({
      where: { id },
      include: {
        divisi: true,
        ...(includeCount
          ? {
              _count: {
                select: {
                  employees: true,
                },
              },
            }
          : {}),
      },
    });
  },

  /**
   * Find jabatan with pagination and filters
   */
  async findPaged(params: {
    search?: string;
    divisiId?: string;
    isActive?: boolean | "all";
    page: number;
    limit: number;
    companyId: string;
  }) {
    const { search, divisiId, isActive, page, limit, companyId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.JabatanWhereInput = {
      companyId: { equals: companyId },
      ...(isActive !== "all" && isActive !== undefined ? { isActive } : {}),
      ...(divisiId ? { divisiId } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    } as Prisma.JabatanWhereInput;

    const [data, total] = await Promise.all([
      db.jabatan.findMany({
        where,
        skip,
        take: limit,
        include: {
          divisi: true,
          _count: {
            select: {
              employees: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      db.jabatan.count({ where }),
    ]);

    return { data, total };
  },

  /**
   * Get all active jabatan for dropdown/select
   */
  async findAllActive(companyId: string, divisiId?: string) {
    return db.jabatan.findMany({
      where: {
        isActive: true,
        companyId: { equals: companyId },
        ...(divisiId ? { divisiId } : {}),
      } as Prisma.JabatanWhereInput,
      include: { divisi: true },
      orderBy: { name: "asc" },
    });
  },

  /**
   * Check if code already exists for a divisi
   */
  async existsByCodeAndDivisi(
    code: string,
    divisiId: string,
    companyId: string,
    excludeId?: string
  ) {
    const count = await db.jabatan.count({
      where: {
        code: { equals: code },
        divisiId: { equals: divisiId },
        companyId: { equals: companyId },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      } as Prisma.JabatanWhereInput,
    });
    return count > 0;
  },
};

