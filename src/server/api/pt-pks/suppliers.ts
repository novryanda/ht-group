import { z } from "zod";
import { SupplierService } from "~/server/services/pt-pks/supplier.service";
import { type CreateSupplierForm, type UpdateSupplierForm, type SupplierFilter, type SupplierPagination } from "~/server/types/pt-pks/supplier";
import { SupplierType, PajakPKP } from "@prisma/client";

// Profil Kebun Schema - Backward compatible with both old and new field names
// V1: Old format with estimasiSupply (legacy)
const profilKebunItemV1 = z.object({
  tahunTanam: z.string(),
  luasKebun: z.coerce.number(),
  estimasiSupply: z.coerce.number(),
});

// V2: New format with estimasiSupplyTBS (current standard)
const profilKebunItemV2 = z.object({
  tahunTanam: z.string(),
  luasKebun: z.coerce.number(),
  estimasiSupplyTBS: z.coerce.number(),
});

// Union of both formats with transform to standardized output
const profilKebunItemCompat = z.union([profilKebunItemV1, profilKebunItemV2]).transform((item) => {
  // Normalize to new format with estimasiSupplyTBS
  if ('estimasiSupply' in item && !('estimasiSupplyTBS' in item)) {
    return {
      tahunTanam: item.tahunTanam,
      luasKebun: item.luasKebun,
      estimasiSupplyTBS: item.estimasiSupply,
    };
  }
  return {
    tahunTanam: item.tahunTanam,
    luasKebun: item.luasKebun,
    estimasiSupplyTBS: (item as any).estimasiSupplyTBS,
  };
});

// Preprocess profilKebun to handle: undefined → [], single object → [object], array → array
const profilKebunSchema = z.preprocess(
  (val) => {
    if (val == null || val === undefined) return [];
    if (Array.isArray(val)) return val;
    return [val]; // Single object → wrap in array
  },
  z.array(profilKebunItemCompat)
);

// Validation schemas
const createSupplierSchema = z.object({
  typeSupplier: z.nativeEnum(SupplierType),
  pajakPKP: z.nativeEnum(PajakPKP),

  // IDENTITAS
  namaPemilik: z.string().min(1, "Nama pemilik wajib diisi"),
  alamatPemilik: z.string().optional(),
  hpPemilik: z.string().optional(),
  namaPerusahaan: z.string().optional(),
  alamatRampPeron: z.string().optional(),
  hpPerusahaan: z.string().optional(),
  bujur: z.string().optional(),
  lintang: z.string().optional(),

  // PROFIL KEBUN - Always normalized to array with estimasiSupplyTBS
  profilKebun: profilKebunSchema.default([]),

  // TIPE PENGELOLAAN
  pengelolaanSwadaya: z.string().optional(),
  pengelolaanKelompok: z.string().optional(),
  pengelolaanPerusahaan: z.string().optional(),
  jenisBibit: z.string().optional(),
  sertifikasiISPO: z.boolean().optional(),
  sertifikasiRSPO: z.boolean().optional(),

  // PROFIL IZIN USAHA
  aktePendirian: z.string().optional(),
  aktePerubahan: z.string().optional(),
  nib: z.string().optional(),
  siup: z.string().optional(),
  npwp: z.string().optional(),

  // PENJUALAN TBS
  penjualanLangsungPKS: z.string().optional(),
  penjualanAgen: z.string().optional(),

  // TRANSPORTASI
  transportMilikSendiri: z.number().int().min(0).optional(),
  transportPihak3: z.number().int().min(0).optional(),
});

const updateSupplierSchema = z.object({
  typeSupplier: z.nativeEnum(SupplierType).optional(),
  pajakPKP: z.nativeEnum(PajakPKP).optional(),
  namaPemilik: z.string().min(1, "Nama pemilik wajib diisi").optional(),
  alamatPemilik: z.string().optional(),
  hpPemilik: z.string().optional(),
  namaPerusahaan: z.string().optional(),
  alamatRampPeron: z.string().optional(),
  hpPerusahaan: z.string().optional(),
  bujur: z.string().optional(),
  lintang: z.string().optional(),
  profilKebun: profilKebunSchema.optional(),
  pengelolaanSwadaya: z.string().optional(),
  pengelolaanKelompok: z.string().optional(),
  pengelolaanPerusahaan: z.string().optional(),
  jenisBibit: z.string().optional(),
  sertifikasiISPO: z.boolean().optional(),
  sertifikasiRSPO: z.boolean().optional(),
  aktePendirian: z.string().optional(),
  aktePerubahan: z.string().optional(),
  nib: z.string().optional(),
  siup: z.string().optional(),
  npwp: z.string().optional(),
  penjualanLangsungPKS: z.string().optional(),
  penjualanAgen: z.string().optional(),
  transportMilikSendiri: z.number().int().min(0).optional(),
  transportPihak3: z.number().int().min(0).optional(),
});

export class SupplierAPI {
  /**
   * Create a new supplier with validation
   */
  static async createSupplier(data: unknown) {
    try {
      // Validate input data
      const validatedData = createSupplierSchema.parse(data);

      // Check for unique constraints
      if (validatedData.nib || validatedData.npwp) {
        const uniqueCheck = await SupplierService.checkUnique(
          validatedData.nib,
          validatedData.npwp
        );

        const conflicts = {
          nib: uniqueCheck.nibExists,
          npwp: uniqueCheck.npwpExists
        };

        if (conflicts.nib || conflicts.npwp) {
          return {
            success: false,
            error: "Data sudah terdaftar",
            conflicts,
            statusCode: 409
          };
        }
      }

      // Create supplier
      const supplier = await SupplierService.createSupplier(validatedData);

      return {
        success: true,
        data: supplier,
        message: "Supplier berhasil didaftarkan",
        statusCode: 201
      };

    } catch (error) {
      console.error("Error in createSupplier API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Data tidak valid",
          details: error.issues,
          statusCode: 400
        };
      }

      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: "NIB atau NPWP sudah terdaftar",
          statusCode: 409
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat menyimpan data",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }

  /**
   * Get suppliers with filtering and pagination
   */
  static async getSuppliers(filter: SupplierFilter = {}, pagination: SupplierPagination = {}) {
    try {
      const { suppliers, total } = await SupplierService.getSuppliers(filter, pagination);

      const page = pagination.page ?? 1;
      const limit = pagination.limit ?? 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: suppliers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statusCode: 200
      };

    } catch (error) {
      console.error("Error in getSuppliers API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil data supplier",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID supplier tidak valid",
          statusCode: 400
        };
      }

      const supplier = await SupplierService.getSupplierById(id);

      if (!supplier) {
        return {
          success: false,
          error: "Supplier tidak ditemukan",
          statusCode: 404
        };
      }

      return {
        success: true,
        data: supplier,
        statusCode: 200
      };

    } catch (error) {
      console.error("Error in getSupplierById API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil data supplier",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: unknown) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID supplier tidak valid",
          statusCode: 400
        };
      }

      // Validate input data
      const validatedData = updateSupplierSchema.parse(data);

      // Check if supplier exists
      const existingSupplier = await SupplierService.getSupplierById(id);
      if (!existingSupplier) {
        return {
          success: false,
          error: "Supplier tidak ditemukan",
          statusCode: 404
        };
      }

      // Check for unique constraints (excluding current supplier)
      if (validatedData.nib || validatedData.npwp) {
        const uniqueCheck = await SupplierService.checkUnique(
          validatedData.nib,
          validatedData.npwp,
          id
        );

        const conflicts = {
          nib: uniqueCheck.nibExists,
          npwp: uniqueCheck.npwpExists
        };

        if (conflicts.nib || conflicts.npwp) {
          return {
            success: false,
            error: "Data sudah terdaftar",
            conflicts,
            statusCode: 409
          };
        }
      }

      // Update supplier
      const updatedSupplier = await SupplierService.updateSupplier(id, validatedData);

      return {
        success: true,
        data: updatedSupplier,
        message: "Supplier berhasil diperbarui",
        statusCode: 200
      };

    } catch (error) {
      console.error("Error in updateSupplier API:", error);

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: "Data tidak valid",
          details: error.issues,
          statusCode: 400
        };
      }

      return {
        success: false,
        error: "Terjadi kesalahan saat memperbarui data",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: string) {
    try {
      if (!id) {
        return {
          success: false,
          error: "ID supplier tidak valid",
          statusCode: 400
        };
      }

      // Check if supplier exists
      const existingSupplier = await SupplierService.getSupplierById(id);
      if (!existingSupplier) {
        return {
          success: false,
          error: "Supplier tidak ditemukan",
          statusCode: 404
        };
      }

      await SupplierService.deleteSupplier(id);

      return {
        success: true,
        message: "Supplier berhasil dihapus",
        statusCode: 200
      };

    } catch (error) {
      console.error("Error in deleteSupplier API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat menghapus data",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }

  /**
   * Check unique constraints
   */
  static async checkUnique(nib?: string, npwp?: string, excludeId?: string) {
    try {
      const result = await SupplierService.checkUnique(nib, npwp, excludeId);

      return {
        success: true,
        available: !result.nibExists && !result.npwpExists,
        conflicts: {
          nib: result.nibExists,
          npwp: result.npwpExists
        },
        statusCode: 200
      };

    } catch (error) {
      console.error("Error in checkUnique API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat memeriksa data",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }

  /**
   * Get supplier statistics
   */
  static async getSupplierStats() {
    try {
      const stats = await SupplierService.getSupplierStats();

      return {
        success: true,
        data: stats,
        statusCode: 200
      };

    } catch (error) {
      console.error("Error in getSupplierStats API:", error);

      return {
        success: false,
        error: "Terjadi kesalahan saat mengambil statistik",
        details: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500
      };
    }
  }
}
