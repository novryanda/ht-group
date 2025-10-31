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
import { db } from "~/server/db";
import { GLService } from "~/server/services/pt-pks/gl.service";

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
   * Post ticket: move from DRAFT to POSTED (awaiting approval)
   */
  static async postTicket(id: string): Promise<WeighbridgeTicketDTO> {
    const ticket = await WeighbridgeRepository.findById(id);
    if (!ticket) {
      throw new Error("Tiket tidak ditemukan");
    }
    if (ticket.status !== "DRAFT") {
      throw new Error("Hanya tiket dengan status DRAFT yang dapat diposting");
    }
    if (Number(ticket.totalPembayaranSupplier) <= 0) {
      throw new Error("Total pembayaran supplier belum valid");
    }

    const updated = await WeighbridgeRepository.updateStatus(id, "POSTED");
    const updatedTicket = await WeighbridgeRepository.findById(updated.id);
    if (!updatedTicket) throw new Error("Gagal memperbarui status tiket");
    return WeighbridgeMapper.toDTO(updatedTicket);
  }

  /**
   * Bulk post tickets
   */
  static async bulkPostTickets(ticketIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ticketIds) {
      try {
        await this.postTicket(id);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Tiket ${id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * Approve ticket: set APPROVED, update stock, and post GL using system mappings
   */
  static async approveTicket(id: string, approved: boolean, createdById: string, warehouseId?: string): Promise<{ success: boolean; message?: string }> {
    const ticket = await WeighbridgeRepository.findById(id);
    if (!ticket) {
      throw new Error("Tiket tidak ditemukan");
    }
    if (ticket.status !== "POSTED") {
      throw new Error("Hanya tiket dengan status POSTED yang dapat di-approve");
    }

    if (!approved) {
      await WeighbridgeRepository.updateStatus(id, "DRAFT");
      return { success: true, message: "Tiket dikembalikan ke DRAFT" };
    }

    // Validate warehouse
    if (!warehouseId) {
      throw new Error("Gudang harus dipilih sebelum approve");
    }

    const warehouse = await db.warehouse.findUnique({ 
      where: { id: warehouseId },
    });
    if (!warehouse || !warehouse.isActive) {
      throw new Error("Gudang tidak ditemukan atau tidak aktif");
    }

    // Update stock: increase qty by beratTerima with unit cost hargaPerKg
    await db.$transaction(async (tx) => {
      // Upsert stock balance
      const balance = await tx.stockBalance.findFirst({
        where: { itemId: ticket.itemId, warehouseId: warehouse.id },
      });
      const qty = Number(ticket.beratTerima);
      const unitCost = Number(ticket.hargaPerKg);

      if (balance) {
        const newQty = Number(balance.qtyOnHand) + qty;
        // Weighted avg cost update
        const oldValue = Number(balance.qtyOnHand) * Number(balance.avgCost);
        const newValue = qty * unitCost;
        const newAvg = newQty > 0 ? (oldValue + newValue) / newQty : unitCost;
        await tx.stockBalance.update({
          where: { id: balance.id },
          data: { qtyOnHand: newQty, avgCost: newAvg },
        });
      } else {
        await tx.stockBalance.create({
          data: {
            itemId: ticket.itemId,
            warehouseId: warehouse.id,
            binId: null,
            qtyOnHand: qty,
            avgCost: unitCost,
          },
        });
      }

      // Stock ledger
      await tx.stockLedger.create({
        data: {
          itemId: ticket.itemId,
          warehouseId: warehouse.id,
          referenceType: "IN",
          referenceId: ticket.id,
          qtyDelta: qty,
          unitCost,
          note: `Weighbridge approval noSeri ${ticket.noSeri}`,
          createdById,
        },
      });

      // Update ticket status
      await tx.weighbridgeTicket.update({ where: { id: ticket.id }, data: { status: "APPROVED" } });
    });

    // Post simple GL: Debit INVENTORY_TBS, Credit AP_SUPPLIER_TBS
    try {
      const glService = new GLService();
      const inventoryAccountId = await glService.getSystemAccountId(ticket.companyId, "INVENTORY_TBS");
      const apAccountId = await glService.getSystemAccountId(ticket.companyId, "AP_SUPPLIER_TBS");

      if (inventoryAccountId && apAccountId) {
        const amount = Number(ticket.totalPembayaranSupplier);
        await glService.postJournalEntry(
          {
            companyId: ticket.companyId,
            date: new Date(ticket.tanggal),
            sourceType: "WeighbridgeApproval",
            sourceId: ticket.id,
            sourceNumber: ticket.noSeri,
            createdById,
            memo: `Approval Timbangan Supplier ${ticket.noSeri}`,
          },
          [
            { accountId: inventoryAccountId, debit: amount, credit: 0, warehouseId: undefined, description: "Persediaan TBS" },
            { accountId: apAccountId, debit: 0, credit: amount, description: "Hutang Supplier TBS" },
          ]
        );
      }
    } catch (e) {
      console.error("GL posting for weighbridge approval failed:", e);
      // Continue without failing approval
    }

    return { success: true, message: "Tiket berhasil di-approve" };
  }

  /**
   * Bulk approve tickets
   */
  static async bulkApproveTickets(
    ticketData: Array<{ ticketId: string; warehouseId: string }>,
    createdById: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const { ticketId, warehouseId } of ticketData) {
      try {
        await this.approveTicket(ticketId, true, createdById, warehouseId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Tiket ${ticketId}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return { success, failed, errors };
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
