import { type SupplierType, type PajakPKP } from "@prisma/client";

// Base Supplier interface
export interface Supplier {
  id: string;
  nomorForm?: string;
  typeSupplier: SupplierType;
  pajakPKP: PajakPKP;

  // IDENTITAS
  namaPemilik: string;
  alamatPemilik?: string;
  hpPemilik?: string;
  namaPerusahaan?: string;
  alamatRampPeron?: string;
  hpPerusahaan?: string;
  bujur?: string;
  lintang?: string;

  // PROFIL KEBUN - JSON field containing tahunTanam, luasKebun, estimasiSupply
  profilKebun?: ProfilKebunData;

  // TIPE PENGELOLAAN
  pengelolaanSwadaya?: string;
  pengelolaanKelompok?: string;
  pengelolaanPerusahaan?: string;
  jenisBibit?: string;
  sertifikasiISPO: boolean;
  sertifikasiRSPO: boolean;

  // PROFIL IZIN USAHA
  aktePendirian?: string;
  aktePerubahan?: string;
  nib?: string;
  siup?: string;
  npwp?: string;

  // PENJUALAN TBS
  penjualanLangsungPKS?: string;
  penjualanAgen?: string;

  // TRANSPORTASI
  transportMilikSendiri?: number;
  transportPihak3?: number;

  // BANK INFORMATION (optional, filled from Surat Pernyataan)
  bankName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Profil Kebun Data - can be either single object or array of objects
export type ProfilKebunData = ProfilKebunItem | ProfilKebunItem[];

// Single profil kebun item
export interface ProfilKebunItem {
  tahunTanam: string;
  luasKebun: number;
  estimasiSupplyTBS: number; // Standardized field name - REQUIRED
  // Additional fields used in forms
  id?: string;
  koordinat?: string;
}

// API Response types
export interface SupplierApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
  code?: string;
  conflicts?: {
    nib?: boolean;
    npwp?: boolean;
  };
}

export interface SupplierListResponse extends SupplierApiResponse<Supplier[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SupplierStatsResponse extends SupplierApiResponse {
  data?: {
    total: number;
    byType: Record<SupplierType, number>;
    withISPO: number;
    withRSPO: number;
  };
}

export interface UniqueCheckResponse extends SupplierApiResponse {
  available?: boolean;
  conflicts?: {
    nib?: boolean;
    npwp?: boolean;
  };
}

// Form types
export interface CreateSupplierForm {
  typeSupplier: SupplierType;
  pajakPKP: PajakPKP;
  nomorForm?: string; // Optional, will be auto-generated if not provided

  // IDENTITAS
  namaPemilik: string;
  alamatPemilik?: string;
  hpPemilik?: string;
  namaPerusahaan?: string;
  alamatRampPeron?: string;
  hpPerusahaan?: string;
  bujur?: string;
  lintang?: string;

  // PROFIL KEBUN - JSON field containing tahunTanam, luasKebun, estimasiSupply
  profilKebun?: ProfilKebunData;

  // TIPE PENGELOLAAN
  pengelolaanSwadaya?: string;
  pengelolaanKelompok?: string;
  pengelolaanPerusahaan?: string;
  jenisBibit?: string;
  sertifikasiISPO?: boolean;
  sertifikasiRSPO?: boolean;

  // PROFIL IZIN USAHA
  aktePendirian?: string;
  aktePerubahan?: string;
  nib?: string;
  siup?: string;
  npwp?: string;

  // PENJUALAN TBS
  penjualanLangsungPKS?: string;
  penjualanAgen?: string;

  // TRANSPORTASI
  transportMilikSendiri?: number;
  transportPihak3?: number;
}

export interface UpdateSupplierForm extends Partial<CreateSupplierForm> {}

// Filter and search types
export interface SupplierFilter {
  typeSupplier?: SupplierType;
  namaPemilik?: string;
  namaPerusahaan?: string;
  sertifikasiISPO?: boolean;
  sertifikasiRSPO?: boolean;
  search?: string;
}

export interface SupplierPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// PKP Labels for display
export const PajakPKPLabels = {
  PKP_11_PERSEN: "PKP 11%",
  PKP_1_1_PERSEN: "PKP 1,1%",
  NON_PKP: "Non PKP"
} as const;

// Supplier Type Labels for display
export const SupplierTypeLabels = {
  RAMP_PERON: "Ramp/Peron",
  KUD: "KUD",
  KELOMPOK_TANI: "Kelompok Tani"
} as const;

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface SupplierFormErrors {
  [key: string]: string | undefined;
}

// Export for external use
export { SupplierType } from "@prisma/client";
