import { jabatanRepo } from "~/server/repositories/pt-pks/jabatan.repo";
import { divisiRepo } from "~/server/repositories/pt-pks/divisi.repo";
import { mapJabatanToDTO } from "~/server/mappers/pt-pks/divisi.mapper";
import type {
  CreateJabatanDTO,
  UpdateJabatanDTO,
  JabatanDTO,
  ListResponse,
  PaginationMeta,
} from "~/server/types/pt-pks/divisi";

export class JabatanService {
  /**
   * Create a new jabatan
   */
  static async create(data: CreateJabatanDTO, companyId: string): Promise<JabatanDTO> {
    // Validate divisi exists and belongs to company
    const divisi = await divisiRepo.findById(data.divisiId);
    if (!divisi || (divisi as any).companyId !== companyId) {
      throw new Error("Divisi tidak ditemukan atau tidak memiliki akses");
    }

    // Check if code already exists for this divisi and company
    const exists = await jabatanRepo.existsByCodeAndDivisi(
      data.code,
      data.divisiId,
      companyId
    );
    if (exists) {
      throw new Error("Kode jabatan sudah digunakan dalam divisi ini");
    }

    const jabatan = await jabatanRepo.create({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      divisi: { connect: { id: data.divisiId } },
      company: { connect: { id: companyId } },
    }, companyId);

    return mapJabatanToDTO(jabatan);
  }

  /**
   * Update an existing jabatan
   */
  static async update(id: string, data: UpdateJabatanDTO, companyId: string): Promise<JabatanDTO> {
    // Check if jabatan exists
    const existing = await jabatanRepo.findById(id);
    if (!existing || !existing.divisi) {
      throw new Error("Jabatan tidak ditemukan");
    }

    // Verify jabatan belongs to the company through divisi
    if ((existing.divisi as any).companyId !== companyId) {
      throw new Error("Jabatan tidak ditemukan atau tidak memiliki akses");
    }

    const divisiId = data.divisiId ?? existing.divisiId;
    const code = data.code ?? existing.code;

    // If divisi is being changed, validate it exists and belongs to company
    if (data.divisiId && data.divisiId !== existing.divisiId) {
      const divisi = await divisiRepo.findById(data.divisiId);
      if (!divisi || (divisi as any).companyId !== companyId) {
        throw new Error("Divisi tidak ditemukan atau tidak memiliki akses");
      }
    }

    // Check if code is being changed or divisi is being changed
    if ((data.code && data.code !== existing.code) || (data.divisiId && data.divisiId !== existing.divisiId)) {
      const codeExists = await jabatanRepo.existsByCodeAndDivisi(code, divisiId, companyId, id);
      if (codeExists) {
        throw new Error("Kode jabatan sudah digunakan dalam divisi ini");
      }
    }

    const updated = await jabatanRepo.update(id, {
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.divisiId && { divisi: { connect: { id: data.divisiId } } }),
    });

    return mapJabatanToDTO(updated);
  }

  /**
   * Delete a jabatan
   */
  static async delete(id: string, companyId: string): Promise<void> {
    const existing = await jabatanRepo.findById(id);
    if (!existing || !existing.divisi) {
      throw new Error("Jabatan tidak ditemukan");
    }

    // Verify jabatan belongs to the company through divisi
    if ((existing.divisi as any).companyId !== companyId) {
      throw new Error("Jabatan tidak ditemukan atau tidak memiliki akses");
    }

    // Check if jabatan is being used by employees
    const jabatanWithCount = await jabatanRepo.findById(id, true);
    if (jabatanWithCount && (jabatanWithCount as any)?._count?.employees > 0) {
      throw new Error("Jabatan tidak dapat dihapus karena masih digunakan oleh karyawan");
    }

    await jabatanRepo.delete(id);
  }

  /**
   * Get jabatan by ID
   */
  static async getById(id: string, companyId: string): Promise<JabatanDTO | null> {
    const jabatan = await jabatanRepo.findById(id);
    if (!jabatan || !jabatan.divisi || (jabatan.divisi as any).companyId !== companyId) {
      return null;
    }
    return mapJabatanToDTO(jabatan as any);
  }

  /**
   * Get jabatan with pagination and filters
   */
  static async getList(params: {
    search?: string;
    divisiId?: string;
    isActive?: "true" | "false" | "all";
    page: number;
    limit: number;
    companyId: string;
  }): Promise<ListResponse<JabatanDTO>> {
    const isActiveFilter =
      params.isActive === "true" ? true :
      params.isActive === "false" ? false : "all";

    const { data, total } = await jabatanRepo.findPaged({
      search: params.search,
      divisiId: params.divisiId,
      isActive: isActiveFilter,
      page: params.page,
      limit: params.limit,
      companyId: params.companyId,
    });

    return {
      data: data.map(mapJabatanToDTO),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  /**
   * Get all active jabatan for dropdown/select
   */
  static async getAllActive(companyId: string, divisiId?: string): Promise<JabatanDTO[]> {
    const jabatanList = await jabatanRepo.findAllActive(companyId, divisiId);
    return jabatanList.map(mapJabatanToDTO);
  }
}

