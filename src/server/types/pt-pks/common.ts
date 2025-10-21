/**
 * Common Types & Utilities
 * Shared types across the application
 */

// ============================================================================
// PAGINATION TYPES
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
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
  statusCode: number;
  pagination?: Pagination;
}

// ============================================================================
// QUERY & FILTER TYPES
// ============================================================================

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAPIResponse<T>(value: unknown): value is APIResponse<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as APIResponse).success === "boolean"
  );
}

export function isPaginatedResult<T>(value: unknown): value is PaginatedResult<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "pagination" in value &&
    Array.isArray((value as PaginatedResult<T>).data)
  );
}

