import { z } from "zod";
import { GoodsReceiptService } from "~/server/services/pt-pks/goods-receipt.service";
import type { CreateWarehouseInboundDTO, CreateNewItemInboundDTO } from "~/server/types/pt-pks/warehouse-transaction";

const createGoodsReceiptSchema = z.object({
  date: z.string(),
  warehouseId: z.string(),
  sourceType: z.enum(["PURCHASE", "RETURN", "PRODUCTION", "OTHER", "LOAN_RETURN", "NEW_ITEM"]),
  sourceRef: z.string().optional(),
  loanIssueId: z.string().optional(),
  note: z.string().optional(),
  lines: z.array(
    z.object({
      itemId: z.string(),
      unitId: z.string(),
      qty: z.number().positive(),
      unitCost: z.number().optional(),
      note: z.string().optional(),
      loanIssueLineId: z.string().optional(),
    })
  ).min(1),
});

export class GoodsReceiptAPI {
  static async list(query: any, companyId: string) {
    try {
      const result = await GoodsReceiptService.list(query, companyId);
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list goods receipts",
        statusCode: 500,
      };
    }
  }

  static async getById(id: string) {
    try {
      const result = await GoodsReceiptService.getById(id);
      if (!result) {
        return { success: false, error: "Goods receipt not found", statusCode: 404 };
      }
      return { success: true, data: result, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get goods receipt",
        statusCode: 500,
      };
    }
  }

  static async create(data: unknown, createdById: string) {
    try {
      const validatedData = createGoodsReceiptSchema.parse(data) as CreateWarehouseInboundDTO;
      const result = await GoodsReceiptService.create(validatedData, createdById);
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
        error: error instanceof Error ? error.message : "Failed to create goods receipt",
        statusCode: 500,
      };
    }
  }

  static async delete(id: string) {
    try {
      await GoodsReceiptService.delete(id);
      return { success: true, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete goods receipt",
        statusCode: 500,
      };
    }
  }
}
