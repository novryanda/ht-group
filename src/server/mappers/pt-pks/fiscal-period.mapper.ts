import type { FiscalPeriod } from "@prisma/client";
import type { FiscalPeriodDTO } from "~/server/types/pt-pks/fiscal-period";

export function mapFiscalPeriodToDTO(period: FiscalPeriod): FiscalPeriodDTO {
  return {
    id: period.id,
    companyId: period.companyId,
    year: period.year,
    month: period.month,
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    isClosed: period.isClosed,
    createdAt: period.createdAt.toISOString(),
    updatedAt: period.updatedAt.toISOString(),
  };
}
