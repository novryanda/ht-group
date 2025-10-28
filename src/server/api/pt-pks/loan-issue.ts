import { z } from "zod";
import { LoanIssueService } from "~/server/services/pt-pks/loan-issue.service";
import type {
  CreateWarehouseOutboundDTO,
  LoanReturnDTO,
  WarehouseTransactionQuery,
} from "~/server/types/pt-pks/warehouse-transaction";

// Validation schemas
const createLoanIssueSchema = z.object({
  date: z.string(),
  warehouseId: z.string(),
  targetDept: z.string(),
  pickerName: z.string().optional(),
  loanReceiver: z.string(),
  expectedReturnAt: z.string().optional(),
  loanNotes: z.string().optional(),
  note: z.string().optional(),
  expenseAccountId: z.string().optional(),
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

const loanReturnSchema = z.object({
  loanIssueId: z.string(),
  date: z.string(),
  warehouseId: z.string(),
  note: z.string().optional(),
  lines: z.array(
    z.object({
      loanIssueLineId: z.string(),
      itemId: z.string(),
      qtyReturned: z.number().positive(),
      note: z.string().optional(),
    })
  ).min(1),
});

const fullLoanReturnSchema = z.object({
  returnedAt: z.string(),
  returnNote: z.string().optional(),
});

export class LoanIssueAPI {
  /**
   * List loan issues
   */
  static async list(query: WarehouseTransactionQuery, companyId: string) {
    try {
      const result = await LoanIssueService.list(query, companyId);
      return {
        success: true,
        data: result,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list loan issues",
        statusCode: 500,
      };
    }
  }

  /**
   * Get loan issue by ID
   */
  static async getById(id: string) {
    try {
      const result = await LoanIssueService.getById(id);
      if (!result) {
        return {
          success: false,
          error: "Loan issue not found",
          statusCode: 404,
        };
      }
      return {
        success: true,
        data: result,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get loan issue",
        statusCode: 500,
      };
    }
  }

  /**
   * Get active loans
   */
  static async getActiveLoans(warehouseId?: string) {
    try {
      const result = await LoanIssueService.getActiveLoans(warehouseId);
      return {
        success: true,
        data: result,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get active loans",
        statusCode: 500,
      };
    }
  }

  /**
   * Create loan issue
   */
  static async create(data: unknown, createdById: string) {
    try {
      const validatedData = createLoanIssueSchema.parse(data) as CreateWarehouseOutboundDTO;
      validatedData.purpose = "LOAN";
      
      const result = await LoanIssueService.create(validatedData, createdById);
      return {
        success: true,
        data: result,
        statusCode: 201,
      };
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
        error: error instanceof Error ? error.message : "Failed to create loan issue",
        statusCode: 500,
      };
    }
  }

  /**
   * Process loan return
   */
  static async processReturn(data: unknown, createdById: string) {
    try {
      const validatedData = loanReturnSchema.parse(data) as LoanReturnDTO;
      const result = await LoanIssueService.processReturn(validatedData, createdById);
      return {
        success: true,
        data: result,
        statusCode: 200,
      };
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
        error: error instanceof Error ? error.message : "Failed to process return",
        statusCode: 500,
      };
    }
  }

  /**
   * Process full loan return (return all items)
   */
  static async processFullReturn(loanIssueId: string, data: unknown, createdById: string) {
    try {
      const validatedData = fullLoanReturnSchema.parse(data);

      // Get loan issue details
      const loanIssue = await LoanIssueService.getById(loanIssueId);
      if (!loanIssue) {
        return {
          success: false,
          error: "Loan issue not found",
          statusCode: 404,
        };
      }

      // Prepare return data for all lines
      const returnData: LoanReturnDTO = {
        loanIssueId,
        date: validatedData.returnedAt,
        warehouseId: loanIssue.warehouseId,
        note: validatedData.returnNote,
        lines: loanIssue.lines.map((line: any) => ({
          loanIssueLineId: line.id,
          itemId: line.itemId,
          qtyReturned: Number(line.qty) - Number(line.qtyReturned || 0), // Return remaining qty
          note: validatedData.returnNote,
        })),
      };

      const result = await LoanIssueService.processReturn(returnData, createdById);
      return {
        success: true,
        data: result,
        statusCode: 200,
      };
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
        error: error instanceof Error ? error.message : "Failed to process full return",
        statusCode: 500,
      };
    }
  }
}
