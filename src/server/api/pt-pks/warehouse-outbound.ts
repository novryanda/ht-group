/**
 * Warehouse Outbound API Module
 * API layer untuk transaksi barang keluar
 */

import { WarehouseOutboundService } from "~/server/services/pt-pks/warehouse-outbound.service";
import {
  createWarehouseOutboundSchema,
  updateWarehouseOutboundSchema,
  warehouseOutboundQuerySchema,
  type CreateWarehouseOutboundInput,
  type UpdateWarehouseOutboundInput,
  type WarehouseOutboundQuery,
} from "~/server/schemas/pt-pks/warehouse-transaction";
import type { WarehouseOutboundDTO } from "~/server/types/pt-pks/warehouse-transaction";

export class WarehouseOutboundAPI {
  private service: WarehouseOutboundService;

  constructor() {
    this.service = new WarehouseOutboundService();
  }

  /**
   * Create new outbound transaction
   */
  async create(
    input: unknown,
    createdById: string
  ): Promise<{
    success: boolean;
    data?: WarehouseOutboundDTO;
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      // Validate input
      const validation = createWarehouseOutboundSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: "Data tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.createOutbound(validation.data, createdById);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: 400,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 201,
      };
    } catch (error) {
      console.error("❌ Error in WarehouseOutboundAPI.create:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Update outbound transaction
   */
  async update(
    id: string,
    input: unknown
  ): Promise<{
    success: boolean;
    data?: WarehouseOutboundDTO;
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      // Validate input
      const validation = updateWarehouseOutboundSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: "Data tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.updateOutbound(id, validation.data);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error in WarehouseOutboundAPI.update:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Get outbound by ID
   */
  async getById(id: string): Promise<{
    success: boolean;
    data?: WarehouseOutboundDTO;
    error?: string;
    statusCode: number;
  }> {
    try {
      const result = await this.service.getOutboundById(id);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error in WarehouseOutboundAPI.getById:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Get outbounds with pagination
   */
  async getAll(query: unknown): Promise<{
    success: boolean;
    data?: WarehouseOutboundDTO[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      // Validate query params
      const validation = warehouseOutboundQuerySchema.safeParse(query);
      if (!validation.success) {
        return {
          success: false,
          error: "Query tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.getOutbounds(validation.data);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: 400,
        };
      }

      return {
        success: true,
        data: result.data,
        meta: result.meta,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error in WarehouseOutboundAPI.getAll:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete outbound transaction
   */
  async delete(id: string): Promise<{
    success: boolean;
    error?: string;
    statusCode: number;
  }> {
    try {
      const result = await this.service.deleteOutbound(id);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: 404,
        };
      }

      return {
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error in WarehouseOutboundAPI.delete:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }
}
