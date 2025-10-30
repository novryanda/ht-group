/**
 * API Module for Weighbridge Ticket
 * Tier 2: Validation & Error Handling
 */

import { WeighbridgeService } from "~/server/services/pt-pks/weighbridge.service";
import {
  createPBHarianSchema,
  bulkCreatePBHarianSchema,
  updateTimbanganPricingSchema,
  weighbridgeQuerySchema,
} from "~/server/schemas/pt-pks/weighbridge";
import type {
  CreatePBHarianDTO,
  UpdateTimbanganPricingDTO,
  WeighbridgeQueryDTO,
} from "~/server/types/pt-pks/weighbridge";

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export class WeighbridgeAPI {
  /**
   * Get ticket by ID and companyId (for PB Harian)
   */
  static async getTicketById(id: string, companyId: string): Promise<APIResponse> {
    try {
      const ticket = await WeighbridgeService.getById(id);
      if (!ticket || ticket.companyId !== companyId) {
        return {
          success: false,
          error: "Tiket tidak ditemukan untuk perusahaan ini",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: ticket,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update PB Harian fields (PATCH)
   */
  static async updatePBFields(id: string, data: unknown, companyId: string): Promise<APIResponse> {
    try {
      // For now, reuse updatePricing logic, but you can customize as needed
      const ticket = await WeighbridgeService.getById(id);
      if (!ticket || ticket.companyId !== companyId) {
        return {
          success: false,
          error: "Tiket tidak ditemukan untuk perusahaan ini",
          statusCode: 404,
        };
      }
      // You may want to validate and update only allowed PB fields here
      // For demo, just call updatePricing
      const updated = await WeighbridgeService.updatePricing(id, data as any);
      return {
        success: true,
        data: updated,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Get tickets list with filters
   */
  static async getList(query: unknown): Promise<APIResponse> {
    try {
      const validated = weighbridgeQuerySchema.parse(
        query
      ) as WeighbridgeQueryDTO;
      const result = await WeighbridgeService.getList(validated);

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

  /**
   * Get ticket by ID
   */
  static async getById(id: string): Promise<APIResponse> {
    try {
      const ticket = await WeighbridgeService.getById(id);

      if (!ticket) {
        return {
          success: false,
          error: "Tiket tidak ditemukan",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: ticket,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create single ticket (Phase 1: PB Harian)
   */
  static async createPBHarian(
    data: unknown,
    createdById: string
  ): Promise<APIResponse> {
    try {
      const validated = createPBHarianSchema.parse(data) as CreatePBHarianDTO;
      const ticket = await WeighbridgeService.createPBHarian(
        validated,
        createdById
      );

      return {
        success: true,
        data: ticket,
        message: "Tiket berhasil dibuat",
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Bulk create tickets (Phase 1: PB Harian)
   */
  static async bulkCreatePBHarian(
    data: unknown,
    createdById: string
  ): Promise<APIResponse> {
    try {
      const validated = bulkCreatePBHarianSchema.parse(data);
      const result = await WeighbridgeService.bulkCreatePBHarian(
        validated.tickets as CreatePBHarianDTO[],
        createdById
      );

      return {
        success: true,
        data: result,
        message: `${result.success} tiket berhasil dibuat, ${result.failed} gagal`,
        statusCode: 201,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update pricing (Phase 2: Timbangan)
   */
  static async updatePricing(
    id: string,
    data: unknown
  ): Promise<APIResponse> {
    try {
      const validated = updateTimbanganPricingSchema.parse(
        data
      ) as UpdateTimbanganPricingDTO;
      const ticket = await WeighbridgeService.updatePricing(id, validated);

      return {
        success: true,
        data: ticket,
        message: "Harga berhasil diupdate",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete ticket
   */
  static async delete(id: string): Promise<APIResponse> {
    try {
      await WeighbridgeService.delete(id);

      return {
        success: true,
        message: "Tiket berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generate next serial number
   */
  static async generateNoSeri(
    companyId: string,
    tanggal: string
  ): Promise<APIResponse> {
    try {
      const noSeri = await WeighbridgeService.generateNoSeri(
        companyId,
        new Date(tanggal)
      );

      return {
        success: true,
        data: { noSeri },
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // Lookup endpoints
  // ============================================

  static async getVehicles(): Promise<APIResponse> {
    try {
      const vehicles = await WeighbridgeService.getVehicles();
      return {
        success: true,
        data: vehicles,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getSuppliers(): Promise<APIResponse> {
    try {
      const suppliers = await WeighbridgeService.getSuppliers();
      return {
        success: true,
        data: suppliers,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getItems(): Promise<APIResponse> {
    try {
      const items = await WeighbridgeService.getItems();
      return {
        success: true,
        data: items,
        statusCode: 200,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ============================================
  // Error handling
  // ============================================

  private static handleError(error: unknown): APIResponse {
    console.error("WeighbridgeAPI Error:", error);

    if (error instanceof Error) {
      // Validation errors from Zod
      if (error.message.includes("Validation")) {
        return {
          success: false,
          error: error.message,
          statusCode: 400,
        };
      }

      // Business logic errors
      if (
        error.message.includes("sudah digunakan") ||
        error.message.includes("tidak ditemukan") ||
        error.message.includes("hanya dapat")
      ) {
        return {
          success: false,
          error: error.message,
          statusCode: 409,
        };
      }

      return {
        success: false,
        error: error.message,
        statusCode: 400,
      };
    }

    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    };
  }
}
