import { z } from "zod";

export const fiscalPeriodCreateSchema = z
  .object({
    companyId: z.string().cuid(),
    year: z.number().int().min(1900).max(2200),
    month: z.number().int().min(1).max(12),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "startDate harus lebih kecil atau sama dengan endDate",
    path: ["endDate"],
  });

export const fiscalPeriodUpdateSchema = z
  .object({
    id: z.string().cuid(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isClosed: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: "startDate harus lebih kecil atau sama dengan endDate",
      path: ["endDate"],
    },
  );

export const fiscalPeriodListSchema = z.object({
  companyId: z.string().cuid(),
  year: z.coerce.number().int().optional(),
  isClosed: z.coerce.boolean().optional(),
});
