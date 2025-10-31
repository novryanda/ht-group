// ============================================
// DIVISI & JABATAN TYPES - PT PKS
// ============================================

// Divisi Types
export interface DivisiDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jabatanCount?: number;
  employeesCount?: number;
}

export interface CreateDivisiDTO {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDivisiDTO {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Jabatan Types
export interface JabatanDTO {
  id: string;
  divisiId: string;
  divisiName?: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employeesCount?: number;
}

export interface CreateJabatanDTO {
  divisiId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateJabatanDTO {
  divisiId?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Common types
export interface ListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

