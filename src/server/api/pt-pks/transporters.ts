import { z } from "zod";
import { TransportService } from "~/server/services/pt-pks/transport.service";
import {
  createTransporterSchema,
  updateTransporterSchema,
  listTransporterQuerySchema,
} from "~/server/schemas/pt-pks/transporter";
import type { TransporterFilter, TransporterPagination } from "~/server/types/pt-pks/transporter";

/**
 * Transporter API Module - Application layer
 * Handles validation, error handling, and response formatting
 */
export class TransporterAPI {
  /**
   * Create a new transporter
   */
  static async createTransporter(data: unknown) {
    try {
      // Validate input
      const validatedData = createTransporterSchema.parse(data);

      // Create transporter
      const transporter = await TransportService.createTransporter(validatedData);

      return {
        success: true,
        data: transporter,
        message: "Transportir berhasil dibuat dan terverifikasi",
        statusCode: 201,
      };
    } catch (error) {
      console.error("Error in createTransporter API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Data tidak valid",
          details: error.issues,
          statusCode: 400,
        };
      }

      if (error instanceof Error) {
        // Business logic errors
        if (error.message.includes("sudah terdaftar") || 
            error.message.includes("sudah kedaluwarsa")) {
          return {
            success: false,
            error: error.message,
            statusCode: 409, // Conflict
          };
        }

        if (error.message.includes("wajib")) {
          return {
            success: false,
            error: error.message,
            statusCode: 400,
          };
        }
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat membuat transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get transporters with filtering and pagination
   */
  static async getTransporters(query: unknown) {
    try {
      // Validate query parameters
      const validated = listTransporterQuerySchema.parse(query);

      // Build filter
      const filter: TransporterFilter = {
        query: validated.query,
        type: validated.type,
        pkpStatus: validated.pkpStatus,
        status: validated.status,
        city: validated.city,
        province: validated.province,
        commodity: validated.commodity,
      };

      // Build pagination
      const pagination: TransporterPagination = {
        page: validated.page,
        pageSize: validated.pageSize,
        sortBy: validated.sortBy,
        sortOrder: validated.sortOrder,
      };

      const { transporters, total } = await TransportService.getTransporters(filter, pagination);

      const totalPages = Math.ceil(total / validated.pageSize);

      return {
        success: true,
        data: transporters,
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
      console.error("Error in getTransporters API:", error);

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
        error: "Terjadi kesalahan saat mengambil data transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get transporter by ID
   */
  static async getTransporterById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID transportir tidak valid",
          statusCode: 400,
        };
      }

      const transporter = await TransportService.getTransporterById(id);

      if (!transporter) {
        return {
          success: false,
          error: "Transportir tidak ditemukan",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: transporter,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getTransporterById API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil data transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Update transporter
   */
  static async updateTransporter(id: string, data: unknown) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID transportir tidak valid",
          statusCode: 400,
        };
      }

      // Validate input
      const validatedData = updateTransporterSchema.parse(data);

      // Update transporter
      const transporter = await TransportService.updateTransporter(id, validatedData);

      return {
        success: true,
        data: transporter,
        message: "Transportir berhasil diperbarui",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in updateTransporter API:", error);

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

        if (error.message.includes("wajib")) {
          return {
            success: false,
            error: error.message,
            statusCode: 400,
          };
        }
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat memperbarui transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete transporter (soft delete)
   */
  static async deleteTransporter(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID transportir tidak valid",
          statusCode: 400,
        };
      }

      const transporter = await TransportService.deleteTransporter(id);

      return {
        success: true,
        data: transporter,
        message: "Transportir berhasil dinonaktifkan",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in deleteTransporter API:", error);

      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return {
          success: false,
          error: error.message,
          statusCode: 404,
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat menghapus transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Toggle transporter status (AKTIF <-> NONAKTIF)
   */
  static async toggleTransporterStatus(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID transportir tidak valid",
          statusCode: 400,
        };
      }

      const transporter = await TransportService.toggleTransporterStatus(id);

      const message = transporter.status === "AKTIF" 
        ? "Transportir berhasil diaktifkan"
        : "Transportir berhasil dinonaktifkan";

      return {
        success: true,
        data: transporter,
        message,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in toggleTransporterStatus API:", error);

      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return {
          success: false,
          error: error.message,
          statusCode: 404,
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat mengubah status transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Hard delete transporter (permanent deletion)
   */
  static async hardDeleteTransporter(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID transportir tidak valid",
          statusCode: 400,
        };
      }

      const result = await TransportService.hardDeleteTransporter(id);

      return {
        success: true,
        data: result,
        message: "Transportir berhasil dihapus permanen",
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in hardDeleteTransporter API:", error);

      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return {
          success: false,
          error: error.message,
          statusCode: 404,
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat menghapus transportir",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get transporter statistics
   */
  static async getStatistics() {
    try {
      const stats = await TransportService.getStatistics();

      return {
        success: true,
        data: stats,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getStatistics API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil statistik",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      };
    }
  }
}

