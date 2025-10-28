import { z } from "zod";
import { GoodsIssueService } from "~/server/services/pt-pks/goods-issue.service";
import type { CreateWarehouseOutboundDTO } from "~/server/types/pt-pks/warehouse-transaction";

const createGoodsIssueSchema = z.object({
  date: z.string(),
  warehouseId: z.string(),
  purpose: z.enum(["ISSUE", "PROD", "SCRAP"]),
  targetDept: z.string(),
  pickerName: z.string().optional(),
  note: z.string().optional(),
  expenseAccountId: z.string(),
  costCenter: z.string().optional(),
  lines: z.array(
    z.object({
      itemId: z.string(),
      unitId: z.string(),
      qty: z.number().positive(),
      note: z.string().optional(),
    })
  ).min(1),
});

export class GoodsIssueAPI {
  static async list(query: any, companyId: string) {
    try {
      const result = await GoodsIssueService.list(query, companyId);
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list goods issues",
        statusCode: 500,
      };
    }
  }

  static async getById(id: string) {
    try {
      const result = await GoodsIssueService.getById(id);
      if (!result) {
        return { success: false, error: "Goods issue not found", statusCode: 404 };
      }
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get goods issue",
        statusCode: 500,
      };
    }
  }

  static async create(data: unknown, createdById: string) {
    try {
      const validatedData = createGoodsIssueSchema.parse(data) as CreateWarehouseOutboundDTO;
      const result = await GoodsIssueService.create(validatedData, createdById);
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
        error: error instanceof Error ? error.message : "Failed to create goods issue",
        statusCode: 500,
      };
    }
  }

  static async delete(id: string) {
    try {
      await GoodsIssueService.delete(id);
      return { success: true, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete goods issue",
        statusCode: 500,
      };
    }
  }
}
