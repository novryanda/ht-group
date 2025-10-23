import { z } from "zod";

import {
  fiscalPeriodCreateSchema,
  fiscalPeriodListSchema,
  fiscalPeriodUpdateSchema,
} from "~/server/schemas/pt-pks/fiscal-period";
import { fiscalPeriodService } from "~/server/services/pt-pks/fiscal-period.service";

export const FiscalPeriodAPI = {
  async list(query: unknown) {
    try {
      const params = fiscalPeriodListSchema.parse(query);
      const data = await fiscalPeriodService.list(params);
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Parameter tidak valid", details: error.flatten(), statusCode: 400 };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memuat periode fiskal",
        statusCode: 500,
      };
    }
  },

  async create(body: unknown) {
    try {
      const payload = fiscalPeriodCreateSchema.parse(body);
      const data = await fiscalPeriodService.create(payload);
      return { success: true, data, statusCode: 201 };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Data tidak valid", details: error.flatten(), statusCode: 400 };
      }
      if (error?.code === "P2002" || (error instanceof Error && error.message.includes("Unique constraint"))) {
        return { success: false, error: "Periode fiskal sudah ada", statusCode: 409 };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat periode fiskal",
        statusCode: 500,
      };
    }
  },

  async update(body: unknown) {
    try {
      const payload = fiscalPeriodUpdateSchema.parse(body);
      const data = await fiscalPeriodService.update(payload);
      return { success: true, data, statusCode: 200 };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: "Data tidak valid", details: error.flatten(), statusCode: 400 };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memperbarui periode fiskal",
        statusCode: 500,
      };
    }
  },

  async delete(id: string) {
    try {
      if (!id) {
        return { success: false, error: "ID tidak valid", statusCode: 400 };
      }
      await fiscalPeriodService.delete(id);
      return { success: true, statusCode: 200 };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus periode fiskal",
        statusCode: 500,
      };
    }
  },
};
