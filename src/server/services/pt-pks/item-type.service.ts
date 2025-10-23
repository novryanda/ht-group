import { itemTypeRepo } from "~/server/repositories/pt-pks/item-type.repo";
import { mapItemTypeToDTO } from "~/server/mappers/pt-pks/material-inventory.mapper";
import type { CreateItemTypeDTO, UpdateItemTypeDTO, ItemTypeDTO, ListResponse, PaginationMeta } from "~/server/types/pt-pks/material-inventory";

export class ItemTypeService {
  static async create(data: CreateItemTypeDTO): Promise<ItemTypeDTO> {
    const exists = await itemTypeRepo.existsByCodeAndCategory(data.code, data.categoryId);
    if (exists) {
      throw new Error("Kode jenis sudah digunakan dalam kategori ini");
    }

    const itemType = await itemTypeRepo.create({
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      category: { connect: { id: data.categoryId } },
    });

    return mapItemTypeToDTO(itemType);
  }

  static async update(id: string, data: UpdateItemTypeDTO): Promise<ItemTypeDTO> {
    const existing = await itemTypeRepo.findById(id);
    if (!existing) {
      throw new Error("Jenis barang tidak ditemukan");
    }

    if (data.code && data.categoryId) {
      const codeExists = await itemTypeRepo.existsByCodeAndCategory(data.code, data.categoryId, id);
      if (codeExists) {
        throw new Error("Kode jenis sudah digunakan dalam kategori ini");
      }
    }

    const updated = await itemTypeRepo.update(id, {
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
    });

    return mapItemTypeToDTO(updated);
  }

  static async delete(id: string): Promise<void> {
    const existing = await itemTypeRepo.findById(id);
    if (!existing) {
      throw new Error("Jenis barang tidak ditemukan");
    }
    await itemTypeRepo.delete(id);
  }

  static async getById(id: string): Promise<ItemTypeDTO | null> {
    const itemType = await itemTypeRepo.findById(id);
    if (!itemType) return null;
    return mapItemTypeToDTO(itemType);
  }

  static async getList(params: {
    search?: string;
    categoryId?: string;
    isActive?: "true" | "false" | "all";
    page: number;
    limit: number;
  }): Promise<ListResponse<ItemTypeDTO>> {
    const isActiveFilter =
      params.isActive === "true" ? true :
      params.isActive === "false" ? false : "all";

    const { data, total } = await itemTypeRepo.findPaged({
      search: params.search,
      categoryId: params.categoryId,
      isActive: isActiveFilter,
      page: params.page,
      limit: params.limit,
    });

    return {
      data: data.map(mapItemTypeToDTO),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  static async getAllActive(categoryId?: string): Promise<ItemTypeDTO[]> {
    const itemTypes = await itemTypeRepo.findAllActive(categoryId);
    return itemTypes.map(mapItemTypeToDTO);
  }
}
