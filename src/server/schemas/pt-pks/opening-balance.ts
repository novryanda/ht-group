import { z } from "zod";

export const openingBalanceListSchema = z.object({
  companyId: z.string().cuid(),
  periodId: z.string().cuid(),
});

export const openingBalanceUpsertSchema = z.object({
  companyId: z.string().cuid(),
  periodId: z.string().cuid(),
  entries: z
    .array(
      z.object({
        accountId: z.string().cuid(),
        debit: z
          .union([z.string(), z.number()])
          .transform((val) => Number(val ?? 0))
          .refine((num) => Number.isFinite(num) && num >= 0, "Debit harus berupa angka >= 0"),
        credit: z
          .union([z.string(), z.number()])
          .transform((val) => Number(val ?? 0))
          .refine((num) => Number.isFinite(num) && num >= 0, "Credit harus berupa angka >= 0"),
      }),
    )
    .optional()
    .default([]),
});
