import { warehouseRepo } from "~/server/repositories/pt-pks/warehouse.repo";
import { binRepo } from "~/server/repositories/pt-pks/bin.repo";
import {
  mapWarehouseToDTO,
  mapBinToDTO,
} from "~/server/mappers/pt-pks/material-inventory.mapper";
import type {
  WarehouseDTO,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  BinDTO,
  CreateBinDTO,
  UpdateBinDTO,
  ListResponse,
} from "~/server/types/pt-pks/material-inventory";

export class WarehouseService {
  // Using object-based repos (not class instances)
  private warehouseRepo = warehouseRepo;
  private binRepo = binRepo;

  // ==================== WAREHOUSE METHODS ====================

  async getAllWarehouses(params: {
    search?: string;
    isActive?: boolean | "all";
    page?: number;
    limit?: number;
  }): Promise<ListResponse<WarehouseDTO>> {
    const result = await this.warehouseRepo.findPaged({
      search: params.search,
      isActive: params.isActive,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    });

    return {
      data: result.data.map(mapWarehouseToDTO),
      meta: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total: result.total,
        totalPages: Math.ceil(result.total / (params.limit ?? 10)),
      },
    };
  }

  async getWarehouseById(id: string): Promise<WarehouseDTO | null> {
    const warehouse = await this.warehouseRepo.findById(id);
    return warehouse ? mapWarehouseToDTO(warehouse) : null;
  }

  async getWarehouseWithBins(id: string): Promise<WarehouseDTO | null> {
    const warehouse = await this.warehouseRepo.findById(id);
    if (!warehouse) return null;
    // For now, just return warehouse without bins populated
    // You can extend this to include bins if needed
    return mapWarehouseToDTO(warehouse);
  }

  async createWarehouse(data: CreateWarehouseDTO): Promise<WarehouseDTO> {
    // Check for duplicate code
    const existing = await this.warehouseRepo.existsByCode(data.code);
    if (existing) {
      throw new Error(`Warehouse dengan kode "${data.code}" sudah ada`);
    }

    const warehouse = await this.warehouseRepo.create(data);
    return mapWarehouseToDTO(warehouse);
  }

  async updateWarehouse(
    id: string,
    data: UpdateWarehouseDTO
  ): Promise<WarehouseDTO> {
    // Check if warehouse exists
    const existing = await this.warehouseRepo.findById(id);
    if (!existing) {
      throw new Error("Warehouse tidak ditemukan");
    }

    // If code is being updated, check for duplicates
    if (data.code && data.code !== existing.code) {
      const duplicate = await this.warehouseRepo.existsByCode(data.code);
      if (duplicate) {
        throw new Error(`Warehouse dengan kode "${data.code}" sudah ada`);
      }
    }

    const warehouse = await this.warehouseRepo.update(id, data);
    return mapWarehouseToDTO(warehouse);
  }

  async deleteWarehouse(id: string): Promise<void> {
    const existing = await this.warehouseRepo.findById(id);
    if (!existing) {
      throw new Error("Warehouse tidak ditemukan");
    }

    // Check if warehouse has bins
    const binsCount = await this.binRepo.countByWarehouseId(id);
    if (binsCount > 0) {
      throw new Error(
        `Warehouse tidak dapat dihapus karena masih memiliki ${binsCount} bin`
      );
    }

    await this.warehouseRepo.delete(id);
  }

  async getActiveWarehouses(): Promise<WarehouseDTO[]> {
    const warehouses = await this.warehouseRepo.findAllActive();
    return warehouses.map(mapWarehouseToDTO);
  }

  // ==================== BIN METHODS ====================

  async getBinsByWarehouseId(warehouseId: string): Promise<BinDTO[]> {
    const bins = await this.binRepo.findByWarehouseId(warehouseId);
    return bins.map(mapBinToDTO);
  }

  async getBinById(id: string): Promise<BinDTO | null> {
    const bin = await this.binRepo.findById(id);
    return bin ? mapBinToDTO(bin) : null;
  }

  async createBin(data: CreateBinDTO): Promise<BinDTO> {
    // Validate warehouse exists
    const warehouse = await this.warehouseRepo.findById(data.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse tidak ditemukan");
    }

    // Check for duplicate code within warehouse
    const existing = await this.binRepo.existsByCodeInWarehouse(
      data.warehouseId,
      data.code
    );
    if (existing) {
      throw new Error(
        `Bin dengan kode "${data.code}" sudah ada di warehouse ini`
      );
    }

    // Create bin with warehouse relation
    const bin = await this.binRepo.create({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      warehouse: {
        connect: { id: data.warehouseId },
      },
    });
    return mapBinToDTO(bin);
  }

  async updateBin(id: string, data: UpdateBinDTO): Promise<BinDTO> {
    // Check if bin exists
    const existing = await this.binRepo.findById(id);
    if (!existing) {
      throw new Error("Bin tidak ditemukan");
    }

    // If code is being updated, check for duplicates in the same warehouse
    if (data.code && data.code !== existing.code) {
      const duplicate = await this.binRepo.existsByCodeInWarehouse(
        existing.warehouseId,
        data.code
      );
      if (duplicate) {
        throw new Error(
          `Bin dengan kode "${data.code}" sudah ada di warehouse ini`
        );
      }
    }

    const bin = await this.binRepo.update(id, data);
    return mapBinToDTO(bin);
  }

  async deleteBin(id: string): Promise<void> {
    const existing = await this.binRepo.findById(id);
    if (!existing) {
      throw new Error("Bin tidak ditemukan");
    }

    // Note: In production, you'd want to check if bin has stock items
    // For now, we assume cascade delete or manual cleanup is handled

    await this.binRepo.delete(id);
  }

  async getActiveBinsByWarehouseId(warehouseId: string): Promise<BinDTO[]> {
    const bins = await this.binRepo.findActiveByWarehouseId(warehouseId);
    return bins.map(mapBinToDTO);
  }
}
