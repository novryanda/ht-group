import { db } from "~/server/db";
import { type Prisma, type LocationType, type LedgerType } from "@prisma/client";
import {
  type CreateUomDTO,
  type UpdateUomDTO,
  type CreateCategoryDTO,
  type UpdateCategoryDTO,
  type CreateMaterialDTO,
  type UpdateMaterialDTO,
  type CreateWarehouseDTO,
  type UpdateWarehouseDTO,
  type CreateLocationDTO,
  type UpdateLocationDTO,
  type StockFilter,
  type LedgerFilter,
  type ListFilter,
} from "~/server/types/inventory";

// ============================================================================
// UOM REPOSITORY
// ============================================================================

export class UomRepository {
  static async create(data: CreateUomDTO) {
    return db.uom.create({ data });
  }

  static async findById(id: string) {
    return db.uom.findUnique({ where: { id } });
  }

  static async findByCode(code: string) {
    return db.uom.findUnique({ where: { code } });
  }

  static async findMany(filter: ListFilter & { page: number; pageSize: number }) {
    const { search, sortBy = "createdAt", sortDir = "desc", page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UomWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [uoms, total] = await Promise.all([
      db.uom.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: pageSize,
      }),
      db.uom.count({ where }),
    ]);

    return { uoms, total };
  }

  static async update(id: string, data: UpdateUomDTO) {
    return db.uom.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return db.uom.delete({ where: { id } });
  }
}

// ============================================================================
// MATERIAL CATEGORY REPOSITORY
// ============================================================================

export class MaterialCategoryRepository {
  static async create(data: CreateCategoryDTO) {
    return db.materialCategory.create({ data });
  }

  static async findById(id: string) {
    return db.materialCategory.findUnique({ where: { id } });
  }

  static async findByCode(code: string) {
    return db.materialCategory.findUnique({ where: { code } });
  }

  static async findMany(filter: ListFilter & { page: number; pageSize: number }) {
    const { search, sortBy = "createdAt", sortDir = "desc", page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MaterialCategoryWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [categories, total] = await Promise.all([
      db.materialCategory.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: pageSize,
      }),
      db.materialCategory.count({ where }),
    ]);

    return { categories, total };
  }

  static async update(id: string, data: UpdateCategoryDTO) {
    return db.materialCategory.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return db.materialCategory.delete({ where: { id } });
  }
}

// ============================================================================
// MATERIAL REPOSITORY
// ============================================================================

export class MaterialRepository {
  static async create(data: CreateMaterialDTO) {
    return db.material.create({
      data,
      include: {
        category: true,
        baseUom: true,
      },
    });
  }

  static async findById(id: string) {
    return db.material.findUnique({
      where: { id },
      include: {
        category: true,
        baseUom: true,
      },
    });
  }

  static async findByCode(code: string) {
    return db.material.findUnique({
      where: { code },
      include: {
        category: true,
        baseUom: true,
      },
    });
  }

  static async findMany(filter: ListFilter & { page: number; pageSize: number; categoryId?: string; isActive?: boolean }) {
    const { search, sortBy = "createdAt", sortDir = "desc", page, pageSize, categoryId, isActive } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MaterialWhereInput = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    };

    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        include: {
          category: true,
          baseUom: true,
        },
        orderBy: { [sortBy]: sortDir },
        skip,
        take: pageSize,
      }),
      db.material.count({ where }),
    ]);

    return { materials, total };
  }

  static async update(id: string, data: UpdateMaterialDTO) {
    return db.material.update({
      where: { id },
      data,
      include: {
        category: true,
        baseUom: true,
      },
    });
  }

  static async delete(id: string) {
    return db.material.delete({ where: { id } });
  }
}

// ============================================================================
// WAREHOUSE REPOSITORY
// ============================================================================

export class WarehouseRepository {
  static async create(data: CreateWarehouseDTO) {
    return db.warehouse.create({ data });
  }

  static async findById(id: string) {
    return db.warehouse.findUnique({ where: { id } });
  }

  static async findByCode(code: string) {
    return db.warehouse.findUnique({ where: { code } });
  }

  static async findMany(filter: ListFilter & { page: number; pageSize: number }) {
    const { search, sortBy = "createdAt", sortDir = "desc", page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.WarehouseWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [warehouses, total] = await Promise.all([
      db.warehouse.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: pageSize,
      }),
      db.warehouse.count({ where }),
    ]);

    return { warehouses, total };
  }

  static async update(id: string, data: UpdateWarehouseDTO) {
    return db.warehouse.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return db.warehouse.delete({ where: { id } });
  }
}

// ============================================================================
// LOCATION REPOSITORY
// ============================================================================

export class LocationRepository {
  static async create(data: CreateLocationDTO) {
    return db.location.create({
      data,
      include: {
        warehouse: true,
        parent: true,
      },
    });
  }

  static async findById(id: string) {
    return db.location.findUnique({
      where: { id },
      include: {
        warehouse: true,
        parent: true,
        children: true,
      },
    });
  }

  static async findByWarehouseAndCode(warehouseId: string, code: string) {
    return db.location.findUnique({
      where: {
        warehouseId_code: { warehouseId, code },
      },
      include: {
        warehouse: true,
        parent: true,
      },
    });
  }

  static async findMany(filter: { warehouseId?: string; type?: LocationType; isActive?: boolean; page: number; pageSize: number }) {
    const { warehouseId, type, isActive, page, pageSize } = filter;
    const skip = (page - 1) * pageSize;

    const where: Prisma.LocationWhereInput = {
      ...(warehouseId && { warehouseId }),
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
    };

    const [locations, total] = await Promise.all([
      db.location.findMany({
        where,
        include: {
          warehouse: true,
          parent: true,
        },
        orderBy: { code: "asc" },
        skip,
        take: pageSize,
      }),
      db.location.count({ where }),
    ]);

    return { locations, total };
  }

  static async update(id: string, data: UpdateLocationDTO) {
    return db.location.update({
      where: { id },
      data,
      include: {
        warehouse: true,
        parent: true,
      },
    });
  }

  static async delete(id: string) {
    return db.location.delete({ where: { id } });
  }
}

