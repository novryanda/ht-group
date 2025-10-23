import { db } from "~/server/db";
import type { Account, Prisma } from "@prisma/client";

export type AccountImportRow = Prisma.AccountCreateManyInput & {
  parentCode?: string | null;
};

export const accountRepo = {
  async create(data: Prisma.AccountCreateInput) {
    return db.account.create({ data });
  },

  async update(id: string, data: Prisma.AccountUpdateInput) {
    return db.account.update({ where: { id }, data });
  },

  async delete(id: string) {
    return db.$transaction(async (tx) => {
      // Cegah delete jika punya children
      const childCount = await tx.account.count({ where: { parentId: id } });
      if (childCount > 0) {
        throw new Error("Akun memiliki sub-akun; hapus/relokasi anak terlebih dahulu.");
      }

      await tx.systemAccountMap.deleteMany({ where: { accountId: id } });

      return tx.account.delete({ where: { id } });
    });
  },

  async findById(id: string) {
    return db.account.findUnique({ where: { id } });
  },

  async findPaged(params: {
    companyId: string;
    search?: string;
    status?: string;
    classes?: string[];
    page: number;
    pageSize: number;
  }) {
    const { companyId, search, status, classes, page, pageSize } = params;
    const where: Prisma.AccountWhereInput = {
      companyId,
      ...(status ? { status: status as any } : {}),
      ...(classes?.length ? { class: { in: classes as any } } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      db.account.findMany({
        where,
        orderBy: [{ code: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.account.count({ where }),
    ]);

    return { items, total };
  },

  async findAll(companyId: string): Promise<Account[]> {
    return db.account.findMany({
      where: { companyId },
      orderBy: [{ code: "asc" }],
    });
  },

  async upsertMany(list: AccountImportRow[]) {
    // gunakan transaksi + upsert by (companyId, code)
    return db.$transaction(async (tx) => {
      const accountIdByCode = new Map<string, string>();

      for (const row of list) {
        const { parentCode, ...rest } = row;

        const account = await tx.account.upsert({
          where: { companyId_code: { companyId: rest.companyId, code: rest.code } },
          create: {
            ...rest,
            isPosting: (rest as any).isPosting ?? true,
            isCashBank: (rest as any).isCashBank ?? false,
            taxCode: (rest.taxCode as any) ?? "NON_TAX",
            currency: rest.currency ?? null,
            description: (rest as any).description ?? null,
            status: (rest as any).status ?? "AKTIF",
          },
          update: {
            name: rest.name,
            class: rest.class as any,
            normalSide: rest.normalSide as any,
            isPosting: (rest as any).isPosting ?? true,
            isCashBank: (rest as any).isCashBank ?? false,
            taxCode: (rest.taxCode as any) ?? "NON_TAX",
            currency: rest.currency ?? null,
            description: (rest as any).description ?? null,
            status: (rest as any).status ?? "AKTIF",
          },
        });

        accountIdByCode.set(`${rest.companyId}:${rest.code}`, account.id);
      }

      for (const row of list) {
        const { parentCode } = row;
        if (!parentCode) continue;
        if (parentCode === row.code) continue;

        const key = `${row.companyId}:${row.code}`;
        const parentKey = `${row.companyId}:${parentCode}`;

        let parentId = accountIdByCode.get(parentKey);

        if (!parentId) {
          const parentAccount = await tx.account.findUnique({
            where: { companyId_code: { companyId: row.companyId, code: parentCode } },
            select: { id: true },
          });
          parentId = parentAccount?.id;
          if (parentId) {
            accountIdByCode.set(parentKey, parentId);
          }
        }

        const childId = accountIdByCode.get(key);
        if (!parentId || !childId) continue;

        await tx.account.update({
          where: { id: childId },
          data: { parent: { connect: { id: parentId } } },
        });
      }

      return true;
    });
  },

  async setSystemMappings(companyId: string, mappings: { key: any; accountId: string }[]) {
    return db.$transaction(async (tx) => {
      for (const m of mappings) {
        await tx.systemAccountMap.upsert({
          where: { companyId_key: { companyId, key: m.key } },
          create: { companyId, key: m.key, accountId: m.accountId },
          update: { accountId: m.accountId },
        });
      }
      return true;
    });
  },

  async getSystemMappings(companyId: string) {
    return db.systemAccountMap.findMany({
      where: { companyId },
      include: { account: true },
    });
  },
};
