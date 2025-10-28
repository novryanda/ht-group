import { z } from "zod";
import { ItemRequestService } from "~/server/services/pt-pks/item-request.service";
import type { CreateItemRequestDTO, ApproveItemRequestDTO } from "~/server/types/pt-pks/warehouse-transaction";

const createItemRequestSchema = z.object({
  date: z.string(),
  requestDept: z.string(),
  reason: z.string().optional(),
  relatedFunding: z.string().optional(),
  lines: z.array(
    z.object({
      itemId: z.string(),
      unitId: z.string(),
      qty: z.number().positive(),
    })
  ).min(1),
});

const approveItemRequestSchema = z.object({
  requestId: z.string(),
  approved: z.boolean(),
  note: z.string().optional(),
});

export class ItemRequestAPI {
  static async list(query: any, companyId: string) {
    try {
      const result = await ItemRequestService.list(query, companyId);
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list item requests",
        statusCode: 500,
      };
    }
  }

  static async getById(id: string) {
    try {
      const result = await ItemRequestService.getById(id);
      if (!result) {
        return { success: false, error: "Item request not found", statusCode: 404 };
      }
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get item request",
        statusCode: 500,
      };
    }
  }

  static async create(data: unknown, createdById: string) {
    try {
      const validatedData = createItemRequestSchema.parse(data) as CreateItemRequestDTO;
      const result = await ItemRequestService.create(validatedData, createdById);
      return { success: true, data: result, statusCode: 201 };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Validation error",
          details: error.issues,
          statusCode: 400,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item request",
        statusCode: 500,
      };
    }
  }

  static async submit(id: string) {
    try {
      const result = await ItemRequestService.submit(id);
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit item request",
        statusCode: 500,
      };
    }
  }

  static async approve(data: unknown, approvedById: string) {
    try {
      const validatedData = approveItemRequestSchema.parse(data) as ApproveItemRequestDTO;
      const result = await ItemRequestService.approve(validatedData, approvedById);
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Validation error",
          details: error.issues,
          statusCode: 400,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to approve item request",
        statusCode: 500,
      };
    }
  }

  static async delete(id: string) {
    try {
      await ItemRequestService.delete(id);
      return { success: true, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete item request",
        statusCode: 500,
      };
    }
  }
}
