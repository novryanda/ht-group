import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const fiscalPeriodRepo = {
  async findMany(params: { companyId: string; year?: number; isClosed?: boolean }) {
    const { companyId, year, isClosed } = params;

    return db.fiscalPeriod.findMany({
      where: {
        companyId,
        ...(typeof year === "number" ? { year } : {}),
        ...(typeof isClosed === "boolean" ? { isClosed } : {}),
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });
  },

  async findById(id: string) {
    return db.fiscalPeriod.findUnique({ where: { id } });
  },

  async create(data: Prisma.FiscalPeriodCreateInput) {
    return db.fiscalPeriod.create({ data });
  },

  async update(id: string, data: Prisma.FiscalPeriodUpdateInput) {
    return db.fiscalPeriod.update({ where: { id }, data });
  },

  async delete(id: string) {
    return db.fiscalPeriod.delete({ where: { id } });
  },
};
