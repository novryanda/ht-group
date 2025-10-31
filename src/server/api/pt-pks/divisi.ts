import { DivisiService } from "~/server/services/pt-pks/divisi.service";
import {
  createDivisiSchema,
  updateDivisiSchema,
  divisiQuerySchema,
} from "~/server/schemas/pt-pks/divisi";
import type { DivisiQuery, DivisiInput, UpdateDivisiInput } from "~/server/schemas/pt-pks/divisi";

export class DivisiAPI {
  /**
   * Create a new divisi
   */
  static async create(input: unknown, companyId: string) {
    const validated = createDivisiSchema.parse(input) as DivisiInput;

    try {
      const data = await DivisiService.create(validated, companyId);
      return {
        success: true,
        data,
        statusCode: 201,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat divisi",
        statusCode: 400,
      };
    }
  }

  /**
   * Update an existing divisi
   */
  static async update(id: string, input: unknown, companyId: string) {
    const validated = updateDivisiSchema.parse(input) as UpdateDivisiInput;

    try {
      const data = await DivisiService.update(id, validated, companyId);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate divisi",
        statusCode: 400,
      };
    }
  }

  /**
   * Delete a divisi
   */
  static async delete(id: string, companyId: string) {
    try {
      await DivisiService.delete(id, companyId);
      return {
        success: true,
        data: { message: "Divisi berhasil dihapus" },
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus divisi",
        statusCode: 400,
      };
    }
  }

  /**
   * Get divisi by ID
   */
  static async getById(id: string, companyId: string) {
    try {
      const data = await DivisiService.getById(id, companyId);
      if (!data) {
        return {
          success: false,
          error: "Divisi tidak ditemukan",
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
        error: error instanceof Error ? error.message : "Gagal mengambil divisi",
        statusCode: 500,
      };
    }
  }

  /**
   * Get divisi with pagination and filters
   */
  static async getList(query: unknown, companyId: string) {
    const validated = divisiQuerySchema.parse(query) as DivisiQuery;

    try {
      const data = await DivisiService.getList({
        ...validated,
        companyId,
      });
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil daftar divisi",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all active divisi
   */
  static async getAllActive(companyId: string) {
    try {
      const data = await DivisiService.getAllActive(companyId);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil divisi aktif",
        statusCode: 500,
      };
    }
  }
}

