export type FiscalPeriodDTO = {
  id: string;
  companyId: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FiscalPeriodCreateInput = {
  companyId: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
};

export type FiscalPeriodUpdateInput = {
  id: string;
  startDate?: string;
  endDate?: string;
  isClosed?: boolean;
};

export type FiscalPeriodListParams = {
  companyId: string;
  year?: number;
  isClosed?: boolean;
};
