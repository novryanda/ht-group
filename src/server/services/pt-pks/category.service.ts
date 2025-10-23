import { categoryRepo } from "~/server/repositories/pt-pks/category.repo";
import { mapCategoryToDTO } from "~/server/mappers/pt-pks/material-inventory.mapper";
import type { CreateCategoryDTO, UpdateCategoryDTO, CategoryDTO, ListResponse, PaginationMeta } from "~/server/types/pt-pks/material-inventory";

export class CategoryService {
  /**
   * Create a new category
   */
  static async create(data: CreateCategoryDTO): Promise<CategoryDTO> {
    // Check if code already exists
    const exists = await categoryRepo.existsByCode(data.code);
    if (exists) {
      throw new Error("Kode kategori sudah digunakan");
    }

    const category = await categoryRepo.create({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    });

    return mapCategoryToDTO(category);
  }

  /**
   * Update an existing category
   */
  static async update(id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> {
    // Check if category exists
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Kategori tidak ditemukan");
    }

    // Check if code is being changed and already exists
    if (data.code && data.code !== existing.code) {
      const codeExists = await categoryRepo.existsByCode(data.code, id);
      if (codeExists) {
        throw new Error("Kode kategori sudah digunakan");
      }
    }

    const updated = await categoryRepo.update(id, data);
    return mapCategoryToDTO(updated);
  }

  /**
   * Delete a category
   */
  static async delete(id: string): Promise<void> {
    const existing = await categoryRepo.findById(id);
    if (!existing) {
      throw new Error("Kategori tidak ditemukan");
    }

    // TODO: Check if category is being used by item types or items
    // If yes, prevent deletion or implement soft delete

    await categoryRepo.delete(id);
  }

  /**
   * Get category by ID
   */
  static async getById(id: string): Promise<CategoryDTO | null> {
    const category = await categoryRepo.findById(id);
    if (!category) return null;
    return mapCategoryToDTO(category);
  }

  /**
   * Get category by code
   */
  static async getByCode(code: string): Promise<CategoryDTO | null> {
    const category = await categoryRepo.findByCode(code);
    if (!category) return null;
    return mapCategoryToDTO(category);
  }

  /**
   * Get categories with pagination and filters
   */
  static async getList(params: {
    search?: string;
    isActive?: "true" | "false" | "all";
    page: number;
    limit: number;
  }): Promise<ListResponse<CategoryDTO>> {
    const isActiveFilter =
      params.isActive === "true" ? true :
      params.isActive === "false" ? false : "all";

    const { data, total } = await categoryRepo.findPaged({
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
      data: data.map(mapCategoryToDTO),
      meta,
    };
  }

  /**
   * Get all active categories for dropdown/select
   */
  static async getAllActive(): Promise<CategoryDTO[]> {
    const categories = await categoryRepo.findAllActive();
    return categories.map(mapCategoryToDTO);
  }
}
