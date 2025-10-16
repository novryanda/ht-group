import { type Buyer, type BuyerContact, type BuyerDoc, BuyerType, PkpStatus, BuyerStatus } from "@prisma/client";

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface BuyerContactDTO {
  name: string;
  role?: string;
  email: string;
  phone: string;
  isBilling?: boolean;
}

export interface BuyerDocDTO {
  kind: string;
  fileUrl: string;
  fileName: string;
}

export interface CreateBuyerDTO {
  type: BuyerType;
  legalName: string;
  tradeName?: string;
  npwp?: string;
  pkpStatus: PkpStatus;
  addressLine: string;
  city: string;
  province: string;
  postalCode?: string;
  billingEmail: string;
  phone: string;
  destinationName: string;
  destinationAddr: string;
  contacts: BuyerContactDTO[];
  docs?: BuyerDocDTO[];
}

export interface UpdateBuyerDTO {
  type?: BuyerType;
  legalName?: string;
  tradeName?: string;
  npwp?: string;
  pkpStatus?: PkpStatus;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  billingEmail?: string;
  phone?: string;
  destinationName?: string;
  destinationAddr?: string;
  status?: BuyerStatus;
  contacts?: BuyerContactDTO[];
  docs?: BuyerDocDTO[];
}

export interface BuyerWithRelations extends Buyer {
  contacts: BuyerContact[];
  docs: BuyerDoc[];
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface BuyerFilter {
  query?: string; // Search by code, legalName, tradeName, npwp
  type?: BuyerType;
  pkpStatus?: PkpStatus;
  status?: BuyerStatus;
  city?: string;
  province?: string;
}

export interface BuyerPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BuyerListResult {
  buyers: BuyerWithRelations[];
  total: number;
}

// ============================================================================
// Duplicate Check Types
// ============================================================================

export interface DuplicateCheckParams {
  npwp?: string;
  legalName?: string;
  city?: string;
  province?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicates: BuyerWithRelations[];
  message?: string;
}

// ============================================================================
// Re-export Prisma enums for convenience
// ============================================================================

export { BuyerType, PkpStatus, BuyerStatus };

