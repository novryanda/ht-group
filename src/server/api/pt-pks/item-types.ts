import { ItemTypeService } from "~/server/services/pt-pks/item-type.service";
import {
  createItemTypeSchema,
  updateItemTypeSchema,
  itemTypeQuerySchema,
} from "~/server/schemas/pt-pks/item-type";

export class ItemTypesAPI {
  static async create(input: unknown) {
    const validated = createItemTypeSchema.parse(input);
    try {
      const data = await ItemTypeService.create(validated);
      return { success: true, data, statusCode: 201 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat jenis barang",
        statusCode: 400,
      };
    }
  }

  static async update(id: string, input: unknown) {
    const validated = updateItemTypeSchema.parse(input);
    try {
      const data = await ItemTypeService.update(id, validated);
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate jenis barang",
        statusCode: 400,
      };
    }
  }

  static async delete(id: string) {
    try {
      await ItemTypeService.delete(id);
      return { success: true, data: { message: "Jenis barang berhasil dihapus" }, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus jenis barang",
        statusCode: 400,
      };
    }
  }

  static async getById(id: string) {
    try {
      const data = await ItemTypeService.getById(id);
      if (!data) {
        return { success: false, error: "Jenis barang tidak ditemukan", statusCode: 404 };
      }
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil jenis barang",
        statusCode: 500,
      };
    }
  }

  static async getList(query: unknown) {
    const validated = itemTypeQuerySchema.parse(query);
    try {
      const data = await ItemTypeService.getList(validated);
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil daftar jenis barang",
        statusCode: 500,
      };
    }
  }

  static async getAllActive(categoryId?: string) {
    try {
      const data = await ItemTypeService.getAllActive(categoryId);
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil jenis barang aktif",
        statusCode: 500,
      };
    }
  }
}
