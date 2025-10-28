/**
 * Warehouse Outbound Service
 * Business logic for barang keluar (peminjaman/issue)
 */

import { db } from "~/server/db";
import { WarehouseOutboundRepo } from "~/server/repositories/pt-pks/warehouse-outbound.repo";
import { WarehouseOutboundMapper } from "~/server/mappers/pt-pks/warehouse-outbound.mapper";
import { StockService } from "./stock.service";
import { GLService } from "./gl.service";
import type {
  CreateWarehouseOutboundInput,
  UpdateWarehouseOutboundInput,
  WarehouseOutboundQuery,
} from "~/server/schemas/pt-pks/warehouse-transaction";
import type {
  WarehouseOutboundDTO,
  StockValidationResult,
} from "~/server/types/pt-pks/warehouse-transaction";

export class WarehouseOutboundService {
  private repo: WarehouseOutboundRepo;
  private stockService: StockService;
  private glService: GLService;

  constructor() {
    this.repo = new WarehouseOutboundRepo();
    this.stockService = new StockService();
    this.glService = new GLService();
  }

  /**
   * Create new outbound transaction
   */
  async createOutbound(
    input: CreateWarehouseOutboundInput,
    createdById: string,
    companyId: string
  ): Promise<{ success: boolean; data?: WarehouseOutboundDTO; error?: string }> {
    try {
      // 1. Validate warehouse exists and is active
      const warehouse = await db.warehouse.findUnique({
        where: { id: input.warehouseId },
      });

      if (!warehouse) {
        return { success: false, error: "Gudang tidak ditemukan" };
      }

      if (!warehouse.isActive) {
        return { success: false, error: "Gudang tidak aktif" };
      }

      // 2. Validate all items exist and are active
      const itemIds = input.lines.map((line) => line.itemId);
      const items = await db.item.findMany({
        where: { id: { in: itemIds } },
      });

      if (items.length !== itemIds.length) {
        return { success: false, error: "Ada barang yang tidak ditemukan" };
      }

      const inactiveItem = items.find((item) => !item.isActive);
      if (inactiveItem) {
        return { success: false, error: `Barang "${inactiveItem.name}" tidak aktif` };
      }

      // 3. Validate stock availability
      const stockValidation = await this.validateStockAvailability(
        input.warehouseId,
        input.lines
      );

      if (!stockValidation.valid) {
        return {
          success: false,
          error: `Stok tidak mencukupi:\n${stockValidation.errors.map((e) => `- ${e.message}`).join("\n")}`,
        };
      }

      // 4. Generate document number
      const docNumber = await this.repo.generateDocNumber(
        warehouse.code,
        new Date(input.date)
      );

      // 5. Create outbound in transaction
      const result = await db.$transaction(async (tx) => {
        // Prepare line items with unit costs
        const linesWithCosts = [];
        let totalValue = 0;

        for (const line of input.lines) {
          const item = items.find((i) => i.id === line.itemId);
          if (!item) continue;

          // Get unit conversion rate
          const unit = await tx.unit.findUnique({
            where: { id: line.unitId },
          });

          if (!unit) {
            throw new Error(`Satuan tidak ditemukan untuk item ${item.name}`);
          }

          // Get stock balance to get unit cost
          const stockBalance = await tx.stockBalance.findFirst({
            where: {
              itemId: line.itemId,
              warehouseId: input.warehouseId,
            },
          });

          if (!stockBalance) {
            throw new Error(`Stok tidak ditemukan untuk barang ${item.name}`);
          }

          const unitCost = Number(stockBalance.avgCost);
          const qtyInBaseUnit = line.qty * Number(unit.conversionToBase);
          const lineValue = qtyInBaseUnit * unitCost;
          totalValue += lineValue;

          linesWithCosts.push({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
            unitCost,
            note: line.note,
            qtyInBaseUnit,
          });
        }

        // Create outbound document
        const outbound = await this.repo.create(
          {
            docNumber,
            date: new Date(input.date),
            warehouse: { connect: { id: input.warehouseId } },
            purpose: input.purpose,
            targetDept: input.targetDept,
            pickerName: input.pickerName,
            status: "APPROVED",
            note: input.note,
            loanReceiver: input.loanReceiver,
            expectedReturnAt: input.expectedReturnAt ? new Date(input.expectedReturnAt) : null,
            loanNotes: input.loanNotes,
            expenseAccountId: input.expenseAccountId,
            costCenter: input.costCenter,
            glStatus: "PENDING",
            createdById,
          },
          linesWithCosts.map((line) => ({
            itemId: line.itemId,
            unitId: line.unitId,
            qty: line.qty,
            unitCost: line.unitCost,
            note: line.note,
          }))
        );

        // Update stock balances and create ledger entries
        for (const line of linesWithCosts) {
          const item = items.find((i) => i.id === line.itemId);
          if (!item) continue;

          const stockBalance = await tx.stockBalance.findFirst({
            where: {
              itemId: line.itemId,
              warehouseId: input.warehouseId,
            },
          });

          if (!stockBalance) {
            throw new Error(`Stok tidak ditemukan untuk barang ${item.name}`);
          }

          const newQty = Number(stockBalance.qtyOnHand) - line.qtyInBaseUnit;

          if (newQty < 0) {
            throw new Error(`Stok ${item.name} tidak mencukupi`);
          }

          await tx.stockBalance.update({
            where: { id: stockBalance.id },
            data: {
              qtyOnHand: newQty,
            },
          });

          // Create stock ledger entry
          await tx.stockLedger.create({
            data: {
              itemId: line.itemId,
              warehouseId: input.warehouseId,
              binId: stockBalance.binId,
              referenceType: "OUT",
              referenceId: outbound.id,
              qtyDelta: -line.qtyInBaseUnit,
              unitCost: line.unitCost,
              note: `Barang keluar: ${input.purpose} - ${input.targetDept}`,
              createdById,
            },
          });
        }

        // Post GL based on purpose
        try {
          const glLines = await this.glService.buildGoodsIssueGLLines({
            companyId,
            purpose: input.purpose,
            totalValue,
            expenseAccountId: input.expenseAccountId,
            costCenter: input.costCenter,
            dept: input.targetDept,
            warehouseId: input.warehouseId,
          });

          const glResult = await this.glService.postJournalEntry(
            {
              companyId,
              date: new Date(input.date),
              sourceType: "GoodsIssue",
              sourceId: outbound.id,
              sourceNumber: docNumber,
              createdById,
            },
            glLines
          );

          if (glResult.success) {
            await tx.goodsIssue.update({
              where: { id: outbound.id },
              data: {
                glStatus: "POSTED",
                glPostedAt: new Date(),
                glEntryId: glResult.journalEntryId,
              },
            });
          } else {
            console.error("❌ GL posting failed:", glResult.error);
            // Mark as failed but don't rollback transaction
            await tx.goodsIssue.update({
              where: { id: outbound.id },
              data: {
                glStatus: "FAILED",
              },
            });
          }
        } catch (glError) {
          console.error("❌ GL posting error:", glError);
          await tx.goodsIssue.update({
            where: { id: outbound.id },
            data: {
              glStatus: "FAILED",
            },
          });
        }

        return outbound;
      });

      return {
        success: true,
        data: WarehouseOutboundMapper.toDTO(result),
      };
    } catch (error) {
      console.error("Error creating outbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat transaksi barang keluar",
      };
    }
  }

  /**
   * Update outbound transaction
   */
  async updateOutbound(
    id: string,
    input: UpdateWarehouseOutboundInput
  ): Promise<{ success: boolean; data?: WarehouseOutboundDTO; error?: string }> {
    try {
      // Find existing outbound
      const existing = await this.repo.findById(id);
      if (!existing) {
        return { success: false, error: "Transaksi tidak ditemukan" };
      }

      // TODO: Add validation - only DRAFT can be edited
      // For now, simple update
      const updated = await this.repo.update(id, {
        ...(input.date && { date: new Date(input.date) }),
        ...(input.warehouseId && { warehouse: { connect: { id: input.warehouseId } } }),
        ...(input.purpose && { purpose: input.purpose }),
        ...(input.targetDept && { targetDept: input.targetDept }),
        ...(input.note !== undefined && { note: input.note }),
      });

      return {
        success: true,
        data: WarehouseOutboundMapper.toDTO(updated),
      };
    } catch (error) {
      console.error("Error updating outbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal update transaksi",
      };
    }
  }

  /**
   * Get outbound by ID
   */
  async getOutboundById(id: string): Promise<{ success: boolean; data?: WarehouseOutboundDTO; error?: string }> {
    try {
      const outbound = await this.repo.findById(id);
      if (!outbound) {
        return { success: false, error: "Transaksi tidak ditemukan" };
      }

      return {
        success: true,
        data: WarehouseOutboundMapper.toDTO(outbound),
      };
    } catch (error) {
      console.error("Error getting outbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil data",
      };
    }
  }

  /**
   * Get outbounds with pagination
   */
  async getOutbounds(query: WarehouseOutboundQuery): Promise<{
    success: boolean;
    data?: WarehouseOutboundDTO[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
    error?: string;
  }> {
    try {
      const result = await this.repo.findManyWithPagination({
        search: query.search,
        warehouseId: query.warehouseId,
        purpose: query.purpose,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true,
        data: WarehouseOutboundMapper.toDTOList(result.data),
        meta: result.meta,
      };
    } catch (error) {
      console.error("Error getting outbounds:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil data",
      };
    }
  }

  /**
   * Delete outbound transaction
   */
  async deleteOutbound(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find existing
      const existing = await this.repo.findById(id);
      if (!existing) {
        return { success: false, error: "Transaksi tidak ditemukan" };
      }

      // TODO: Add validation - can't delete if already returned
      // For now, just delete
      await this.repo.delete(id);

      return { success: true };
    } catch (error) {
      console.error("Error deleting outbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus transaksi",
      };
    }
  }

  /**
   * Validate stock availability before creating outbound
   */
  private async validateStockAvailability(
    warehouseId: string,
    lines: Array<{ itemId: string; unitId: string; qty: number }>
  ): Promise<StockValidationResult> {
    const errors = [];

    for (const line of lines) {
      // Get item and unit
      const [item, unit] = await Promise.all([
        db.item.findUnique({ where: { id: line.itemId } }),
        db.unit.findUnique({ where: { id: line.unitId } }),
      ]);

      if (!item || !unit) continue;

      // Convert to base unit
      const qtyInBaseUnit = line.qty * Number(unit.conversionToBase);

      // Check stock balance
      const stockBalance = await db.stockBalance.findFirst({
        where: {
          itemId: line.itemId,
          warehouseId,
        },
      });

      const available = stockBalance ? Number(stockBalance.qtyOnHand) : 0;

      if (available < qtyInBaseUnit) {
        errors.push({
          itemId: line.itemId,
          itemName: item.name,
          requested: line.qty,
          available: available / Number(unit.conversionToBase),
          message: `${item.name}: diminta ${line.qty} ${unit.name}, tersedia ${(available / Number(unit.conversionToBase)).toFixed(2)} ${unit.name}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
