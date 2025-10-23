import type { Account } from "@prisma/client";
import type { AccountDTO } from "~/server/types/pt-pks/account";

export function mapAccountToDTO(a: Account & { children?: Account[] }): AccountDTO {
  return {
    id: a.id,
    companyId: a.companyId,
    code: a.code,
    name: a.name,
    class: a.class,
    normalSide: a.normalSide,
    isPosting: a.isPosting,
    isCashBank: a.isCashBank,
    taxCode: a.taxCode,
    currency: a.currency,
    description: a.description,
    status: a.status,
    parentId: a.parentId,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    children: a.children?.map((c: Account) => mapAccountToDTO(c)) ?? [],
  };
}
