import { JabatanService } from "~/server/services/pt-pks/jabatan.service";
import {
  createJabatanSchema,
  updateJabatanSchema,
  jabatanQuerySchema,
} from "~/server/schemas/pt-pks/jabatan";
import type { JabatanQuery, JabatanInput, UpdateJabatanInput } from "~/server/schemas/pt-pks/jabatan";

export class JabatanAPI {
  /**
   * Create a new jabatan
   */
  static async create(input: unknown, companyId: string) {
    const validated = createJabatanSchema.parse(input) as JabatanInput;

    try {
      const data = await JabatanService.create(validated, companyId);
      return {
        success: true,
        data,
        statusCode: 201,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat jabatan",
        statusCode: 400,
      };
    }
  }

  /**
   * Update an existing jabatan
   */
  static async update(id: string, input: unknown, companyId: string) {
    const validated = updateJabatanSchema.parse(input) as UpdateJabatanInput;

    try {
      const data = await JabatanService.update(id, validated, companyId);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate jabatan",
        statusCode: 400,
      };
    }
  }

  /**
   * Delete a jabatan
   */
  static async delete(id: string, companyId: string) {
    try {
      await JabatanService.delete(id, companyId);
      return {
        success: true,
        data: { message: "Jabatan berhasil dihapus" },
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus jabatan",
        statusCode: 400,
      };
    }
  }

  /**
   * Get jabatan by ID
   */
  static async getById(id: string, companyId: string) {
    try {
      const data = await JabatanService.getById(id, companyId);
      if (!data) {
        return {
          success: false,
          error: "Jabatan tidak ditemukan",
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
        error: error instanceof Error ? error.message : "Gagal mengambil jabatan",
        statusCode: 500,
      };
    }
  }

  /**
   * Get jabatan with pagination and filters
   */
  static async getList(query: unknown, companyId: string) {
    const validated = jabatanQuerySchema.parse(query) as JabatanQuery;

    try {
      const data = await JabatanService.getList({
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
        error: error instanceof Error ? error.message : "Gagal mengambil daftar jabatan",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all active jabatan
   */
  static async getAllActive(companyId: string, divisiId?: string) {
    try {
      const data = await JabatanService.getAllActive(companyId, divisiId);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil jabatan aktif",
        statusCode: 500,
      };
    }
  }
}

