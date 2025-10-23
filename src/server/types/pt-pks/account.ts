export type AccountDTO = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  class: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "COGS" | "EXPENSE" | "OTHER_INCOME" | "OTHER_EXPENSE";
  normalSide: "DEBIT" | "CREDIT";
  isPosting: boolean;
  isCashBank: boolean;
  taxCode: "NON_TAX" | "PPN_MASUKAN" | "PPN_KELUARAN" | "PPH21" | "PPH22" | "PPH23";
  currency?: string | null;
  description?: string | null;
  status: "AKTIF" | "NONAKTIF";
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: AccountDTO[];
};

export type AccountCreateInput = Omit<AccountDTO, "id" | "createdAt" | "updatedAt" | "children">;
export type AccountUpdateInput = Partial<Omit<AccountDTO, "id" | "companyId" | "createdAt" | "updatedAt" | "children">> & { id: string };

export type SystemAccountMapSetInput = {
  companyId: string;
  mappings: {
    key:
      | "TBS_PURCHASE"
      | "INVENTORY_TBS"
      | "AP_SUPPLIER_TBS"
      | "UNLOADING_EXPENSE_SPTI"
      | "UNLOADING_EXPENSE_SPLO"
      | "SALES_CPO"
      | "SALES_KERNEL"
      | "INVENTORY_CPO"
      | "INVENTORY_KERNEL"
      | "COGS_CPO"
      | "COGS_KERNEL"
      | "CASH_DEFAULT"
      | "BANK_DEFAULT"
      | "PPN_KELUARAN"
      | "PPN_MASUKAN"
      | "PPH22_DEFAULT"
      | "PPH23_DEFAULT";
    accountId: string;
  }[];
};

export type AccountListParams = {
  companyId: string;
  tree?: boolean;
  search?: string;
  classes?: string[];
  status?: "AKTIF" | "NONAKTIF";
  page: number;
  pageSize: number;
};

export type AccountListResponse = {
  items: AccountDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
