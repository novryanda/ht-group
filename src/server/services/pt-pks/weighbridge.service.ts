/**
 * Service for Weighbridge Ticket
 * Business logic layer
 */

import { WeighbridgeRepository } from "~/server/repositories/pt-pks/weighbridge.repo";
import { WeighbridgeMapper } from "~/server/mappers/pt-pks/weighbridge.mapper";
import {
  calculatePricing,
  validateCalculations,
} from "~/server/schemas/pt-pks/weighbridge";
import type {
  CreatePBHarianDTO,
  UpdateTimbanganPricingDTO,
  WeighbridgeTicketDTO,
  WeighbridgeQueryDTO,
  VehicleLookupDTO,
  SupplierLookupDTO,
  ItemLookupDTO,
} from "~/server/types/pt-pks/weighbridge";
import type { Prisma } from "@prisma/client";

export class WeighbridgeService {
  /**
   * Get tickets with filters and pagination
   */
  static async getList(query: WeighbridgeQueryDTO) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const result = await WeighbridgeRepository.findMany({
      companyId: query.companyId,
      startDate,
      endDate,
      supplierId: query.supplierId,
      vehicleId: query.vehicleId,
      itemId: query.itemId,
      status: query.status,
      skip,
      take: pageSize,
    });

    return {
      data: WeighbridgeMapper.toDTOList(result.tickets),
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    };
  }

  /**
   * Get ticket by ID
   */
  static async getById(id: string): Promise<WeighbridgeTicketDTO | null> {
    const ticket = await WeighbridgeRepository.findById(id);
    if (!ticket) return null;
    return WeighbridgeMapper.toDTO(ticket);
  }

  /**
   * Create single ticket (Phase 1: PB Harian)
   */
  static async createPBHarian(
    data: CreatePBHarianDTO,
    createdById: string
  ): Promise<WeighbridgeTicketDTO> {
    // Validate calculations
    const validation = validateCalculations({
      timbang1: data.timbang1,
      timbang2: data.timbang2,
      netto1: data.netto1,
      potPercent: data.potPercent,
      potKg: data.potKg,
      beratTerima: data.beratTerima,
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Check duplicate noSeri
    const existing = await WeighbridgeRepository.findByNoSeri(
      data.companyId,
      data.noSeri
    );
    if (existing) {
      throw new Error(`No. Seri ${data.noSeri} sudah digunakan`);
    }

    // Create ticket with DRAFT status and zero pricing
    const createData: Prisma.WeighbridgeTicketCreateInput = {
      company: { connect: { id: data.companyId } },
      noSeri: data.noSeri,
      vehicle: { connect: { id: data.vehicleId } },
      supplier: { connect: { id: data.supplierId } },
      item: { connect: { id: data.itemId } },
      tanggal: new Date(data.tanggal),
      jamMasuk: new Date(data.jamMasuk),
      jamKeluar: data.jamKeluar ? new Date(data.jamKeluar) : null,
      timbang1: data.timbang1,
      timbang2: data.timbang2,
      netto1: data.netto1,
      potPercent: data.potPercent,
      potKg: data.potKg,
      beratTerima: data.beratTerima,
      lokasiKebun: data.lokasiKebun ?? null,
      penimbang: data.penimbang ?? null,
      hargaPerKg: 0,
      pphRate: 0,
      upahBongkarPerKg: 0,
      total: 0,
      totalPph: 0,
      totalUpahBongkar: 0,
      totalPembayaranSupplier: 0,
      status: "DRAFT",
      createdById,
    };

    const ticket = await WeighbridgeRepository.create(createData);
    return WeighbridgeMapper.toDTO(ticket);
  }

  /**
   * Bulk create tickets (Phase 1: PB Harian)
   */
  static async bulkCreatePBHarian(
    tickets: CreatePBHarianDTO[],
    createdById: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const ticket of tickets) {
      try {
        await this.createPBHarian(ticket, createdById);
        success++;
      } catch (error) {
        failed++;
        errors.push(
          `No. Seri ${ticket.noSeri}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return { success, failed, errors };
  }

  /**
   * Update pricing (Phase 2: Timbangan)
   */
  static async updatePricing(
    id: string,
    data: UpdateTimbanganPricingDTO
  ): Promise<WeighbridgeTicketDTO> {
    const ticket = await WeighbridgeRepository.findById(id);
    if (!ticket) {
      throw new Error("Tiket tidak ditemukan");
    }

    if (ticket.status !== "DRAFT") {
      throw new Error("Hanya tiket dengan status DRAFT yang dapat diupdate");
    }

    // Calculate totals
    const calculations = calculatePricing(
      Number(ticket.beratTerima),
      data.hargaPerKg,
      data.upahBongkarPerKg,
      data.pphRate
    );

    const updated = await WeighbridgeRepository.updatePricing(id, {
      hargaPerKg: data.hargaPerKg,
      pphRate: data.pphRate,
      upahBongkarPerKg: data.upahBongkarPerKg,
      total: calculations.total,
      totalPph: calculations.totalPph,
      totalUpahBongkar: calculations.totalUpahBongkar,
      totalPembayaranSupplier: calculations.totalPembayaranSupplier,
    });

    return WeighbridgeMapper.toDTO(updated);
  }

  /**
   * Delete ticket (only DRAFT status)
   */
  static async delete(id: string): Promise<void> {
    const ticket = await WeighbridgeRepository.findById(id);
    if (!ticket) {
      throw new Error("Tiket tidak ditemukan");
    }

    if (ticket.status !== "DRAFT") {
      throw new Error("Hanya tiket dengan status DRAFT yang dapat dihapus");
    }

    await WeighbridgeRepository.delete(id);
  }

  /**
   * Generate next serial number
   */
  static async generateNoSeri(
    companyId: string,
    tanggal: Date
  ): Promise<string> {
    return WeighbridgeRepository.generateNoSeri(companyId, tanggal);
  }

  // ============================================
  // Lookup data for dropdowns
  // ============================================

  static async getVehicles(): Promise<VehicleLookupDTO[]> {
    const vehicles = await WeighbridgeRepository.getActiveVehicles();
    return vehicles.map(WeighbridgeMapper.toVehicleLookup);
  }

  static async getSuppliers(): Promise<SupplierLookupDTO[]> {
    const suppliers = await WeighbridgeRepository.getActiveSuppliers();
    return suppliers.map(WeighbridgeMapper.toSupplierLookup);
  }

  static async getItems(): Promise<ItemLookupDTO[]> {
    const items = await WeighbridgeRepository.getActiveItems();
    return items.map(WeighbridgeMapper.toItemLookup);
  }
}
