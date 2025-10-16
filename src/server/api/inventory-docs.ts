import { z } from "zod";
import {
  GrnService,
  GoodsIssueService,
  StockTransferService,
  StockAdjustmentService,
  StockCountService,
} from "~/server/services/inventory-docs.service";
import { OpeningBalanceService } from "~/server/services/inventory.service";
import {
  createIssueSchema,
  createTransferSchema,
  createAdjustmentSchema,
  createCountSchema,
  postCountSchema,
  createOpeningBalanceSchema,
  listQuerySchema,
} from "~/server/schemas/inventory";
import type { APIResponse } from "~/server/types/inventory";

// ============================================================================
// INVENTORY DOCUMENTS API MODULE
// ============================================================================

export class InventoryDocsAPI {
  // ==========================================================================
  // GOODS ISSUE APIs
  // ==========================================================================

  static async createIssue(data: unknown): Promise<APIResponse> {
    try {
      const validated = createIssueSchema.parse(data);
      const issue = await GoodsIssueService.create(validated);
      return {
        success: true,
        data: issue,
        message: "Goods Issue berhasil dibuat dan stok telah diupdate",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getIssueById(id: string): Promise<APIResponse> {
    try {
      const issue = await GoodsIssueService.getById(id);
      if (!issue) {
        return {
          success: false,
          error: "Goods Issue tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: issue,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getIssueList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await GoodsIssueService.getList(validated);
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
  // STOCK TRANSFER APIs
  // ==========================================================================

  static async createTransfer(data: unknown): Promise<APIResponse> {
    try {
      const validated = createTransferSchema.parse(data);
      const transfer = await StockTransferService.create(validated);
      return {
        success: true,
        data: transfer,
        message: "Stock Transfer berhasil dibuat dan stok telah diupdate",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getTransferById(id: string): Promise<APIResponse> {
    try {
      const transfer = await StockTransferService.getById(id);
      if (!transfer) {
        return {
          success: false,
          error: "Stock Transfer tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: transfer,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getTransferList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await StockTransferService.getList(validated);
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
  // STOCK ADJUSTMENT APIs
  // ==========================================================================

  static async createAdjustment(data: unknown): Promise<APIResponse> {
    try {
      const validated = createAdjustmentSchema.parse(data);
      const adjustment = await StockAdjustmentService.create(validated);
      return {
        success: true,
        data: adjustment,
        message: "Stock Adjustment berhasil dibuat dan stok telah diupdate",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getAdjustmentById(id: string): Promise<APIResponse> {
    try {
      const adjustment = await StockAdjustmentService.getById(id);
      if (!adjustment) {
        return {
          success: false,
          error: "Stock Adjustment tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: adjustment,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getAdjustmentList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await StockAdjustmentService.getList(validated);
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
  // STOCK COUNT APIs
  // ==========================================================================

  static async createCount(data: unknown): Promise<APIResponse> {
    try {
      const validated = createCountSchema.parse(data);
      const count = await StockCountService.create(validated);
      return {
        success: true,
        data: count,
        message: "Stock Count berhasil dibuat (status: OPEN)",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getCountById(id: string): Promise<APIResponse> {
    try {
      const count = await StockCountService.getById(id);
      if (!count) {
        return {
          success: false,
          error: "Stock Count tidak ditemukan",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: count,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getCountList(query: unknown): Promise<APIResponse> {
    try {
      const validated = listQuerySchema.parse(query);
      const result = await StockCountService.getList(validated);
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

  static async postCount(data: unknown): Promise<APIResponse> {
    try {
      const validated = postCountSchema.parse(data);
      const count = await StockCountService.post(validated.countId);
      return {
        success: true,
        data: count,
        message: "Stock Count berhasil di-posting dan stok telah diupdate",
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
    console.error("Inventory Docs API Error:", error);

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
      if (message.includes("NOT_FOUND")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 404 };
      }
      if (message.includes("STOCK_INSUFFICIENT")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 409 };
      }
      if (message.includes("ALREADY_POSTED")) {
        return { success: false, error: message.split(": ")[1] ?? message, statusCode: 422 };
      }
      if (message.includes("INACTIVE")) {
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
}

