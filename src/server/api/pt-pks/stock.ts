/**
 * Stock API Class
 * Handles HTTP layer for stock operations
 */

import { StockService } from "~/server/services/pt-pks/stock.service";
import type { InitialStockInput } from "~/server/schemas/pt-pks/item";

export class StockAPI {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  /**
   * Get stock balance for item
   */
  async getStockBalance(
    itemId: string,
    warehouseId: string,
    binId?: string,
  ) {
    try {
      const balance = await this.stockService.getStockBalance(
        itemId,
        warehouseId,
        binId,
      );

      return {
        success: true,
        data: balance,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get stock balance error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get stock balance",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all stock balances for an item
   */
  async getItemStockBalances(itemId: string) {
    try {
      const balances = await this.stockService.getItemStockBalances(itemId);

      return {
        success: true,
        data: balances,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get item stock balances error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get item stock balances",
        statusCode: 500,
      };
    }
  }

  /**
   * Get stock ledger entries for item
   */
  async getItemStockLedger(
    itemId: string,
    options?: {
      warehouseId?: string;
      binId?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    try {
      const ledgerEntries = await this.stockService.getItemStockLedger(
        itemId,
        options,
      );

      return {
        success: true,
        data: ledgerEntries,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Get stock ledger error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get stock ledger",
        statusCode: 500,
      };
    }
  }

  /**
   * Validate stock availability
   */
  async validateStockAvailability(
    itemId: string,
    warehouseId: string,
    binId: string | null,
    requiredQty: number,
  ) {
    try {
      const validation = await this.stockService.validateStockAvailability(
        itemId,
        warehouseId,
        binId,
        requiredQty,
      );

      return {
        success: true,
        data: validation,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Validate stock availability error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to validate stock availability",
        statusCode: 500,
      };
    }
  }
}