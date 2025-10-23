import type { Account, OpeningBalance } from "@prisma/client";
import type { OpeningBalanceEntryDTO } from "~/server/types/pt-pks/opening-balance";

export function mapOpeningBalanceToDTO(
  entry: (OpeningBalance & { account: Pick<Account, "id" | "code" | "name" | "class" | "normalSide" | "isPosting" | "status"> }) | null,
): OpeningBalanceEntryDTO {
  if (!entry) {
    throw new Error("Opening balance entry is required");
  }

  return {
    id: entry.id,
    companyId: entry.companyId,
    periodId: entry.periodId,
    accountId: entry.account.id,
    accountCode: entry.account.code,
    accountName: entry.account.name,
    class: entry.account.class,
    normalSide: entry.account.normalSide,
    isPosting: entry.account.isPosting,
    debit: entry.debit.toString(),
    credit: entry.credit.toString(),
    updatedAt: entry.updatedAt?.toISOString() ?? null,
  };
}
