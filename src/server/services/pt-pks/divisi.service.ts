import { divisiRepo } from "~/server/repositories/pt-pks/divisi.repo";
import { mapDivisiToDTO } from "~/server/mappers/pt-pks/divisi.mapper";
import { db } from "~/server/db";
import type {
  CreateDivisiDTO,
  UpdateDivisiDTO,
  DivisiDTO,
  ListResponse,
  PaginationMeta,
} from "~/server/types/pt-pks/divisi";

export class DivisiService {
  /**
   * Create a new divisi
   */
  static async create(data: CreateDivisiDTO, companyId: string): Promise<DivisiDTO> {
    // Check if code already exists
    const exists = await divisiRepo.existsByCode(data.code, companyId);
    if (exists) {
      throw new Error("Kode divisi sudah digunakan");
    }

    const divisi = await divisiRepo.create({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    } as any, companyId);

    return mapDivisiToDTO(divisi);
  }

  /**
   * Update an existing divisi
   */
  static async update(id: string, data: UpdateDivisiDTO, companyId: string): Promise<DivisiDTO> {
    // Check if divisi exists
    const existing = await divisiRepo.findById(id);
    if (!existing) {
      throw new Error("Divisi tidak ditemukan");
    }

    // Verify divisi belongs to the company
    if ((existing as any).companyId !== companyId) {
      throw new Error("Divisi tidak ditemukan atau tidak memiliki akses");
    }

    // Check if code is being changed and already exists
    if (data.code && data.code !== existing.code) {
      const codeExists = await divisiRepo.existsByCode(data.code, companyId, id);
      if (codeExists) {
        throw new Error("Kode divisi sudah digunakan");
      }
    }

    const updated = await divisiRepo.update(id, data);
    return mapDivisiToDTO(updated);
  }

  /**
   * Delete a divisi
   */
  static async delete(id: string, companyId: string): Promise<void> {
    const existing = await divisiRepo.findById(id, true);
    if (!existing) {
      throw new Error("Divisi tidak ditemukan");
    }

    // Verify divisi belongs to the company
    if ((existing as any).companyId !== companyId) {
      throw new Error("Divisi tidak ditemukan atau tidak memiliki akses");
    }

    // Check if divisi is being used by employees or jabatan
    // Check if divisi is being used by jabatan (relation is 'jabatan')
    const jabatanCount = await db.jabatan.count({ where: { divisiId: existing.id } });
    if (jabatanCount > 0) {
      throw new Error("Divisi tidak dapat dihapus karena masih memiliki jabatan");
    }

    await divisiRepo.delete(id);
  }

  /**
   * Get divisi by ID
   */
  static async getById(id: string, companyId: string): Promise<DivisiDTO | null> {
    const divisi = await divisiRepo.findById(id, true);
    if (!divisi || (divisi as any).companyId !== companyId) return null;
    return mapDivisiToDTO(divisi as any);
  }

  /**
   * Get divisi by code
   */
  static async getByCode(code: string, companyId: string): Promise<DivisiDTO | null> {
    const divisi = await divisiRepo.findByCode(code, companyId);
    if (!divisi) return null;
    return mapDivisiToDTO(divisi);
  }

  /**
   * Get divisi with pagination and filters
   */
  static async getList(params: {
    search?: string;
    isActive?: "true" | "false" | "all";
    page: number;
    limit: number;
    companyId: string;
  }): Promise<ListResponse<DivisiDTO>> {
    const isActiveFilter =
      params.isActive === "true" ? true :
      params.isActive === "false" ? false : "all";

    const { data, total } = await divisiRepo.findPaged({
      search: params.search,
      isActive: isActiveFilter,
      page: params.page,
      limit: params.limit,
      companyId: params.companyId,
    });

    const meta: PaginationMeta = {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    };

    return {
      data: data.map(mapDivisiToDTO),
      meta,
    };
  }

  /**
   * Get all active divisi for dropdown/select
   */
  static async getAllActive(companyId: string): Promise<DivisiDTO[]> {
    const divisiList = await divisiRepo.findAllActive(companyId);
    return divisiList.map(mapDivisiToDTO);
  }
}

