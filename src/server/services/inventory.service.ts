import { db } from "~/server/db";
import { Decimal } from "@prisma/client/runtime/library";
import {
  UomRepository,
  MaterialCategoryRepository,
  MaterialRepository,
  WarehouseRepository,
  LocationRepository,
} from "~/server/repositories/inventory.repo";
import { StockRepository, StockLedgerRepository } from "~/server/repositories/stock.repo";
import {
  GoodsReceiptRepository,
  GoodsIssueRepository,
  StockTransferRepository,
  StockAdjustmentRepository,
  StockCountRepository,
} from "~/server/repositories/docs.repo";
import { StockService } from "~/server/services/stock.service";
import {
  UomMapper,
  MaterialCategoryMapper,
  MaterialMapper,
  WarehouseMapper,
  LocationMapper,
  StockMapper,
  StockLedgerMapper,
  GoodsReceiptMapper,
  GoodsIssueMapper,
  StockTransferMapper,
  StockAdjustmentMapper,
  StockCountMapper,
} from "~/server/mappers/inventory.mapper";
import {
  generateGrnCode,
  generateIssueCode,
  generateTransferCode,
  generateAdjustmentCode,
  generateCountCode,
  getCurrentYearMonth,
} from "~/server/lib/codegen";
import type {
  CreateUomDTO,
  UpdateUomDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CreateMaterialDTO,
  UpdateMaterialDTO,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  CreateLocationDTO,
  UpdateLocationDTO,
  CreateGrnDTO,
  CreateIssueDTO,
  CreateTransferDTO,
  CreateAdjustmentDTO,
  CreateCountDTO,
  CreateOpeningBalanceDTO,
  ListFilter,
  StockFilter,
  LedgerFilter,
  PaginatedResult,
  UomDTO,
  MaterialCategoryDTO,
  MaterialDTO,
  WarehouseDTO,
  LocationDTO,
  StockDTO,
  StockLedgerDTO,
  GoodsReceiptDTO,
  GoodsIssueDTO,
  StockTransferDTO,
  StockAdjustmentDTO,
  StockCountDTO,
} from "~/server/types/inventory";

// ============================================================================
// UOM SERVICE
// ============================================================================

export class UomService {
  static async create(data: CreateUomDTO): Promise<UomDTO> {
    // Check if code already exists
    const existing = await UomRepository.findByCode(data.code);
    if (existing) {
      throw new Error("UOM_CODE_EXISTS: Kode UoM sudah digunakan");
    }

    const uom = await UomRepository.create(data);
    return UomMapper.toDTO(uom);
  }

  static async getById(id: string): Promise<UomDTO | null> {
    const uom = await UomRepository.findById(id);
    return uom ? UomMapper.toDTO(uom) : null;
  }

  static async getList(filter: ListFilter & { page: number; pageSize: number }): Promise<PaginatedResult<UomDTO>> {
    const { uoms, total } = await UomRepository.findMany(filter);
    return {
      data: UomMapper.toDTOList(uoms),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async update(id: string, data: UpdateUomDTO): Promise<UomDTO> {
    // Check if exists
    const existing = await UomRepository.findById(id);
    if (!existing) {
      throw new Error("UOM_NOT_FOUND: UoM tidak ditemukan");
    }

    // Check if new code already exists
    if (data.code && data.code !== existing.code) {
      const codeExists = await UomRepository.findByCode(data.code);
      if (codeExists) {
        throw new Error("UOM_CODE_EXISTS: Kode UoM sudah digunakan");
      }
    }

    const uom = await UomRepository.update(id, data);
    return UomMapper.toDTO(uom);
  }

  static async delete(id: string): Promise<void> {
    await UomRepository.delete(id);
  }
}

// ============================================================================
// MATERIAL CATEGORY SERVICE
// ============================================================================

export class MaterialCategoryService {
  static async create(data: CreateCategoryDTO): Promise<MaterialCategoryDTO> {
    const existing = await MaterialCategoryRepository.findByCode(data.code);
    if (existing) {
      throw new Error("CATEGORY_CODE_EXISTS: Kode kategori sudah digunakan");
    }

    const category = await MaterialCategoryRepository.create(data);
    return MaterialCategoryMapper.toDTO(category);
  }

  static async getById(id: string): Promise<MaterialCategoryDTO | null> {
    const category = await MaterialCategoryRepository.findById(id);
    return category ? MaterialCategoryMapper.toDTO(category) : null;
  }

  static async getList(filter: ListFilter & { page: number; pageSize: number }): Promise<PaginatedResult<MaterialCategoryDTO>> {
    const { categories, total } = await MaterialCategoryRepository.findMany(filter);
    return {
      data: MaterialCategoryMapper.toDTOList(categories),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async update(id: string, data: UpdateCategoryDTO): Promise<MaterialCategoryDTO> {
    const existing = await MaterialCategoryRepository.findById(id);
    if (!existing) {
      throw new Error("CATEGORY_NOT_FOUND: Kategori tidak ditemukan");
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await MaterialCategoryRepository.findByCode(data.code);
      if (codeExists) {
        throw new Error("CATEGORY_CODE_EXISTS: Kode kategori sudah digunakan");
      }
    }

    const category = await MaterialCategoryRepository.update(id, data);
    return MaterialCategoryMapper.toDTO(category);
  }

  static async delete(id: string): Promise<void> {
    await MaterialCategoryRepository.delete(id);
  }
}

// ============================================================================
// MATERIAL SERVICE
// ============================================================================

export class MaterialService {
  static async create(data: CreateMaterialDTO): Promise<MaterialDTO> {
    const existing = await MaterialRepository.findByCode(data.code);
    if (existing) {
      throw new Error("MATERIAL_CODE_EXISTS: Kode material sudah digunakan");
    }

    // Validate category exists
    const category = await MaterialCategoryRepository.findById(data.categoryId);
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND: Kategori tidak ditemukan");
    }

    // Validate UoM exists
    const uom = await UomRepository.findById(data.baseUomId);
    if (!uom) {
      throw new Error("UOM_NOT_FOUND: UoM tidak ditemukan");
    }

    const material = await MaterialRepository.create(data);
    return MaterialMapper.toDTO(material);
  }

  static async getById(id: string): Promise<MaterialDTO | null> {
    const material = await MaterialRepository.findById(id);
    return material ? MaterialMapper.toDTO(material) : null;
  }

  static async getList(
    filter: ListFilter & { page: number; pageSize: number; categoryId?: string; isActive?: boolean }
  ): Promise<PaginatedResult<MaterialDTO>> {
    const { materials, total } = await MaterialRepository.findMany(filter);
    return {
      data: MaterialMapper.toDTOList(materials),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async update(id: string, data: UpdateMaterialDTO): Promise<MaterialDTO> {
    const existing = await MaterialRepository.findById(id);
    if (!existing) {
      throw new Error("MATERIAL_NOT_FOUND: Material tidak ditemukan");
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await MaterialRepository.findByCode(data.code);
      if (codeExists) {
        throw new Error("MATERIAL_CODE_EXISTS: Kode material sudah digunakan");
      }
    }

    if (data.categoryId) {
      const category = await MaterialCategoryRepository.findById(data.categoryId);
      if (!category) {
        throw new Error("CATEGORY_NOT_FOUND: Kategori tidak ditemukan");
      }
    }

    if (data.baseUomId) {
      const uom = await UomRepository.findById(data.baseUomId);
      if (!uom) {
        throw new Error("UOM_NOT_FOUND: UoM tidak ditemukan");
      }
    }

    const material = await MaterialRepository.update(id, data);
    return MaterialMapper.toDTO(material);
  }

  static async delete(id: string): Promise<void> {
    await MaterialRepository.delete(id);
  }
}

// ============================================================================
// WAREHOUSE SERVICE
// ============================================================================

export class WarehouseService {
  static async create(data: CreateWarehouseDTO): Promise<WarehouseDTO> {
    const existing = await WarehouseRepository.findByCode(data.code);
    if (existing) {
      throw new Error("WAREHOUSE_CODE_EXISTS: Kode gudang sudah digunakan");
    }

    const warehouse = await WarehouseRepository.create(data);
    return WarehouseMapper.toDTO(warehouse);
  }

  static async getById(id: string): Promise<WarehouseDTO | null> {
    const warehouse = await WarehouseRepository.findById(id);
    return warehouse ? WarehouseMapper.toDTO(warehouse) : null;
  }

  static async getList(filter: ListFilter & { page: number; pageSize: number }): Promise<PaginatedResult<WarehouseDTO>> {
    const { warehouses, total } = await WarehouseRepository.findMany(filter);
    return {
      data: WarehouseMapper.toDTOList(warehouses),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async update(id: string, data: UpdateWarehouseDTO): Promise<WarehouseDTO> {
    const existing = await WarehouseRepository.findById(id);
    if (!existing) {
      throw new Error("WAREHOUSE_NOT_FOUND: Gudang tidak ditemukan");
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await WarehouseRepository.findByCode(data.code);
      if (codeExists) {
        throw new Error("WAREHOUSE_CODE_EXISTS: Kode gudang sudah digunakan");
      }
    }

    const warehouse = await WarehouseRepository.update(id, data);
    return WarehouseMapper.toDTO(warehouse);
  }

  static async delete(id: string): Promise<void> {
    await WarehouseRepository.delete(id);
  }
}

// ============================================================================
// LOCATION SERVICE
// ============================================================================

export class LocationService {
  static async create(data: CreateLocationDTO): Promise<LocationDTO> {
    // Validate warehouse exists
    const warehouse = await WarehouseRepository.findById(data.warehouseId);
    if (!warehouse) {
      throw new Error("WAREHOUSE_NOT_FOUND: Gudang tidak ditemukan");
    }

    // Check if code already exists in this warehouse
    const existing = await LocationRepository.findByWarehouseAndCode(data.warehouseId, data.code);
    if (existing) {
      throw new Error("LOCATION_CODE_EXISTS: Kode lokasi sudah digunakan di gudang ini");
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await LocationRepository.findById(data.parentId);
      if (!parent) {
        throw new Error("PARENT_LOCATION_NOT_FOUND: Lokasi parent tidak ditemukan");
      }
      if (parent.warehouseId !== data.warehouseId) {
        throw new Error("PARENT_LOCATION_MISMATCH: Lokasi parent harus di gudang yang sama");
      }
    }

    const location = await LocationRepository.create(data);
    return LocationMapper.toDTO(location);
  }

  static async getById(id: string): Promise<LocationDTO | null> {
    const location = await LocationRepository.findById(id);
    return location ? LocationMapper.toDTO(location) : null;
  }

  static async getList(filter: {
    warehouseId?: string;
    type?: any;
    isActive?: boolean;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<LocationDTO>> {
    const { locations, total } = await LocationRepository.findMany(filter);
    return {
      data: LocationMapper.toDTOList(locations),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async update(id: string, data: UpdateLocationDTO): Promise<LocationDTO> {
    const existing = await LocationRepository.findById(id);
    if (!existing) {
      throw new Error("LOCATION_NOT_FOUND: Lokasi tidak ditemukan");
    }

    if (data.code) {
      const codeExists = await LocationRepository.findByWarehouseAndCode(existing.warehouseId, data.code);
      if (codeExists && codeExists.id !== id) {
        throw new Error("LOCATION_CODE_EXISTS: Kode lokasi sudah digunakan di gudang ini");
      }
    }

    if (data.parentId) {
      const parent = await LocationRepository.findById(data.parentId);
      if (!parent) {
        throw new Error("PARENT_LOCATION_NOT_FOUND: Lokasi parent tidak ditemukan");
      }
      if (parent.warehouseId !== existing.warehouseId) {
        throw new Error("PARENT_LOCATION_MISMATCH: Lokasi parent harus di gudang yang sama");
      }
    }

    const location = await LocationRepository.update(id, data);
    return LocationMapper.toDTO(location);
  }

  static async delete(id: string): Promise<void> {
    await LocationRepository.delete(id);
  }
}

// ============================================================================
// STOCK QUERY SERVICE
// ============================================================================

export class StockQueryService {
  static async getStockList(filter: StockFilter & { page: number; pageSize: number }): Promise<PaginatedResult<StockDTO>> {
    const { stocks, total } = await StockRepository.findMany(filter);
    return {
      data: StockMapper.toDTOList(stocks),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async getLedgerList(filter: LedgerFilter & { page: number; pageSize: number }): Promise<PaginatedResult<StockLedgerDTO>> {
    const { ledgers, total } = await StockLedgerRepository.findMany(filter);
    return {
      data: StockLedgerMapper.toDTOList(ledgers),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async getLowStockItems(): Promise<StockDTO[]> {
    const stocks = await StockRepository.findLowStock();
    return StockMapper.toDTOList(stocks);
  }
}

// ============================================================================
// OPENING BALANCE SERVICE
// ============================================================================

export class OpeningBalanceService {
  static async post(data: CreateOpeningBalanceDTO): Promise<{ success: boolean; count: number }> {
    const results = await StockService.postOpeningBalance(data.lines);
    return { success: true, count: results.length };
  }
}

