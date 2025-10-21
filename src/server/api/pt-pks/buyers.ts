import { z } from "zod";
import { BuyerService } from "~/server/services/pt-pks/buyer.service";
import {
  createBuyerSchema,
  updateBuyerSchema,
  listBuyerQuerySchema,
  checkDuplicateQuerySchema,
} from "~/server/schemas/pt-pks/buyer";
import type { BuyerFilter, BuyerPagination } from "~/server/types/pt-pks/buyer";

/**
 * Buyer API Module - Application layer
 * Handles validation, error handling, and response formatting
 */
export class BuyerAPI {
  /**
   * Create a new buyer
   */
  static async createBuyer(data: unknown, currentUserId: string) {
    try {
      // Validate input
      const validatedData = createBuyerSchema.parse(data);

      // Create buyer
      const buyer = await BuyerService.createBuyer(validatedData, currentUserId);

      return {
        success: true,
        data: buyer,
        message: "Buyer berhasil dibuat dan terverifikasi",
        statusCode: 201,
      };
    } catch (error) {
      console.error("Error in createBuyer API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Data tidak valid",
          details: error.issues,
          statusCode: 400,
        };
      }

      if (error instanceof Error) {
        // Check for duplicate error
        if (error.message.includes("sudah terdaftar")) {
          return {
            success: false,
            error: error.message,
            statusCode: 409,
          };
        }

        // Check for unique constraint violation
        if (error.message.includes("Unique constraint")) {
          return {
            success: false,
            error: "NPWP sudah terdaftar",
            statusCode: 409,
          };
        }
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat membuat buyer",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get buyers with filtering and pagination
   */
  static async getBuyers(queryParams: unknown) {
    try {
      // Validate and parse query parameters
      const validated = listBuyerQuerySchema.parse(queryParams);

      const filter: BuyerFilter = {
        query: validated.query,
        type: validated.type,
        pkpStatus: validated.pkpStatus,
        status: validated.status,
        city: validated.city,
        province: validated.province,
      };

      const pagination: BuyerPagination = {
        page: validated.page,
        pageSize: validated.pageSize,
        sortBy: validated.sortBy,
        sortOrder: validated.sortOrder,
      };

      const { buyers, total } = await BuyerService.getBuyers(filter, pagination);

      const totalPages = Math.ceil(total / validated.pageSize);

      return {
        success: true,
        data: buyers,
        pagination: {
          page: validated.page,
          pageSize: validated.pageSize,
          total,
          totalPages,
          hasNext: validated.page < totalPages,
          hasPrev: validated.page > 1,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getBuyers API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Parameter query tidak valid",
          details: error.issues,
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil data buyer",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get buyer by ID
   */
  static async getBuyerById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID buyer tidak valid",
          statusCode: 400,
        };
      }

      const buyer = await BuyerService.getBuyerById(id);

      if (!buyer) {
        return {
          success: false,
          error: "Buyer tidak ditemukan",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: buyer,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getBuyerById API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil data buyer",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Update buyer
   */
  static async updateBuyer(id: string, data: unknown) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID buyer tidak valid",
          statusCode: 400,
        };
      }

      // Validate input
      const validatedData = updateBuyerSchema.parse(data);

      // Update buyer
      const buyer = await BuyerService.updateBuyer(id, validatedData);

      return {
        success: true,
        data: buyer,
        message: "Buyer berhasil diperbarui",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in updateBuyer API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Data tidak valid",
          details: error.issues,
          statusCode: 400,
        };
      }

      if (error instanceof Error) {
        if (error.message.includes("tidak ditemukan")) {
          return {
            success: false,
            error: error.message,
            statusCode: 404,
          };
        }

        if (error.message.includes("sudah terdaftar")) {
          return {
            success: false,
            error: error.message,
            statusCode: 409,
          };
        }
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat memperbarui buyer",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete buyer
   */
  static async deleteBuyer(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID buyer tidak valid",
          statusCode: 400,
        };
      }

      await BuyerService.deleteBuyer(id);

      return {
        success: true,
        message: "Buyer berhasil dihapus",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in deleteBuyer API:", error);

      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return {
          success: false,
          error: error.message,
          statusCode: 404,
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat menghapus buyer",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Check for duplicate buyers
   */
  static async checkDuplicate(queryParams: unknown) {
    try {
      // Validate query parameters
      const validated = checkDuplicateQuerySchema.parse(queryParams);

      const result = await BuyerService.checkDuplicate(validated);

      return {
        success: true,
        data: {
          isDuplicate: result.isDuplicate,
          duplicates: result.duplicates,
          message: result.message,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in checkDuplicate API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Parameter query tidak valid",
          details: error.issues,
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat memeriksa duplikasi",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get buyer statistics
   */
  static async getStats() {
    try {
      const stats = await BuyerService.getStats();

      return {
        success: true,
        data: stats,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getStats API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil statistik",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }
}

