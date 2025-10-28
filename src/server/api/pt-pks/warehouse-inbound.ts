/**
 * Warehouse Inbound API Module
 * API layer untuk transaksi barang masuk
 */

import { WarehouseInboundService } from "~/server/services/pt-pks/warehouse-inbound.service";
import {
  createWarehouseInboundSchema,
  createNewItemInboundSchema,
  warehouseInboundQuerySchema,
  createLoanReturnSchema,
  type CreateWarehouseInboundInput,
  type CreateNewItemInboundInput,
  type WarehouseInboundQuery,
  type CreateLoanReturnInput,
} from "~/server/schemas/pt-pks/warehouse-transaction";
import type { WarehouseInboundDTO } from "~/server/types/pt-pks/warehouse-transaction";

export class WarehouseInboundAPI {
  private service: WarehouseInboundService;

  constructor() {
    this.service = new WarehouseInboundService();
  }

  /**
   * Create inbound transaction (return or existing items)
   */
  async create(
    input: unknown,
    createdById: string
  ): Promise<{
    success: boolean;
    data?: WarehouseInboundDTO;
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      const validation = createWarehouseInboundSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: "Data tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.createInbound(validation.data, createdById);

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
      console.error("❌ Error in WarehouseInboundAPI.create:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Create new item + inbound
   */
  async createNewItem(
    input: unknown,
    createdById: string
  ): Promise<{
    success: boolean;
    data?: WarehouseInboundDTO;
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      const validation = createNewItemInboundSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: "Data tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.createNewItemInbound(validation.data, createdById);

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
      console.error("❌ Error in WarehouseInboundAPI.createNewItem:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Get inbound by ID
   */
  async getById(id: string): Promise<{
    success: boolean;
    data?: WarehouseInboundDTO;
    error?: string;
    statusCode: number;
  }> {
    try {
      const result = await this.service.getInboundById(id);

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
      console.error("❌ Error in WarehouseInboundAPI.getById:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Get inbounds with pagination
   */
  async getAll(query: unknown): Promise<{
    success: boolean;
    data?: WarehouseInboundDTO[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      const validation = warehouseInboundQuerySchema.safeParse(query);
      if (!validation.success) {
        return {
          success: false,
          error: "Query tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.getInbounds(validation.data);

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
      console.error("❌ Error in WarehouseInboundAPI.getAll:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete inbound transaction
   */
  async delete(id: string): Promise<{
    success: boolean;
    error?: string;
    statusCode: number;
  }> {
    try {
      const result = await this.service.deleteInbound(id);

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
      console.error("❌ Error in WarehouseInboundAPI.delete:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }

  /**
   * Process loan return
   */
  async processLoanReturn(
    input: unknown,
    createdById: string,
    companyId: string
  ): Promise<{
    success: boolean;
    data?: WarehouseInboundDTO;
    error?: string;
    details?: unknown;
    statusCode: number;
  }> {
    try {
      const validation = createLoanReturnSchema.safeParse(input);
      if (!validation.success) {
        return {
          success: false,
          error: "Data tidak valid",
          details: validation.error.format(),
          statusCode: 400,
        };
      }

      const result = await this.service.processLoanReturn(
        validation.data,
        createdById,
        companyId
      );

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
      console.error("❌ Error in WarehouseInboundAPI.processLoanReturn:", error);
      return {
        success: false,
        error: "Terjadi kesalahan server",
        statusCode: 500,
      };
    }
  }
}
