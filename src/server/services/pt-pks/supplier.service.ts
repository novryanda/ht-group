import { db } from "~/server/db";
import { type CreateSupplierForm, type UpdateSupplierForm, type Supplier, type SupplierFilter, type SupplierPagination } from "~/server/types/pt-pks/supplier";
import { type SupplierTBS, type PajakPKP, type SupplierType, Prisma } from "@prisma/client";
import { sortByFuzzyMatch } from "~/server/lib/fuzzy-match";

export class SupplierService {
  /**
   * Create a new supplier
   */
  static async createSupplier(data: CreateSupplierForm): Promise<SupplierTBS> {
    try {
      // Generate form number if not provided
      const nomorForm = data.nomorForm || await this.generateFormNumber();

      const supplier = await db.supplierTBS.create({
        data: {
          nomorForm,
          typeSupplier: data.typeSupplier,
          pajakPKP: data.pajakPKP,

          // IDENTITAS
          namaPemilik: data.namaPemilik,
          alamatPemilik: data.alamatPemilik,
          hpPemilik: data.hpPemilik,
          namaPerusahaan: data.namaPerusahaan,
          alamatRampPeron: data.alamatRampPeron,
          hpPerusahaan: data.hpPerusahaan,
          bujur: data.bujur,
          lintang: data.lintang,

          // PROFIL KEBUN - JSON field (normalized array with estimasiSupplyTBS)
          // Use Prisma.JsonNull for empty arrays to maintain type safety
          profilKebun: (Array.isArray(data.profilKebun) && data.profilKebun.length > 0) 
            ? (data.profilKebun as any)
            : Prisma.JsonNull,

          // TIPE PENGELOLAAN
          pengelolaanSwadaya: data.pengelolaanSwadaya,
          pengelolaanKelompok: data.pengelolaanKelompok,
          pengelolaanPerusahaan: data.pengelolaanPerusahaan,
          jenisBibit: data.jenisBibit,
          sertifikasiISPO: data.sertifikasiISPO ?? false,
          sertifikasiRSPO: data.sertifikasiRSPO ?? false,

          // PROFIL IZIN USAHA
          aktePendirian: data.aktePendirian,
          aktePerubahan: data.aktePerubahan,
          nib: data.nib,
          siup: data.siup,
          npwp: data.npwp,

          // PENJUALAN TBS
          penjualanLangsungPKS: data.penjualanLangsungPKS,
          penjualanAgen: data.penjualanAgen,

          // TRANSPORTASI
          transportMilikSendiri: data.transportMilikSendiri,
          transportPihak3: data.transportPihak3,
        },
      });

      return supplier;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  }

  /**
   * Get suppliers with filtering and pagination
   */
  static async getSuppliers(
    filter: SupplierFilter = {},
    pagination: SupplierPagination = {}
  ): Promise<{ suppliers: SupplierTBS[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filter.typeSupplier) {
      where.typeSupplier = filter.typeSupplier;
    }

    if (filter.namaPemilik) {
      where.namaPemilik = {
        contains: filter.namaPemilik,
        mode: 'insensitive'
      };
    }

    if (filter.namaPerusahaan) {
      where.namaPerusahaan = {
        contains: filter.namaPerusahaan,
        mode: 'insensitive'
      };
    }

    if (filter.sertifikasiISPO !== undefined) {
      where.sertifikasiISPO = filter.sertifikasiISPO;
    }

    if (filter.sertifikasiRSPO !== undefined) {
      where.sertifikasiRSPO = filter.sertifikasiRSPO;
    }

    if (filter.search) {
      where.OR = [
        { namaPemilik: { contains: filter.search, mode: 'insensitive' } },
        { namaPerusahaan: { contains: filter.search, mode: 'insensitive' } },
        { nomorForm: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    try {
      const [suppliers, total] = await Promise.all([
        db.supplierTBS.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        db.supplierTBS.count({ where })
      ]);

      return { suppliers, total };
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(id: string): Promise<SupplierTBS | null> {
    try {
      return await db.supplierTBS.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error("Error fetching supplier:", error);
      throw error;
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: UpdateSupplierForm): Promise<SupplierTBS> {
    try {
      const updateData: any = { ...data };

      // Handle profilKebun JSON field (normalized array with estimasiSupplyTBS)
      if (data.profilKebun !== undefined) {
        updateData.profilKebun = (Array.isArray(data.profilKebun) && data.profilKebun.length > 0)
          ? data.profilKebun
          : Prisma.JsonNull;
      }

      return await db.supplierTBS.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: string): Promise<void> {
    try {
      await db.supplierTBS.delete({
        where: { id }
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  }

  /**
   * Check if NIB or NPWP is unique
   */
  static async checkUnique(nib?: string, npwp?: string, excludeId?: string): Promise<{
    nibExists: boolean;
    npwpExists: boolean;
  }> {
    try {
      const where: any = {};
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const [nibCheck, npwpCheck] = await Promise.all([
        nib ? db.supplierTBS.findFirst({
          where: { ...where, nib },
          select: { id: true }
        }) : null,
        npwp ? db.supplierTBS.findFirst({
          where: { ...where, npwp },
          select: { id: true }
        }) : null
      ]);

      return {
        nibExists: !!nibCheck,
        npwpExists: !!npwpCheck
      };
    } catch (error) {
      console.error("Error checking uniqueness:", error);
      throw error;
    }
  }

  /**
   * Get supplier statistics
   */
  static async getSupplierStats(): Promise<{
    total: number;
    byType: Record<SupplierType, number>;
    withISPO: number;
    withRSPO: number;
  }> {
    try {
      const [
        total,
        rampPeronCount,
        kudCount,
        kelompokTaniCount,
        ispoCount,
        rspoCount
      ] = await Promise.all([
        db.supplierTBS.count(),
        db.supplierTBS.count({ where: { typeSupplier: 'RAMP_PERON' } }),
        db.supplierTBS.count({ where: { typeSupplier: 'KUD' } }),
        db.supplierTBS.count({ where: { typeSupplier: 'KELOMPOK_TANI' } }),
        db.supplierTBS.count({ where: { sertifikasiISPO: true } }),
        db.supplierTBS.count({ where: { sertifikasiRSPO: true } })
      ]);

      return {
        total,
        byType: {
          RAMP_PERON: rampPeronCount,
          KUD: kudCount,
          KELOMPOK_TANI: kelompokTaniCount
        },
        withISPO: ispoCount,
        withRSPO: rspoCount
      };
    } catch (error) {
      console.error("Error fetching supplier stats:", error);
      throw error;
    }
  }

  /**
   * Generate form number
   */
  private static async generateFormNumber(): Promise<string> {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    // Get the count of suppliers created this month
    const startOfMonth = new Date(year, currentDate.getMonth(), 1);
    const endOfMonth = new Date(year, currentDate.getMonth() + 1, 0);

    const monthlyCount = await db.supplierTBS.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const sequentialNumber = String(monthlyCount + 1).padStart(3, '0');
    return `${sequentialNumber}/PT.TRT/SUPP-TBS/${month}/${year}`;
  }

  /**
   * Fuzzy search suppliers by name (for PB Import matching)
   * Returns suppliers sorted by similarity score
   */
  static async fuzzyFindByName(
    query: string,
    limit = 5
  ): Promise<Array<SupplierTBS & { similarity: number }>> {
    try {
      // Get all suppliers (or limit to reasonable number for performance)
      const suppliers = await db.supplierTBS.findMany({
        take: 100, // Limit initial fetch for performance
        orderBy: { createdAt: "desc" },
      });

      // Apply fuzzy matching
      const matches = sortByFuzzyMatch(
        suppliers,
        query,
        (s) => s.namaPerusahaan || s.namaPemilik
      );

      return matches.slice(0, limit);
    } catch (error) {
      console.error("Error in fuzzy supplier search:", error);
      throw error;
    }
  }
}
