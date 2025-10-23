import type { Account, Prisma } from "@prisma/client";

import {
  accountRepo,
  type AccountImportRow,
} from "~/server/repositories/pt-pks/account.repo";
import type {
  AccountCreateInput,
  AccountUpdateInput,
} from "~/server/schemas/pt-pks/account";

export const accountService = {
  async create(input: AccountCreateInput) {
    // Headers (isPosting = false) can host children; posting accounts cannot have sub-accounts.
    const data: Prisma.AccountCreateInput = {
      company: { connect: { id: input.companyId } },
      code: input.code,
      name: input.name,
      class: input.class,
      normalSide: input.normalSide,
      isPosting: input.isPosting,
      isCashBank: input.isCashBank,
      taxCode: input.taxCode,
      currency: input.currency ?? null,
      description: input.description ?? null,
      status: input.status,
      ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {}),
    };

    return accountRepo.create(data);
  },

  async update(input: AccountUpdateInput) {
    const { id, ...rest } = input;

    const data: Prisma.AccountUpdateInput = {
      ...(rest.code !== undefined ? { code: rest.code } : {}),
      ...(rest.name !== undefined ? { name: rest.name } : {}),
      ...(rest.class !== undefined ? { class: rest.class } : {}),
      ...(rest.normalSide !== undefined ? { normalSide: rest.normalSide } : {}),
      ...(rest.isPosting !== undefined ? { isPosting: rest.isPosting } : {}),
      ...(rest.isCashBank !== undefined ? { isCashBank: rest.isCashBank } : {}),
      ...(rest.taxCode !== undefined ? { taxCode: rest.taxCode } : {}),
      ...(rest.currency !== undefined ? { currency: rest.currency ?? null } : {}),
      ...(rest.description !== undefined ? { description: rest.description ?? null } : {}),
      ...(rest.status !== undefined ? { status: rest.status } : {}),
      ...(rest.parentId !== undefined
        ? rest.parentId
          ? { parent: { connect: { id: rest.parentId } } }
          : { parent: { disconnect: true } }
        : {}),
    };

    return accountRepo.update(id, data);
  },

  async delete(id: string) {
    return accountRepo.delete(id);
  },

  async listPaged(query: {
    companyId: string;
    search?: string;
    status?: string;
    classes?: string[];
    page: number;
    pageSize: number;
  }) {
    return accountRepo.findPaged(query);
  },

  async listAll(companyId: string) {
    return accountRepo.findAll(companyId);
  },

  async tree(companyId: string) {
    const flatAccounts = await accountRepo.findAll(companyId);
    const nodeMap = new Map<string, Account & { children: Account[] }>();

    for (const account of flatAccounts) {
      nodeMap.set(account.id, { ...account, children: [] });
    }

    const roots: (Account & { children: Account[] })[] = [];

    for (const account of flatAccounts) {
      const node = nodeMap.get(account.id);
      if (!node) continue;

      if (account.parentId) {
        const parentNode = nodeMap.get(account.parentId);
        if (parentNode) {
          parentNode.children.push(node);
          continue;
        }
      }

      roots.push(node);
    }

    const sortNodes = (nodes: (Account & { children: Account[] })[]) => {
      nodes.sort((a, b) => a.code.localeCompare(b.code));
      nodes.forEach((child) => {
        if (child.children.length > 0) {
          sortNodes(child.children as unknown as (Account & { children: Account[] })[]);
        }
      });
    };

    sortNodes(roots);
    return roots;
  },

  async importMany(rows: AccountImportRow[]) {
    return accountRepo.upsertMany(rows);
  },

  async setSystemMappings(companyId: string, mappings: { key: any; accountId: string }[]) {
    return accountRepo.setSystemMappings(companyId, mappings);
  },

  async getSystemMappings(companyId: string) {
    return accountRepo.getSystemMappings(companyId);
  },
};
