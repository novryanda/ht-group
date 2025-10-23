import { db } from "~/server/db";
import type { Prisma } from "@prisma/client";

export const openingBalanceRepo = {
  async findByPeriod(companyId: string, periodId: string) {
    return db.openingBalance.findMany({
      where: { companyId, periodId },
      include: {
        account: {
          select: {
            id: true,
            code: true,
            name: true,
            class: true,
            normalSide: true,
            isPosting: true,
            status: true,
          },
        },
      },
      orderBy: [
        { account: { code: "asc" } },
      ],
    });
  },

  async upsertMany(companyId: string, periodId: string, items: Array<{ accountId: string; debit: Prisma.Decimal | number; credit: Prisma.Decimal | number }>) {
    await db.$transaction(async (tx) => {
      for (const item of items) {
        await tx.openingBalance.upsert({
          where: {
            companyId_periodId_accountId: {
              companyId,
              periodId,
              accountId: item.accountId,
            },
          },
          create: {
            companyId,
            periodId,
            accountId: item.accountId,
            debit: item.debit,
            credit: item.credit,
          },
          update: {
            debit: item.debit,
            credit: item.credit,
          },
        });
      }
    });

    return true;
  },
};
