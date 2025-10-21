import { type FamilyRelation } from "@prisma/client";

// ============================================================================
// PAGINATION & QUERY TYPES
// ============================================================================

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  // Filters
  devisi?: string;
  level?: string;
  jabatan?: string;
  companyId?: string;
}

// ============================================================================
// EMPLOYEE FAMILY DTOs
// ============================================================================

export interface EmployeeFamilyDTO {
  id: string;
  employeeId: string;
  nama: string;
  hubungan: FamilyRelation;
  jenis_kelamin?: string | null;
  tanggal_lahir?: Date | null;
  umur?: number | null;
  no_nik_ktp?: string | null;
  no_bpjs_kesehatan?: string | null;
  no_telp_hp?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeFamilyCreateDTO {
  nama: string;
  hubungan: FamilyRelation;
  jenis_kelamin?: string | null;
  tanggal_lahir?: Date | string | null;
  umur?: number | null;
  no_nik_ktp?: string | null;
  no_bpjs_kesehatan?: string | null;
  no_telp_hp?: string | null;
}

export interface EmployeeFamilyUpdateDTO {
  nama?: string | null;
  hubungan?: FamilyRelation;
  jenis_kelamin?: string | null;
  tanggal_lahir?: Date | string | null;
  umur?: number | null;
  no_nik_ktp?: string | null;
  no_bpjs_kesehatan?: string | null;
  no_telp_hp?: string | null;
}

// ============================================================================
// EMPLOYEE DTOs
// ============================================================================

// List item DTO - untuk tabel list (dengan familyCount)
export interface EmployeeListItemDTO {
  id_karyawan: string;
  nama: string | null;
  status_kk: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  suku: string | null;
  golongan_darah: string | null;
  no_telp_hp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: Date | null;
  umur: number | null;
  alamat_rt_rw: string | null;
  alamat_desa: string | null;
  alamat_kecamatan: string | null;
  alamat_kabupaten: string | null;
  alamat_provinsi: string | null;
  pendidikan_terakhir: string | null;
  jurusan: string | null;
  jabatan: string | null;
  devisi: string | null;
  level: string | null;
  tgl_masuk_kerja: Date | null;
  tgl_terakhir_kerja: Date | null;
  masa_kerja: string | null;
  status_pkwt: string | null;
  no_bpjs_tenaga_kerja: string | null;
  no_nik_ktp: string | null;
  no_bpjs_kesehatan: string | null;
  no_npwp: string | null;
  status_pajak: string | null;
  no_rekening_bank: string | null;
  perusahaan_sebelumnya: string | null;
  familyCount: number; // Jumlah anggota keluarga
  createdAt: Date;
  updatedAt: Date;
}

// Detail DTO - untuk detail page (dengan families)
export interface EmployeeDTO {
  id_karyawan: string;
  nama: string | null;
  status_kk: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  suku: string | null;
  golongan_darah: string | null;
  no_telp_hp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: Date | null;
  umur: number | null;
  alamat_rt_rw: string | null;
  alamat_desa: string | null;
  alamat_kecamatan: string | null;
  alamat_kabupaten: string | null;
  alamat_provinsi: string | null;
  pendidikan_terakhir: string | null;
  jurusan: string | null;
  jabatan: string | null;
  devisi: string | null;
  level: string | null;
  tgl_masuk_kerja: Date | null;
  tgl_terakhir_kerja: Date | null;
  masa_kerja: string | null;
  status_pkwt: string | null;
  no_bpjs_tenaga_kerja: string | null;
  no_nik_ktp: string | null;
  no_bpjs_kesehatan: string | null;
  no_npwp: string | null;
  status_pajak: string | null;
  no_rekening_bank: string | null;
  perusahaan_sebelumnya: string | null;
  companyId: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  families?: EmployeeFamilyDTO[];
}

// Create DTO - untuk create employee baru
export interface EmployeeCreateDTO {
  // Required fields
  nama: string;
  jenis_kelamin: string; // L | P
  no_nik_ktp: string;

  // Optional fields
  status_kk?: string | null;
  agama?: string | null;
  suku?: string | null;
  golongan_darah?: string | null;
  no_telp_hp?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: Date | string | null;
  umur?: number | null;
  alamat_rt_rw?: string | null;
  alamat_desa?: string | null;
  alamat_kecamatan?: string | null;
  alamat_kabupaten?: string | null;
  alamat_provinsi?: string | null;
  pendidikan_terakhir?: string | null;
  jurusan?: string | null;
  jabatan?: string | null;
  devisi?: string | null; // Free text input
  level?: string | null; // Free text input
  tgl_masuk_kerja?: Date | string | null;
  tgl_terakhir_kerja?: Date | string | null;
  masa_kerja?: string | null;
  status_pkwt?: string | null;
  no_bpjs_tenaga_kerja?: string | null;
  no_bpjs_kesehatan?: string | null;
  no_npwp?: string | null;
  status_pajak?: string | null;
  no_rekening_bank?: string | null;
  perusahaan_sebelumnya?: string | null;
  companyId?: string | null;
  userId?: string | null;
}

// Update DTO - untuk update employee
export interface EmployeeUpdateDTO {
  nama?: string | null;
  status_kk?: string | null;
  jenis_kelamin?: string | null;
  agama?: string | null;
  suku?: string | null;
  golongan_darah?: string | null;
  no_telp_hp?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: Date | string | null;
  umur?: number | null;
  alamat_rt_rw?: string | null;
  alamat_desa?: string | null;
  alamat_kecamatan?: string | null;
  alamat_kabupaten?: string | null;
  alamat_provinsi?: string | null;
  pendidikan_terakhir?: string | null;
  jurusan?: string | null;
  jabatan?: string | null;
  devisi?: string | null;
  level?: string | null;
  tgl_masuk_kerja?: Date | string | null;
  tgl_terakhir_kerja?: Date | string | null;
  masa_kerja?: string | null;
  status_pkwt?: string | null;
  no_bpjs_tenaga_kerja?: string | null;
  no_nik_ktp?: string | null;
  no_bpjs_kesehatan?: string | null;
  no_npwp?: string | null;
  status_pajak?: string | null;
  no_rekening_bank?: string | null;
  perusahaan_sebelumnya?: string | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface EmployeeListResponse {
  items: EmployeeListItemDTO[];
  pagination: Pagination;
}

export interface EmployeeDetailResponse {
  employee: EmployeeDTO;
  families: EmployeeFamilyDTO[];
}

