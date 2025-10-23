import { CategoryService } from "~/server/services/pt-pks/category.service";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "~/server/schemas/pt-pks/category";
import type { CategoryQuery, CategoryInput, UpdateCategoryInput } from "~/server/schemas/pt-pks/category";

export class CategoriesAPI {
  /**
   * Create a new category
   */
  static async create(input: unknown) {
    const validated = createCategorySchema.parse(input) as CategoryInput;

    try {
      const data = await CategoryService.create(validated);
      return {
        success: true,
        data,
        statusCode: 201,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat kategori",
        statusCode: 400,
      };
    }
  }

  /**
   * Update an existing category
   */
  static async update(id: string, input: unknown) {
    const validated = updateCategorySchema.parse(input) as UpdateCategoryInput;

    try {
      const data = await CategoryService.update(id, validated);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate kategori",
        statusCode: 400,
      };
    }
  }

  /**
   * Delete a category
   */
  static async delete(id: string) {
    try {
      await CategoryService.delete(id);
      return {
        success: true,
        data: { message: "Kategori berhasil dihapus" },
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus kategori",
        statusCode: 400,
      };
    }
  }

  /**
   * Get category by ID
   */
  static async getById(id: string) {
    try {
      const data = await CategoryService.getById(id);
      if (!data) {
        return {
          success: false,
          error: "Kategori tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil kategori",
        statusCode: 500,
      };
    }
  }

  /**
   * Get categories with pagination and filters
   */
  static async getList(query: unknown) {
    const validated = categoryQuerySchema.parse(query) as CategoryQuery;

    try {
      const data = await CategoryService.getList(validated);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil daftar kategori",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all active categories
   */
  static async getAllActive() {
    try {
      const data = await CategoryService.getAllActive();
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil kategori aktif",
        statusCode: 500,
      };
    }
  }
}
