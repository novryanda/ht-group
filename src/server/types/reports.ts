/**
 * Reports Module - Types & DTOs
 * Monthly aggregation reports for PB Import & Inventory
 */

// ============================================================================
// PAGINATION & COMMON TYPES
// ============================================================================

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================================================
// PB IMPORT MONTHLY REPORT TYPES
// ============================================================================

export interface PbImportMonthlySummary {
  count: number;
  totalTerimaKg: number;
  totalPotKg: number;
  totalNettoKg: number;
  avgPrice: number;
  totalPayment: number;
  totalPph: number;
}

export interface PbImportDailyBreakdown {
  date: string;
  count: number;
  totalTerimaKg: number;
  totalNettoKg: number;
  totalPayment: number;
}

export interface PbImportSupplierBreakdown {
  supplierId: string;
  supplierName: string;
  count: number;
  totalTerimaKg: number;
  totalNettoKg: number;
  totalPayment: number;
}

// ============================================================================
// INVENTORY MONTHLY REPORT TYPES
// ============================================================================

export interface InventoryMonthlySummary {
  grn: number;
  issue: number;
  transfer: number;
  adjustment: number;
  count: number;
}

export interface InventoryDocumentBreakdown {
  date: string;
  grn: number;
  issue: number;
  transfer: number;
  adjustment: number;
  count: number;
}

export interface InventoryMaterialBreakdown {
  materialId: string;
  materialName: string;
  categoryName: string;
  totalIn: number;
  totalOut: number;
  netChange: number;
}

// ============================================================================
// MONTHLY REPORT REQUEST/RESPONSE TYPES
// ============================================================================

export interface MonthlyReportRequest {
  companyCode?: string;
  month?: string; // Format: YYYY-MM
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  includeBreakdown?: boolean;
}

export interface MonthlyReportResponse {
  period: {
    start: Date;
    end: Date;
  };
  companyCode?: string;
  pbSummary: PbImportMonthlySummary;
  inventorySummary: InventoryMonthlySummary;
  pbDailyBreakdown?: PbImportDailyBreakdown[];
  pbSupplierBreakdown?: PbImportSupplierBreakdown[];
  inventoryDailyBreakdown?: InventoryDocumentBreakdown[];
  inventoryMaterialBreakdown?: InventoryMaterialBreakdown[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ReportAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

