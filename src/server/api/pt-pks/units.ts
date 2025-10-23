import { UnitService } from "~/server/services/pt-pks/unit.service";
import {
  createUnitSchema,
  updateUnitSchema,
  unitQuerySchema,
} from "~/server/schemas/pt-pks/unit";
import type { UnitQuery, UnitInput, UpdateUnitInput } from "~/server/schemas/pt-pks/unit";

export class UnitsAPI {
  /**
   * Create a new unit
   */
  static async create(input: unknown) {
    const validated = createUnitSchema.parse(input) as UnitInput;

    try {
      const data = await UnitService.create(validated);
      return {
        success: true,
        data,
        statusCode: 201,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat satuan",
        statusCode: 400,
      };
    }
  }

  /**
   * Update an existing unit
   */
  static async update(id: string, input: unknown) {
    const validated = updateUnitSchema.parse(input) as UpdateUnitInput;

    try {
      const data = await UnitService.update(id, validated);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengupdate satuan",
        statusCode: 400,
      };
    }
  }

  /**
   * Delete a unit
   */
  static async delete(id: string) {
    try {
      await UnitService.delete(id);
      return {
        success: true,
        data: { message: "Satuan berhasil dihapus" },
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus satuan",
        statusCode: 400,
      };
    }
  }

  /**
   * Get unit by ID
   */
  static async getById(id: string) {
    try {
      const data = await UnitService.getById(id);
      if (!data) {
        return {
          success: false,
          error: "Satuan tidak ditemukan",
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
        error: error instanceof Error ? error.message : "Gagal mengambil satuan",
        statusCode: 500,
      };
    }
  }

  /**
   * Get units with pagination and filters
   */
  static async getList(query: unknown) {
    const validated = unitQuerySchema.parse(query) as UnitQuery;

    try {
      const data = await UnitService.getList(validated);
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil daftar satuan",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all active units
   */
  static async getAllActive() {
    try {
      const data = await UnitService.getAllActive();
      return {
        success: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil satuan aktif",
        statusCode: 500,
      };
    }
  }
}
