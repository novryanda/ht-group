import { z } from "zod";

export const accountCreateSchema = z.object({
  companyId: z.string().cuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  class: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "COGS", "EXPENSE", "OTHER_INCOME", "OTHER_EXPENSE"]),
  normalSide: z.enum(["DEBIT", "CREDIT"]),
  isPosting: z.boolean().default(true),
  isCashBank: z.boolean().default(false),
  taxCode: z.enum(["NON_TAX", "PPN_MASUKAN", "PPN_KELUARAN", "PPH21", "PPH22", "PPH23"]).default("NON_TAX"),
  currency: z.string().max(10).optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  status: z.enum(["AKTIF", "NONAKTIF"]).default("AKTIF"),
  parentId: z.string().cuid().optional().nullable(),
});

export const accountUpdateSchema = accountCreateSchema
  .partial()
  .extend({
    id: z.string().cuid(),
  })
  .refine((d) => !(d.parentId && d.id === d.parentId), {
    message: "parentId tidak boleh sama dengan id",
  });

export const accountQuerySchema = z.object({
  companyId: z.string().cuid(),
  tree: z.coerce.boolean().optional(),
  search: z.string().optional(),
  class: z
    .array(z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "COGS", "EXPENSE", "OTHER_INCOME", "OTHER_EXPENSE"]))
    .optional(),
  status: z.enum(["AKTIF", "NONAKTIF"]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(500).default(50),
});

export const systemAccountMapSetSchema = z.object({
  companyId: z.string().cuid(),
  mappings: z
    .array(
      z.object({
        key: z.enum([
          "TBS_PURCHASE",
          "INVENTORY_TBS",
          "AP_SUPPLIER_TBS",
          "UNLOADING_EXPENSE_SPTI",
          "UNLOADING_EXPENSE_SPLO",
          "SALES_CPO",
          "SALES_KERNEL",
          "INVENTORY_CPO",
          "INVENTORY_KERNEL",
          "COGS_CPO",
          "COGS_KERNEL",
          "CASH_DEFAULT",
          "BANK_DEFAULT",
          "PPN_KELUARAN",
          "PPN_MASUKAN",
          "PPH22_DEFAULT",
          "PPH23_DEFAULT",
        ]),
        accountId: z.string().cuid(),
      })
    )
    .min(1),
});

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type AccountQueryInput = z.infer<typeof accountQuerySchema>;
export type SystemAccountMapSetInput = z.infer<typeof systemAccountMapSetSchema>;
