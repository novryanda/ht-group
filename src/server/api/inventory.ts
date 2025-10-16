import { z } from "zod";
import {
  UomService,
  MaterialCategoryService,
  MaterialService,
  WarehouseService,
  LocationService,
  StockQueryService,
  OpeningBalanceService,
} from "~/server/services/inventory.service";
import {
  GrnService,
  GoodsIssueService,
  StockTransferService,
  StockAdjustmentService,
  StockCountService,
} from "~/server/services/inventory-docs.service";
import {
  createUomSchema,
  updateUomSchema,
  createCategorySchema,
  updateCategorySchema,
  createMaterialSchema,
  updateMaterialSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
  createLocationSchema,
  updateLocationSchema,
  createGrnSchema,
  createIssueSchema,
  createTransferSchema,
  createAdjustmentSchema,
  createCountSchema,
  postCountSchema,
  createOpeningBalanceSchema,
  stockQuerySchema,
  ledgerQuerySchema,
  listQuerySchema,
} from "~/server/schemas/inventory";
import type { APIResponse } from "~/server/types/inventory";

// ============================================================================
// INVENTORY API MODULE
// ============================================================================

export class InventoryAPI {
  // ==========================================================================
  // UOM APIs
  // ==========================================================================

  static async createUom(data: unknown): Promise<APIResponse> {
    try {
      const validated = createUomSchema.parse(data);
      const uom = await UomService.create(validated);
      return {
        success: true,
        data: uom,
        message: "UoM berhasil dibuat",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getUomById(id: string): Promise<APIResponse> {
    try {
      const uom = await UomService.getById(id);
      if (!uom) {
        return {
          success: false,
          error: "UoM tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: uom,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getUomList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await UomService.getList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateUom(id: string, data: unknown): Promise<APIResponse> {
    try {
      const validated = updateUomSchema.parse(data);
      const uom = await UomService.update(id, validated);
      return {
        success: true,
        data: uom,
        message: "UoM berhasil diupdate",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteUom(id: string): Promise<APIResponse> {
    try {
      await UomService.delete(id);
      return {
        success: true,
        message: "UoM berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // MATERIAL CATEGORY APIs
  // ==========================================================================

  static async createCategory(data: unknown): Promise<APIResponse> {
    try {
      const validated = createCategorySchema.parse(data);
      const category = await MaterialCategoryService.create(validated);
      return {
        success: true,
        data: category,
        message: "Kategori berhasil dibuat",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getCategoryById(id: string): Promise<APIResponse> {
    try {
      const category = await MaterialCategoryService.getById(id);
      if (!category) {
        return {
          success: false,
          error: "Kategori tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: category,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getCategoryList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await MaterialCategoryService.getList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateCategory(id: string, data: unknown): Promise<APIResponse> {
    try {
      const validated = updateCategorySchema.parse(data);
      const category = await MaterialCategoryService.update(id, validated);
      return {
        success: true,
        data: category,
        message: "Kategori berhasil diupdate",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteCategory(id: string): Promise<APIResponse> {
    try {
      await MaterialCategoryService.delete(id);
      return {
        success: true,
        message: "Kategori berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // MATERIAL APIs
  // ==========================================================================

  static async createMaterial(data: unknown): Promise<APIResponse> {
    try {
      const validated = createMaterialSchema.parse(data);
      const material = await MaterialService.create(validated);
      return {
        success: true,
        data: material,
        message: "Material berhasil dibuat",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getMaterialById(id: string): Promise<APIResponse> {
    try {
      const material = await MaterialService.getById(id);
      if (!material) {
        return {
          success: false,
          error: "Material tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: material,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getMaterialList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await MaterialService.getList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateMaterial(id: string, data: unknown): Promise<APIResponse> {
    try {
      const validated = updateMaterialSchema.parse(data);
      const material = await MaterialService.update(id, validated);
      return {
        success: true,
        data: material,
        message: "Material berhasil diupdate",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteMaterial(id: string): Promise<APIResponse> {
    try {
      await MaterialService.delete(id);
      return {
        success: true,
        message: "Material berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // WAREHOUSE APIs
  // ==========================================================================

  static async createWarehouse(data: unknown): Promise<APIResponse> {
    try {
      const validated = createWarehouseSchema.parse(data);
      const warehouse = await WarehouseService.create(validated);
      return {
        success: true,
        data: warehouse,
        message: "Gudang berhasil dibuat",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getWarehouseById(id: string): Promise<APIResponse> {
    try {
      const warehouse = await WarehouseService.getById(id);
      if (!warehouse) {
        return {
          success: false,
          error: "Gudang tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: warehouse,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getWarehouseList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await WarehouseService.getList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateWarehouse(id: string, data: unknown): Promise<APIResponse> {
    try {
      const validated = updateWarehouseSchema.parse(data);
      const warehouse = await WarehouseService.update(id, validated);
      return {
        success: true,
        data: warehouse,
        message: "Gudang berhasil diupdate",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteWarehouse(id: string): Promise<APIResponse> {
    try {
      await WarehouseService.delete(id);
      return {
        success: true,
        message: "Gudang berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // LOCATION APIs
  // ==========================================================================

  static async createLocation(data: unknown): Promise<APIResponse> {
    try {
      const validated = createLocationSchema.parse(data);
      const location = await LocationService.create(validated);
      return {
        success: true,
        data: location,
        message: "Lokasi berhasil dibuat",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getLocationById(id: string): Promise<APIResponse> {
    try {
      const location = await LocationService.getById(id);
      if (!location) {
        return {
          success: false,
          error: "Lokasi tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: location,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getLocationList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await LocationService.getList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async updateLocation(id: string, data: unknown): Promise<APIResponse> {
    try {
      const validated = updateLocationSchema.parse(data);
      const location = await LocationService.update(id, validated);
      return {
        success: true,
        data: location,
        message: "Lokasi berhasil diupdate",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async deleteLocation(id: string): Promise<APIResponse> {
    try {
      await LocationService.delete(id);
      return {
        success: true,
        message: "Lokasi berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // STOCK & LEDGER QUERY APIs
  // ==========================================================================

  static async getStockList(query: unknown): Promise<APIResponse> {
    try {
      const validated = stockQuerySchema.parse(query);
      const result = await StockQueryService.getStockList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getLedgerList(query: unknown): Promise<APIResponse> {
    try {
      const validated = ledgerQuerySchema.parse(query);
      const result = await StockQueryService.getLedgerList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // OPENING BALANCE API
  // ==========================================================================

  static async postOpeningBalance(data: unknown): Promise<APIResponse> {
    try {
      const validated = createOpeningBalanceSchema.parse(data);
      const result = await OpeningBalanceService.post(validated);
      return {
        success: true,
        data: result,
        message: `Saldo awal berhasil di-posting untuk ${result.count} item`,
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // GRN APIs
  // ==========================================================================

  static async createGrn(data: unknown): Promise<APIResponse> {
    try {
      const validated = createGrnSchema.parse(data);
      const grn = await GrnService.create(validated);
      return {
        success: true,
        data: grn,
        message: "GRN berhasil dibuat dan stok telah diupdate",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getGrnById(id: string): Promise<APIResponse> {
    try {
      const grn = await GrnService.getById(id);
      if (!grn) {
        return {
          success: false,
          error: "GRN tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: grn,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getGrnList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await GrnService.getList(validated);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==========================================================================
  // ERROR HANDLER
  // ==========================================================================

  private static handleError(error: unknown): APIResponse {
    console.error("Inventory API Error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Data tidak valid",
        details: error.errors,
        statusCode: 400,
      };
    }

    if (error instanceof Error) {
      const message = error.message;

      // Domain-specific errors
      if (message.includes("CODE_EXISTS")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 409 };
      }
      if (message.includes("NOT_FOUND")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 404 };
      }
      if (message.includes("STOCK_INSUFFICIENT")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 409 };
      }
      if (message.includes("INACTIVE")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 422 };
      }
      if (message.includes("ALREADY_POSTED")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 422 };
      }

      return {
        success: false,
        error: message,
        statusCode: 500,
      };
    }

    return {
      success: false,
      error: "Terjadi kesalahan internal",
      statusCode: 500,
    };
  }
}

