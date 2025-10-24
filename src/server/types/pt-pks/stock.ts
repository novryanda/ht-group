// Stock-related DTOs untuk Material Inventory

export interface StockBalanceDTO {
  warehouseId: string;
  warehouseName: string;
  binId: string | null;
  binName: string | null;
  qtyOnHand: number;
  avgCost: number;
}

export interface StockLedgerEntryDTO {
  id: string;
  ts: Date;
  warehouseName: string;
  binName: string | null;
  referenceType: string;
  referenceId: string;
  qtyDelta: number;
  unitCost: number | null;
  note: string | null;
}

export interface InitialStockDTO {
  warehouseId: string;
  binId?: string;
  quantity: number;
  unitCost: number;
}

export interface StockValidationResult {
  available: boolean;
  currentQty: number;
}