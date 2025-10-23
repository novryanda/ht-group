import { unitRepo } from "~/server/repositories/pt-pks/unit.repo";
import { mapUnitToDTO } from "~/server/mappers/pt-pks/material-inventory.mapper";
import type { CreateUnitDTO, UpdateUnitDTO, UnitDTO, ListResponse, PaginationMeta } from "~/server/types/pt-pks/material-inventory";

export class UnitService {
  /**
   * Create a new unit
   */
  static async create(data: CreateUnitDTO): Promise<UnitDTO> {
    // Check if code already exists
    const exists = await unitRepo.existsByCode(data.code);
    if (exists) {
      throw new Error("Kode satuan sudah digunakan");
    }

    // Validate: if isBase true, conversion must be 1
    if (data.isBase && data.conversionToBase !== 1) {
      throw new Error("Satuan dasar harus memiliki konversi = 1");
    }

    const unit = await unitRepo.create({
      code: data.code,
      name: data.name,
      isBase: data.isBase ?? false,
      conversionToBase: data.conversionToBase ?? 1,
      description: data.description,
      isActive: data.isActive ?? true,
    });

    return mapUnitToDTO(unit);
  }

  /**
   * Update an existing unit
   */
  static async update(id: string, data: UpdateUnitDTO): Promise<UnitDTO> {
    // Check if unit exists
    const existing = await unitRepo.findById(id);
    if (!existing) {
      throw new Error("Satuan tidak ditemukan");
    }

    // Check if code is being changed and already exists
    if (data.code && data.code !== existing.code) {
      const codeExists = await unitRepo.existsByCode(data.code, id);
      if (codeExists) {
        throw new Error("Kode satuan sudah digunakan");
      }
    }

    // Validate: if isBase true, conversion must be 1
    if (data.isBase && data.conversionToBase !== undefined && data.conversionToBase !== 1) {
      throw new Error("Satuan dasar harus memiliki konversi = 1");
    }

    const updated = await unitRepo.update(id, data);
    return mapUnitToDTO(updated);
  }

  /**
   * Delete a unit
   */
  static async delete(id: string): Promise<void> {
    const existing = await unitRepo.findById(id);
    if (!existing) {
      throw new Error("Satuan tidak ditemukan");
    }

    // TODO: Check if unit is being used by items
    // If yes, prevent deletion or implement soft delete

    await unitRepo.delete(id);
  }

  /**
   * Get unit by ID
   */
  static async getById(id: string): Promise<UnitDTO | null> {
    const unit = await unitRepo.findById(id);
    if (!unit) return null;
    return mapUnitToDTO(unit);
  }

  /**
   * Get unit by code
   */
  static async getByCode(code: string): Promise<UnitDTO | null> {
    const unit = await unitRepo.findByCode(code);
    if (!unit) return null;
    return mapUnitToDTO(unit);
  }

  /**
   * Get units with pagination and filters
   */
  static async getList(params: {
    search?: string;
    isActive?: "true" | "false" | "all";
    page: number;
    limit: number;
  }): Promise<ListResponse<UnitDTO>> {
    const isActiveFilter =
      params.isActive === "true" ? true :
      params.isActive === "false" ? false : "all";

    const { data, total } = await unitRepo.findPaged({
      search: params.search,
      isActive: isActiveFilter,
      page: params.page,
      limit: params.limit,
    });

    const meta: PaginationMeta = {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    };

    return {
      data: data.map(mapUnitToDTO),
      meta,
    };
  }

  /**
   * Get all active units for dropdown/select
   */
  static async getAllActive(): Promise<UnitDTO[]> {
    const units = await unitRepo.findAllActive();
    return units.map(mapUnitToDTO);
  }

  /**
   * Convert quantity from one unit to base unit
   */
  static async convertToBase(qty: number, unitId: string): Promise<number> {
    const unit = await unitRepo.findById(unitId);
    if (!unit) {
      throw new Error("Satuan tidak ditemukan");
    }
    return qty * Number(unit.conversionToBase);
  }
}
