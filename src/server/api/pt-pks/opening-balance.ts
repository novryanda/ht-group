import { z } from "zod";

import {
  openingBalanceListSchema,
  openingBalanceUpsertSchema,
} from "~/server/schemas/pt-pks/opening-balance";
import { openingBalanceService } from "~/server/services/pt-pks/opening-balance.service";

export const OpeningBalanceAPI = {
  async list(query: unknown) {
    try {
      const params = openingBalanceListSchema.parse(query);
      const data = await openingBalanceService.list(params);
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Parameter tidak valid", details: error.flatten(), statusCode: 400 };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memuat saldo awal",
        statusCode: 500,
      };
    }
  },

  async upsert(body: unknown) {
    try {
      const payload = openingBalanceUpsertSchema.parse(body);
      const data = await openingBalanceService.upsert({
        companyId: payload.companyId,
        periodId: payload.periodId,
        entries: payload.entries.map((entry) => ({
          accountId: entry.accountId,
          debit: entry.debit,
          credit: entry.credit,
        })),
      });
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Data tidak valid", details: error.flatten(), statusCode: 400 };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menyimpan saldo awal",
        statusCode: 500,
      };
    }
  },
};
