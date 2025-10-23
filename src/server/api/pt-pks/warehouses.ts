import { WarehouseService } from "~/server/services/pt-pks/warehouse.service";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseQuerySchema,
  createBinSchema,
  updateBinSchema,
} from "~/server/schemas/pt-pks/warehouse";
import type { z } from "zod";

export class WarehouseAPI {
  private service: WarehouseService;

  constructor() {
    this.service = new WarehouseService();
  }

  // ==================== WAREHOUSE ENDPOINTS ====================

  async getWarehouses(params: z.infer<typeof warehouseQuerySchema>) {
    try {
      const validated = warehouseQuerySchema.parse(params);
      
      // Convert string boolean to actual boolean
      const isActive = validated.isActive === "all" 
        ? "all" 
        : validated.isActive === "true";
      
      const result = await this.service.getAllWarehouses({
        search: validated.search,
        isActive,
        page: validated.page,
        limit: validated.limit,
      });

      return {
        success: true,
        data: result,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get warehouses error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch warehouses",
        statusCode: 400,
      };
    }
  }

  async getWarehouseById(id: string, includeBins = false) {
    try {
      const warehouse = includeBins
        ? await this.service.getWarehouseWithBins(id)
        : await this.service.getWarehouseById(id);

      if (!warehouse) {
        return {
          success: false,
          error: "Warehouse tidak ditemukan",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: warehouse,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get warehouse error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch warehouse",
        statusCode: 500,
      };
    }
  }

  async createWarehouse(data: unknown) {
    try {
      const validated = createWarehouseSchema.parse(data);
      const warehouse = await this.service.createWarehouse(validated);

      return {
        success: true,
        data: warehouse,
        statusCode: 201,
      };
    } catch (error) {
      console.error("❌ Create warehouse error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create warehouse",
        statusCode: 400,
      };
    }
  }

  async updateWarehouse(id: string, data: unknown) {
    try {
      const validated = updateWarehouseSchema.parse(data);
      const warehouse = await this.service.updateWarehouse(id, validated);

      return {
        success: true,
        data: warehouse,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Update warehouse error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update warehouse",
        statusCode: error instanceof Error && error.message.includes("tidak ditemukan")
          ? 404
          : 400,
      };
    }
  }

  async deleteWarehouse(id: string) {
    try {
      await this.service.deleteWarehouse(id);

      return {
        success: true,
        data: { message: "Warehouse berhasil dihapus" },
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Delete warehouse error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete warehouse",
        statusCode: error instanceof Error && error.message.includes("tidak ditemukan")
          ? 404
          : 400,
      };
    }
  }

  async getActiveWarehouses() {
    try {
      const warehouses = await this.service.getActiveWarehouses();

      return {
        success: true,
        data: warehouses,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get active warehouses error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch active warehouses",
        statusCode: 500,
      };
    }
  }

  // ==================== BIN ENDPOINTS ====================

  async getBinsByWarehouseId(warehouseId: string) {
    try {
      const bins = await this.service.getBinsByWarehouseId(warehouseId);

      return {
        success: true,
        data: bins,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get bins error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch bins",
        statusCode: 500,
      };
    }
  }

  async getBinById(id: string) {
    try {
      const bin = await this.service.getBinById(id);

      if (!bin) {
        return {
          success: false,
          error: "Bin tidak ditemukan",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: bin,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get bin error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch bin",
        statusCode: 500,
      };
    }
  }

  async createBin(data: unknown) {
    try {
      const validated = createBinSchema.parse(data);
      const bin = await this.service.createBin(validated);

      return {
        success: true,
        data: bin,
        statusCode: 201,
      };
    } catch (error) {
      console.error("❌ Create bin error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create bin",
        statusCode: 400,
      };
    }
  }

  async updateBin(id: string, data: unknown) {
    try {
      const validated = updateBinSchema.parse(data);
      const bin = await this.service.updateBin(id, validated);

      return {
        success: true,
        data: bin,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Update bin error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update bin",
        statusCode: error instanceof Error && error.message.includes("tidak ditemukan")
          ? 404
          : 400,
      };
    }
  }

  async deleteBin(id: string) {
    try {
      await this.service.deleteBin(id);

      return {
        success: true,
        data: { message: "Bin berhasil dihapus" },
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Delete bin error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete bin",
        statusCode: error instanceof Error && error.message.includes("tidak ditemukan")
          ? 404
          : 400,
      };
    }
  }
}
