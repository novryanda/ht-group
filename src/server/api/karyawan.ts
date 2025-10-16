import { z } from "zod";
import { KaryawanService } from "~/server/services/karyawan.service";
import {
  EmployeeListQuerySchema,
  EmployeeCreateSchema,
  EmployeeUpdateSchema,
  EmployeeFamilyCreateSchema,
} from "~/server/schemas/karyawan";
import type {
  EmployeeListItemDTO,
  EmployeeFamilyDTO,
  EmployeeDTO,
  Pagination,
} from "~/server/types/karyawan";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// ============================================================================
// KARYAWAN API MODULE
// ============================================================================

export class KaryawanAPI {
  /**
   * Get list of employees with pagination, search, and filters
   */
  static async listKaryawan(
    query: unknown
  ): Promise<APIResponse<{ items: EmployeeListItemDTO[]; pagination: Pagination }>> {
    try {
      // Validate query parameters
      console.log("🔍 listKaryawan - Raw query:", query);
      const validatedQuery = EmployeeListQuerySchema.parse(query);
      console.log("✅ listKaryawan - Validated query:", validatedQuery);

      // Call service
      const result = await KaryawanService.getEmployeeList(validatedQuery);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: 500,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Zod validation error in listKaryawan:", error.errors);
        return {
          success: false,
          error: "Invalid query parameters: " + JSON.stringify(error.errors),
          statusCode: 400,
        };
      }

      console.error("❌ Error in listKaryawan:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get employee detail with families
   */
  static async getKaryawanWithFamily(
    id: string
  ): Promise<APIResponse<{ employee: EmployeeDTO; families: EmployeeFamilyDTO[] }>> {
    try {
      const result = await KaryawanService.getEmployeeDetail(id);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: result.code === "NOT_FOUND" ? 404 : 500,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getKaryawanWithFamily:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get families by employee ID
   */
  static async getFamily(employeeId: string): Promise<APIResponse<EmployeeFamilyDTO[]>> {
    try {
      const result = await KaryawanService.getFamilies(employeeId);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: result.code === "NOT_FOUND" ? 404 : 500,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in getFamily:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Add family member
   */
  static async addFamily(
    employeeId: string,
    data: unknown
  ): Promise<APIResponse<EmployeeFamilyDTO>> {
    try {
      // Validate input
      const validatedData = EmployeeFamilyCreateSchema.parse(data);

      // Call service
      const result = await KaryawanService.addFamily(employeeId, validatedData);

      if (!result.success) {
        let statusCode = 500;
        if (result.code === "NOT_FOUND") {
          statusCode = 404;
        } else if (result.code === "ISTRI_ALREADY_EXISTS") {
          statusCode = 409; // Conflict
        }

        return {
          success: false,
          error: result.error,
          statusCode,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          statusCode: 400,
        };
      }

      console.error("Error in addFamily:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Create new employee
   */
  static async createKaryawan(data: unknown): Promise<APIResponse<EmployeeDTO>> {
    try {
      // Validate input
      const validatedData = EmployeeCreateSchema.parse(data);

      // Call service
      const result = await KaryawanService.createKaryawan(validatedData);

      if (!result.success) {
        let statusCode = 500;
        if (result.code === "NIK_ALREADY_EXISTS") {
          statusCode = 409; // Conflict
        }

        return {
          success: false,
          error: result.error,
          statusCode,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          statusCode: 400,
        };
      }

      console.error("Error in createKaryawan:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Update employee
   */
  static async updateKaryawan(id: string, data: unknown): Promise<APIResponse<EmployeeDTO>> {
    try {
      // Validate input
      const validatedData = EmployeeUpdateSchema.parse(data);

      // Call service
      const result = await KaryawanService.updateEmployee(id, validatedData);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: result.code === "NOT_FOUND" ? 404 : 500,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          statusCode: 400,
        };
      }

      console.error("Error in updateKaryawan:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete employee
   */
  static async deleteKaryawan(id: string): Promise<APIResponse<{ id: string }>> {
    try {
      const result = await KaryawanService.deleteEmployee(id);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          statusCode: result.code === "NOT_FOUND" ? 404 : 500,
        };
      }

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error in deleteKaryawan:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }
}

