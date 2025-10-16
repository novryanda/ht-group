import { BuyerRepository } from "~/server/repositories/buyer.repo";
import { BuyerMapper } from "~/server/mappers/buyer.mapper";
import { generateBuyerCode, getCurrentYearMonth } from "~/server/lib/codegen";
import type {
  CreateBuyerDTO,
  UpdateBuyerDTO,
  BuyerFilter,
  BuyerPagination,
  BuyerListResult,
  BuyerWithRelations,
  DuplicateCheckParams,
  DuplicateCheckResult,
} from "~/server/types/buyer";

/**
 * Buyer Service - Business logic layer
 */
export class BuyerService {
  /**
   * Create a new buyer
   * - Validates duplicate (NPWP or name+location)
   * - Generates buyer code
   * - Sets status to VERIFIED
   * - Records verifiedBy and verifiedAt
   */
  static async createBuyer(
    data: CreateBuyerDTO,
    currentUserId: string
  ): Promise<BuyerWithRelations> {
    // Check for duplicates
    const duplicateCheck = await this.checkDuplicate({
      npwp: data.npwp,
      legalName: data.legalName,
      city: data.city,
      province: data.province,
    });

    if (duplicateCheck.isDuplicate) {
      throw new Error(
        duplicateCheck.message ?? "Buyer dengan data yang sama sudah terdaftar"
      );
    }

    // Generate buyer code
    const yearMonth = getCurrentYearMonth();
    const lastCode = await BuyerRepository.getLastBuyerCodeForMonth(yearMonth);
    const buyerCode = generateBuyerCode(lastCode);

    // Create buyer
    const buyer = await BuyerRepository.create(data, buyerCode, currentUserId);

    return BuyerMapper.toDTO(buyer);
  }

  /**
   * Get buyers with filtering and pagination
   */
  static async getBuyers(
    filter: BuyerFilter = {},
    pagination: BuyerPagination = {}
  ): Promise<BuyerListResult> {
    const { buyers, total } = await BuyerRepository.findMany(filter, pagination);

    return {
      buyers: BuyerMapper.toDTOList(buyers),
      total,
    };
  }

  /**
   * Get buyer by ID
   */
  static async getBuyerById(id: string): Promise<BuyerWithRelations | null> {
    const buyer = await BuyerRepository.findById(id);
    return buyer ? BuyerMapper.toDTO(buyer) : null;
  }

  /**
   * Get buyer by code
   */
  static async getBuyerByCode(code: string): Promise<BuyerWithRelations | null> {
    const buyer = await BuyerRepository.findByCode(code);
    return buyer ? BuyerMapper.toDTO(buyer) : null;
  }

  /**
   * Update buyer
   */
  static async updateBuyer(
    id: string,
    data: UpdateBuyerDTO
  ): Promise<BuyerWithRelations> {
    // Check if buyer exists
    const existing = await BuyerRepository.findById(id);
    if (!existing) {
      throw new Error("Buyer tidak ditemukan");
    }

    // Check for duplicates if NPWP or location is being changed
    if (data.npwp || data.legalName || data.city || data.province) {
      const duplicateCheck = await this.checkDuplicate({
        npwp: data.npwp ?? existing.npwp ?? undefined,
        legalName: data.legalName ?? existing.legalName,
        city: data.city ?? existing.city,
        province: data.province ?? existing.province,
      });

      // Filter out the current buyer from duplicates
      const otherDuplicates = duplicateCheck.duplicates.filter(
        (b) => b.id !== id
      );

      if (otherDuplicates.length > 0) {
        throw new Error("Buyer dengan data yang sama sudah terdaftar");
      }
    }

    const updated = await BuyerRepository.update(id, data);
    return BuyerMapper.toDTO(updated);
  }

  /**
   * Delete buyer
   */
  static async deleteBuyer(id: string): Promise<void> {
    const existing = await BuyerRepository.findById(id);
    if (!existing) {
      throw new Error("Buyer tidak ditemukan");
    }

    await BuyerRepository.delete(id);
  }

  /**
   * Check for duplicate buyers
   * Priority: NPWP > (legalName + city + province)
   */
  static async checkDuplicate(
    params: DuplicateCheckParams
  ): Promise<DuplicateCheckResult> {
    const duplicates = await BuyerRepository.checkDuplicate(params);

    if (duplicates.length === 0) {
      return {
        isDuplicate: false,
        duplicates: [],
      };
    }

    // Build message
    let message = "Buyer sudah terdaftar";
    if (params.npwp) {
      message = `Buyer dengan NPWP ${params.npwp} sudah terdaftar`;
    } else if (params.legalName && params.city && params.province) {
      message = `Buyer dengan nama "${params.legalName}" di ${params.city}, ${params.province} sudah terdaftar`;
    }

    return {
      isDuplicate: true,
      duplicates: BuyerMapper.toDTOList(duplicates),
      message,
    };
  }

  /**
   * Get buyer statistics
   */
  static async getStats() {
    return BuyerRepository.getStats();
  }

  /**
   * Search buyers by query (for autocomplete, etc.)
   */
  static async searchBuyers(
    query: string,
    limit = 10
  ): Promise<BuyerWithRelations[]> {
    const { buyers } = await BuyerRepository.findMany(
      { query },
      { page: 1, pageSize: limit, sortBy: "legalName", sortOrder: "asc" }
    );

    return BuyerMapper.toDTOList(buyers);
  }
}

