import { Prisma } from "@prisma/client";

import { fiscalPeriodRepo } from "~/server/repositories/pt-pks/fiscal-period.repo";
import { mapFiscalPeriodToDTO } from "~/server/mappers/pt-pks/fiscal-period.mapper";
import type {
  FiscalPeriodCreateInput,
  FiscalPeriodDTO,
  FiscalPeriodListParams,
  FiscalPeriodUpdateInput,
} from "~/server/types/pt-pks/fiscal-period";

export const fiscalPeriodService = {
  async list(params: FiscalPeriodListParams): Promise<FiscalPeriodDTO[]> {
    const periods = await fiscalPeriodRepo.findMany(params);
    return periods.map(mapFiscalPeriodToDTO);
  },

  async create(input: FiscalPeriodCreateInput): Promise<FiscalPeriodDTO> {
    const data: Prisma.FiscalPeriodCreateInput = {
      company: { connect: { id: input.companyId } },
      year: input.year,
      month: input.month,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
    };

    const created = await fiscalPeriodRepo.create(data);
    return mapFiscalPeriodToDTO(created);
  },

  async update(input: FiscalPeriodUpdateInput): Promise<FiscalPeriodDTO> {
    const period = await fiscalPeriodRepo.findById(input.id);
    if (!period) {
      throw new Error("Periode fiskal tidak ditemukan");
    }

    const data: Prisma.FiscalPeriodUpdateInput = {
      ...(input.startDate ? { startDate: new Date(input.startDate) } : {}),
      ...(input.endDate ? { endDate: new Date(input.endDate) } : {}),
      ...(typeof input.isClosed === "boolean" ? { isClosed: input.isClosed } : {}),
    };

    const updated = await fiscalPeriodRepo.update(input.id, data);
    return mapFiscalPeriodToDTO(updated);
  },

  async delete(id: string) {
    const period = await fiscalPeriodRepo.findById(id);
    if (!period) {
      throw new Error("Periode fiskal tidak ditemukan");
    }
    if (period.isClosed) {
      throw new Error("Periode yang sudah ditutup tidak dapat dihapus");
    }
    await fiscalPeriodRepo.delete(id);
    return true;
  },
};
