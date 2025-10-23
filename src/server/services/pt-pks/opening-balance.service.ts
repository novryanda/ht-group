import { Prisma } from "@prisma/client";

import { accountRepo } from "~/server/repositories/pt-pks/account.repo";
import { openingBalanceRepo } from "~/server/repositories/pt-pks/opening-balance.repo";
import { fiscalPeriodRepo } from "~/server/repositories/pt-pks/fiscal-period.repo";
import { mapOpeningBalanceToDTO } from "~/server/mappers/pt-pks/opening-balance.mapper";
import type {
  OpeningBalanceEntryDTO,
  OpeningBalanceListParams,
  OpeningBalanceUpsertInput,
} from "~/server/types/pt-pks/opening-balance";

export const openingBalanceService = {
  async list(params: OpeningBalanceListParams): Promise<OpeningBalanceEntryDTO[]> {
    const [accounts, balances] = await Promise.all([
      accountRepo.findAll(params.companyId),
      openingBalanceRepo.findByPeriod(params.companyId, params.periodId),
    ]);

    const balanceMap = new Map<string, (typeof balances)[number]>();
    balances.forEach((item) => balanceMap.set(item.accountId, item));

    return accounts
      .filter((account) => account.isPosting)
      .map((account) => {
        const entry = balanceMap.get(account.id);
        if (entry) {
          return mapOpeningBalanceToDTO(entry);
        }
        return {
          id: null,
          companyId: params.companyId,
          periodId: params.periodId,
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          class: account.class,
          normalSide: account.normalSide,
          isPosting: account.isPosting,
          debit: "0",
          credit: "0",
          updatedAt: null,
        };
      });
  },

  async upsert(input: OpeningBalanceUpsertInput) {
    const period = await fiscalPeriodRepo.findById(input.periodId);
    if (!period || period.companyId !== input.companyId) {
      throw new Error("Periode fiskal tidak ditemukan");
    }
    if (period.isClosed) {
      throw new Error("Periode sudah ditutup, saldo awal tidak dapat diubah");
    }

    const items = input.entries.map((entry) => ({
      accountId: entry.accountId,
      debit: new Prisma.Decimal(entry.debit),
      credit: new Prisma.Decimal(entry.credit),
    }));

    await openingBalanceRepo.upsertMany(input.companyId, input.periodId, items);

    return this.list({ companyId: input.companyId, periodId: input.periodId });
  },
};
