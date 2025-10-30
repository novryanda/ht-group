import {
  type Supplier,
  type CreateSupplierForm,
  type UpdateSupplierForm,
  type SupplierFilter,
  type SupplierPagination,
  type SupplierApiResponse,
  type SupplierListResponse,
  type SupplierStatsResponse,
  type UniqueCheckResponse
} from "~/server/types/pt-pks/supplier";

const API_BASE_URL = "/api/pt-pks/suppliers";

/**
 * Supplier API Client for frontend usage
 */
export class SupplierApiClient {
  /**
   * Create new supplier
   */
  static async createSupplier(data: CreateSupplierForm): Promise<SupplierApiResponse<Supplier>> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Log the response for debugging
      console.log("API Response status:", response.status);
      console.log("API Response data:", result);

      // Return the parsed result with code field
      return {
        ...result,
        code: String(response.status)
      };
    } catch (error) {
      console.error("Fetch error in createSupplier:", error);
      return {
        success: false,
        error: "Network error atau server tidak merespons",
        details: error instanceof Error ? error.message : "Unknown network error",
        code: '500'
      };
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(id: string): Promise<SupplierApiResponse<Supplier>> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return response.json();
  }

  /**
   * Get suppliers with filter and pagination
   */
  static async getSuppliers(
    filter: SupplierFilter = {},
    pagination: SupplierPagination = {}
  ): Promise<SupplierListResponse> {
    const searchParams = new URLSearchParams();

    // Add filter parameters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    // Add pagination parameters
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const url = `${API_BASE_URL}?${searchParams.toString()}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: UpdateSupplierForm): Promise<SupplierApiResponse<Supplier>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // Log the response for debugging
      console.log("Update API Response status:", response.status);
      console.log("Update API Response data:", result);

      // Return the parsed result with code field
      return {
        ...result,
        code: String(response.status)
      };
    } catch (error) {
      console.error("Fetch error in updateSupplier:", error);
      return {
        success: false,
        error: "Network error atau server tidak merespons",
        details: error instanceof Error ? error.message : "Unknown network error",
        code: '500'
      };
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: string): Promise<SupplierApiResponse> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    return response.json();
  }

  /**
   * Get supplier statistics
   */
  static async getSupplierStats(): Promise<SupplierStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  }

  /**
   * Check if NIB or NPWP is unique
   */
  static async checkUniqueFields(
    nib?: string,
    npwp?: string,
    excludeId?: string
  ): Promise<UniqueCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/check-unique`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nib, npwp, excludeId }),
    });

    return response.json();
  }

  /**
   * Update supplier bank information
   */
  static async updateBankInfo(
    id: string,
    bankData: {
      bankName: string;
      bankAccountNo: string;
      bankAccountName: string;
    }
  ): Promise<SupplierApiResponse<Supplier>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/bank-info`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankData),
      });

      const result = await response.json();

      console.log("Update Bank Info Response status:", response.status);
      console.log("Update Bank Info Response data:", result);

      return {
        ...result,
        code: String(response.status)
      };
    } catch (error) {
      console.error("Fetch error in updateBankInfo:", error);
      return {
        success: false,
        error: "Network error atau server tidak merespons",
        details: error instanceof Error ? error.message : "Unknown network error",
        code: '500'
      };
    }
  }
}

/**
 * Utility functions for supplier data
 */
export class SupplierUtils {
  /**
   * Generate nomor form for supplier
   */
  static generateNomorForm(count: number, companyCode = "PT.PKS"): string {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${count + 1}/${companyCode}/SUPP-TBS/${month}/${year}`;
  }

  /**
   * Format supplier display name
   */
  static getDisplayName(supplier: Supplier): string {
    if (supplier.namaPerusahaan) {
      return `${supplier.namaPerusahaan} (${supplier.namaPemilik})`;
    }
    return supplier.namaPemilik;
  }

  /**
   * Calculate total transport vehicles
   */
  static getTotalTransport(supplier: Supplier): number {
    const milikSendiri = supplier.transportMilikSendiri || 0;
    const pihak3 = supplier.transportPihak3 || 0;
    return milikSendiri + pihak3;
  }

  /**
   * Check if supplier has any certification
   */
  static hasCertification(supplier: Supplier): boolean {
    return supplier.sertifikasiISPO || supplier.sertifikasiRSPO;
  }

  /**
   * Get certification badges
   */
  static getCertificationBadges(supplier: Supplier): string[] {
    const badges: string[] = [];
    if (supplier.sertifikasiISPO) badges.push("ISPO");
    if (supplier.sertifikasiRSPO) badges.push("RSPO");
    return badges;
  }

  /**
   * Validate supplier form data
   */
  static validateSupplierForm(data: CreateSupplierForm): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Required fields
    if (!data.namaPemilik?.trim()) {
      errors.namaPemilik = "Nama pemilik wajib diisi";
    }

    if (!data.typeSupplier) {
      errors.typeSupplier = "Tipe supplier wajib dipilih";
    }

    if (data.transportMilikSendiri !== undefined && data.transportMilikSendiri < 0) {
      errors.transportMilikSendiri = "Jumlah transport tidak boleh negatif";
    }

    if (data.transportPihak3 !== undefined && data.transportPihak3 < 0) {
      errors.transportPihak3 = "Jumlah transport tidak boleh negatif";
    }

    // Phone number validation (basic)
    if (data.hpPemilik && !/^[\d\-\+\(\)\s]+$/.test(data.hpPemilik)) {
      errors.hpPemilik = "Format nomor HP tidak valid";
    }

    if (data.hpPerusahaan && !/^[\d\-\+\(\)\s]+$/.test(data.hpPerusahaan)) {
      errors.hpPerusahaan = "Format nomor HP tidak valid";
    }

    // Coordinate validation (basic)
    if (data.bujur && (isNaN(Number(data.bujur)) || Math.abs(Number(data.bujur)) > 180)) {
      errors.bujur = "Format koordinat bujur tidak valid (-180 to 180)";
    }

    if (data.lintang && (isNaN(Number(data.lintang)) || Math.abs(Number(data.lintang)) > 90)) {
      errors.lintang = "Format koordinat lintang tidak valid (-90 to 90)";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format area (hectare) for display
   */
  static formatArea(area: number): string {
    return `${area.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Ha`;
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Search suppliers locally (for client-side filtering)
   */
  static searchSuppliers(suppliers: Supplier[], searchTerm: string): Supplier[] {
    if (!searchTerm.trim()) return suppliers;

    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier =>
      supplier.namaPemilik.toLowerCase().includes(term) ||
      supplier.namaPerusahaan?.toLowerCase().includes(term) ||
      supplier.nomorForm?.toLowerCase().includes(term) ||
      supplier.alamatPemilik?.toLowerCase().includes(term) ||
      supplier.alamatRampPeron?.toLowerCase().includes(term)
    );
  }

  /**
   * Sort suppliers by field
   */
  static sortSuppliers(suppliers: Supplier[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Supplier[] {
    return [...suppliers].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Supplier];
      let bValue: any = b[sortBy as keyof Supplier];

      // Handle date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}
