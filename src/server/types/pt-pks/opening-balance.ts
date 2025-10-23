export type OpeningBalanceEntryDTO = {
  id: string | null;
  companyId: string;
  periodId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  class: string;
  normalSide: string;
  isPosting: boolean;
  debit: string;
  credit: string;
  updatedAt: string | null;
};

export type OpeningBalanceListParams = {
  companyId: string;
  periodId: string;
};

export type OpeningBalanceUpsertInput = {
  companyId: string;
  periodId: string;
  entries: Array<{
    accountId: string;
    debit: string | number;
    credit: string | number;
  }>;
};
