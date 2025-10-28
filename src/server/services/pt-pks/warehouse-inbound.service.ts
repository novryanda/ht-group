/**
 * Warehouse Inbound Service
 * Business logic untuk barang masuk (return & new items)
 */

import { db } from "~/server/db";
import { WarehouseInboundRepo } from "~/server/repositories/pt-pks/warehouse-inbound.repo";
import { WarehouseInboundMapper } from "~/server/mappers/pt-pks/warehouse-inbound.mapper";
import { ItemRepo } from "~/server/repositories/pt-pks/item.repo";
import { GLService } from "./gl.service";
import type {
  CreateWarehouseInboundInput,
  CreateNewItemInboundInput,
  CreateLoanReturnInput,
  WarehouseInboundQuery,
} from "~/server/schemas/pt-pks/warehouse-transaction";
import type { WarehouseInboundDTO } from "~/server/types/pt-pks/warehouse-transaction";

export class WarehouseInboundService {
  private repo: WarehouseInboundRepo;
  private itemRepo: ItemRepo;
  private glService: GLService;

  constructor() {
    this.repo = new WarehouseInboundRepo();
    this.itemRepo = new ItemRepo();
    this.glService = new GLService();
  }

  /**
   * Create inbound transaction (return or existing items)
   */
  async createInbound(
    input: CreateWarehouseInboundInput,
    createdById: string
  ): Promise<{ success: boolean; data?: WarehouseInboundDTO; error?: string }> {
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
        include: { baseUnit: true },
      });

      if (items.length !== itemIds.length) {
        return { success: false, error: "Ada barang yang tidak ditemukan" };
      }

      const inactiveItem = items.find((item) => !item.isActive);
      if (inactiveItem) {
        return { success: false, error: `Barang "${inactiveItem.name}" tidak aktif` };
      }

      // 3. Auto-populate unitId from baseUnitId if not provided
      const linesWithUnit = input.lines.map((line) => {
        const item = items.find((i) => i.id === line.itemId);
        return {
          ...line,
          unitId: line.unitId || item?.baseUnitId || "",
        };
      });

      // 3. Generate document number
      const docNumber = await this.repo.generateDocNumber(
        warehouse.code,
        new Date(input.date)
      );

      // 4. Create inbound in transaction
      const result = await db.$transaction(async (tx) => {
        // Create inbound document
        const inbound = await this.repo.create(
          {
            docNumber,
            date: new Date(input.date),
            warehouse: { connect: { id: input.warehouseId } },
            sourceType: input.sourceType,
            sourceRef: input.sourceRef,
            note: input.note,
            createdById,
          },
          linesWithUnit.map((line) => ({
            itemId: line.itemId,
            unitId: line.unitId!,
            qty: line.qty,
            unitCost: 0, // Default 0 for RETURN type
            note: line.note,
          }))
        );

        // Update stock balances and create ledger entries
        for (const line of linesWithUnit) {
          const item = items.find((i) => i.id === line.itemId);
          if (!item) continue;

          // Get unit conversion rate
          const unit = await tx.unit.findUnique({
            where: { id: line.unitId },
          });

          if (!unit) {
            throw new Error(`Satuan tidak ditemukan untuk item ${item.name}`);
          }

          // Convert to base unit
          const qtyInBaseUnit = line.qty * Number(unit.conversionToBase);

          // Get or create stock balance
          const stockBalance = await tx.stockBalance.findFirst({
            where: {
              itemId: line.itemId,
              warehouseId: input.warehouseId,
            },
          });

          if (stockBalance) {
            // Update existing stock (no cost update for RETURN)
            const newQty = Number(stockBalance.qtyOnHand) + qtyInBaseUnit;

            await tx.stockBalance.update({
              where: { id: stockBalance.id },
              data: {
                qtyOnHand: newQty,
              },
            });
          } else {
            // Create new stock balance with zero cost for RETURN
            await tx.stockBalance.create({
              data: {
                itemId: line.itemId,
                warehouseId: input.warehouseId,
                binId: null,
                qtyOnHand: qtyInBaseUnit,
                avgCost: 0,
              },
            });
          }

          // Create stock ledger entry
          await tx.stockLedger.create({
            data: {
              itemId: line.itemId,
              warehouseId: input.warehouseId,
              binId: stockBalance?.binId ?? null,
              referenceType: "IN",
              referenceId: inbound.id,
              qtyDelta: qtyInBaseUnit,
              unitCost: 0,
              note: `Barang masuk: ${input.sourceType}${input.sourceRef ? ` - Ref: ${input.sourceRef}` : ""}`,
              createdById,
            },
          });
        }

        return inbound;
      });

      // 5. Update outbound status if this is a RETURN and matches sourceRef
      if (input.sourceType === "RETURN" && input.sourceRef) {
        try {
          // Find outbound by docNumber
          const outbound = await db.goodsIssue.findFirst({
            where: { docNumber: input.sourceRef },
            include: { lines: true },
          });

          if (outbound) {
            // Get all inbound returns for this outbound
            const allReturns = await db.goodsReceipt.findMany({
              where: {
                sourceType: "RETURN",
                sourceRef: input.sourceRef,
              },
              include: { lines: true },
            });

            // Calculate total returned qty per item
            const returnedQtyByItem = new Map<string, number>();
            
            for (const returnDoc of allReturns) {
              for (const line of returnDoc.lines) {
                const currentQty = returnedQtyByItem.get(line.itemId) || 0;
                returnedQtyByItem.set(line.itemId, currentQty + Number(line.qty));
              }
            }

            // Check if all items fully returned
            let fullyReturned = true;
            let partiallyReturned = false;

            for (const outboundLine of outbound.lines) {
              const returnedQty = returnedQtyByItem.get(outboundLine.itemId) || 0;
              const issuedQty = Number(outboundLine.qty);

              if (returnedQty < issuedQty) {
                fullyReturned = false;
              }
              if (returnedQty > 0 && returnedQty < issuedQty) {
                partiallyReturned = true;
              }
            }

            // Update status
            const newStatus = fullyReturned ? "RETURNED" : partiallyReturned ? "PARTIAL_RETURN" : outbound.status;
            
            if (newStatus !== outbound.status) {
              await db.goodsIssue.update({
                where: { id: outbound.id },
                data: { status: newStatus },
              });
            }
          }
        } catch (error) {
          console.error("Error updating outbound status:", error);
          // Don't fail the whole transaction if status update fails
        }
      }

      return {
        success: true,
        data: WarehouseInboundMapper.toDTO(result),
      };
    } catch (error) {
      console.error("Error creating inbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat transaksi barang masuk",
      };
    }
  }

  /**
   * Create new item + inbound in one transaction
   */
  async createNewItemInbound(
    input: CreateNewItemInboundInput,
    createdById: string
  ): Promise<{ success: boolean; data?: WarehouseInboundDTO; error?: string }> {
    try {
      // 1. Validate warehouse
      const warehouse = await db.warehouse.findUnique({
        where: { id: input.warehouseId },
      });

      if (!warehouse || !warehouse.isActive) {
        return { success: false, error: "Gudang tidak valid" };
      }

      // 2. Check SKU uniqueness
      const existingItem = await this.itemRepo.findBySKU(input.newItem.sku);
      if (existingItem) {
        return { success: false, error: `SKU "${input.newItem.sku}" sudah digunakan` };
      }

      // 3. Create item and inbound in transaction
      const result = await db.$transaction(async (tx) => {
        // Create new item
        const newItem = await tx.item.create({
          data: {
            sku: input.newItem.sku,
            name: input.newItem.name,
            description: input.newItem.description,
            categoryId: input.newItem.categoryId,
            itemTypeId: input.newItem.itemTypeId,
            baseUnitId: input.newItem.baseUnitId,
            defaultIssueUnitId: input.newItem.defaultIssueUnitId,
            valuationMethod: input.newItem.valuationMethod ?? "AVERAGE",
            minStock: input.newItem.minStock ?? 0,
            maxStock: input.newItem.maxStock ?? 0,
            isActive: true,
          },
        });

        // Generate inbound doc number
        const docNumber = await this.repo.generateDocNumber(
          warehouse.code,
          new Date(input.date)
        );

        // Create inbound document
        const inbound = await this.repo.create(
          {
            docNumber,
            date: new Date(input.date),
            warehouse: { connect: { id: input.warehouseId } },
            sourceType: "NEW_ITEM",
            note: input.note ?? `Barang baru: ${newItem.name}`,
            createdById,
          },
          [
            {
              itemId: newItem.id,
              unitId: newItem.baseUnitId,
              qty: input.qty,
              unitCost: input.unitCost,
              note: "Stok awal barang baru",
            },
          ]
        );

        // Create stock balance
        await tx.stockBalance.create({
          data: {
            itemId: newItem.id,
            warehouseId: input.warehouseId,
            binId: input.binId ?? null,
            qtyOnHand: input.qty,
            avgCost: input.unitCost,
          },
        });

        // Create stock ledger
        await tx.stockLedger.create({
          data: {
            itemId: newItem.id,
            warehouseId: input.warehouseId,
            binId: input.binId ?? null,
            referenceType: "IN",
            referenceId: inbound.id,
            qtyDelta: input.qty,
            unitCost: input.unitCost,
            note: "Stok awal barang baru",
            createdById,
          },
        });

        return inbound;
      });

      return {
        success: true,
        data: WarehouseInboundMapper.toDTO(result),
      };
    } catch (error) {
      console.error("Error creating new item inbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat barang baru",
      };
    }
  }

  /**
   * Get inbound by ID
   */
  async getInboundById(id: string): Promise<{ success: boolean; data?: WarehouseInboundDTO; error?: string }> {
    try {
      const inbound = await this.repo.findById(id);
      if (!inbound) {
        return { success: false, error: "Transaksi tidak ditemukan" };
      }

      return {
        success: true,
        data: WarehouseInboundMapper.toDTO(inbound),
      };
    } catch (error) {
      console.error("Error getting inbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil data",
      };
    }
  }

  /**
   * Get inbounds with pagination
   */
  async getInbounds(query: WarehouseInboundQuery): Promise<{
    success: boolean;
    data?: WarehouseInboundDTO[];
    meta?: { page: number; limit: number; total: number; totalPages: number };
    error?: string;
  }> {
    try {
      const result = await this.repo.findManyWithPagination({
        search: query.search,
        warehouseId: query.warehouseId,
        sourceType: query.sourceType,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true,
        data: WarehouseInboundMapper.toDTOList(result.data),
        meta: result.meta,
      };
    } catch (error) {
      console.error("Error getting inbounds:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal mengambil data",
      };
    }
  }

  /**
   * Delete inbound transaction
   */
  async deleteInbound(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return { success: false, error: "Transaksi tidak ditemukan" };
      }

      // TODO: Add validation - can't delete if referenced
      await this.repo.delete(id);

      return { success: true };
    } catch (error) {
      console.error("Error deleting inbound:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal menghapus transaksi",
      };
    }
  }

  /**
   * Process loan return
   */
  async processLoanReturn(
    input: CreateLoanReturnInput,
    createdById: string,
    companyId: string
  ): Promise<{ success: boolean; data?: WarehouseInboundDTO; error?: string }> {
    try {
      // 1. Validate loan issue exists
      const loanIssue = await db.goodsIssue.findUnique({
        where: { id: input.loanIssueId },
        include: {
          lines: {
            include: {
              item: true,
              unit: true,
            },
          },
          warehouse: true,
        },
      });

      if (!loanIssue) {
        return { success: false, error: "Transaksi peminjaman tidak ditemukan" };
      }

      if (loanIssue.purpose !== "LOAN") {
        return { success: false, error: "Transaksi ini bukan peminjaman" };
      }

      // 2. Validate warehouse
      const warehouse = await db.warehouse.findUnique({
        where: { id: input.warehouseId },
      });

      if (!warehouse) {
        return { success: false, error: "Gudang tidak ditemukan" };
      }

      // 3. Validate return quantities
      for (const returnLine of input.lines) {
        const loanLine = loanIssue.lines.find((l) => l.id === returnLine.loanIssueLineId);
        if (!loanLine) {
          return {
            success: false,
            error: `Line peminjaman tidak ditemukan: ${returnLine.loanIssueLineId}`,
          };
        }

        const qtyLoaned = Number(loanLine.qty);
        const qtyAlreadyReturned = Number(loanLine.qtyReturned);
        const qtyAvailableToReturn = qtyLoaned - qtyAlreadyReturned;

        if (returnLine.qtyReturned > qtyAvailableToReturn) {
          return {
            success: false,
            error: `Jumlah pengembalian ${loanLine.item.name} melebihi yang dipinjam (tersisa: ${qtyAvailableToReturn})`,
          };
        }
      }

      // 4. Generate document number
      const docNumber = await this.repo.generateDocNumber(
        warehouse.code,
        new Date(input.date)
      );

      // 5. Process return in transaction
      const result = await db.$transaction(async (tx) => {
        let totalReturnValue = 0;
        let totalLoanValue = 0;

        // Create inbound document for loan return
        const inbound = await this.repo.create(
          {
            docNumber,
            date: new Date(input.date),
            warehouse: { connect: { id: input.warehouseId } },
            sourceType: "LOAN_RETURN",
            sourceRef: loanIssue.docNumber,
            loanIssueId: input.loanIssueId,
            note: input.note,
            glStatus: "PENDING",
            createdById,
          },
          [] // Lines will be added separately
        );

        // Process each return line
        for (const returnLine of input.lines) {
          const loanLine = loanIssue.lines.find((l) => l.id === returnLine.loanIssueLineId);
          if (!loanLine) continue;

          const item = loanLine.item;
          const unit = loanLine.unit;

          // Convert to base unit
          const qtyInBaseUnit = returnLine.qtyReturned * Number(unit.conversionToBase);
          const unitCost = Number(loanLine.unitCost) || 0;
          const lineValue = qtyInBaseUnit * unitCost;
          totalReturnValue += lineValue;

          // Calculate total loan value for this line
          const loanedQtyInBaseUnit = Number(loanLine.qty) * Number(unit.conversionToBase);
          totalLoanValue += loanedQtyInBaseUnit * unitCost;

          // Create inbound line
          await tx.goodsReceiptLine.create({
            data: {
              receiptId: inbound.id,
              itemId: item.id,
              unitId: unit.id,
              qty: returnLine.qtyReturned,
              unitCost,
              loanIssueLineId: returnLine.loanIssueLineId,
              note: returnLine.note,
            },
          });

          // Update loan line qtyReturned
          const newQtyReturned = Number(loanLine.qtyReturned) + returnLine.qtyReturned;
          await tx.goodsIssueLine.update({
            where: { id: returnLine.loanIssueLineId },
            data: { qtyReturned: newQtyReturned },
          });

          // Update stock balance
          const stockBalance = await tx.stockBalance.findFirst({
            where: {
              itemId: item.id,
              warehouseId: input.warehouseId,
            },
          });

          if (stockBalance) {
            const newQty = Number(stockBalance.qtyOnHand) + qtyInBaseUnit;
            await tx.stockBalance.update({
              where: { id: stockBalance.id },
              data: { qtyOnHand: newQty },
            });
          } else {
            await tx.stockBalance.create({
              data: {
                itemId: item.id,
                warehouseId: input.warehouseId,
                qtyOnHand: qtyInBaseUnit,
                avgCost: unitCost,
              },
            });
          }

          // Create stock ledger entry
          await tx.stockLedger.create({
            data: {
              itemId: item.id,
              warehouseId: input.warehouseId,
              referenceType: "IN",
              referenceId: inbound.id,
              qtyDelta: qtyInBaseUnit,
              unitCost,
              note: `Pengembalian barang pinjaman: ${loanIssue.docNumber}`,
              createdById,
            },
          });
        }

        // Calculate loss value (items not returned)
        const totalLossValue = totalLoanValue - totalReturnValue;

        // Update loan issue status
        const allLinesReturned = loanIssue.lines.every((line) => {
          const returnLine = input.lines.find((r) => r.loanIssueLineId === line.id);
          const newQtyReturned = Number(line.qtyReturned) + (returnLine?.qtyReturned || 0);
          return newQtyReturned >= Number(line.qty);
        });

        if (allLinesReturned) {
          await tx.goodsIssue.update({
            where: { id: input.loanIssueId },
            data: {
              status: "RETURNED",
              isLoanFullyReturned: true,
            },
          });
        } else {
          await tx.goodsIssue.update({
            where: { id: input.loanIssueId },
            data: {
              status: "PARTIAL_RETURN",
            },
          });
        }

        // Post GL for loan return
        try {
          const glLines = await this.glService.buildLoanReturnGLLines({
            companyId,
            returnValue: totalReturnValue,
            lossValue: totalLossValue > 0 ? totalLossValue : 0,
            warehouseId: input.warehouseId,
          });

          const glResult = await this.glService.postJournalEntry(
            {
              companyId,
              date: new Date(input.date),
              sourceType: "GoodsReceipt",
              sourceId: inbound.id,
              sourceNumber: docNumber,
              memo: `Pengembalian barang pinjaman dari ${loanIssue.docNumber}`,
              createdById,
            },
            glLines
          );

          if (glResult.success) {
            await tx.goodsReceipt.update({
              where: { id: inbound.id },
              data: {
                glStatus: "POSTED",
                glPostedAt: new Date(),
                glEntryId: glResult.journalEntryId,
              },
            });
          } else {
            console.error("❌ GL posting failed:", glResult.error);
            await tx.goodsReceipt.update({
              where: { id: inbound.id },
              data: { glStatus: "FAILED" },
            });
          }
        } catch (glError) {
          console.error("❌ GL posting error:", glError);
          await tx.goodsReceipt.update({
            where: { id: inbound.id },
            data: { glStatus: "FAILED" },
          });
        }

        return inbound;
      });

      return {
        success: true,
        data: WarehouseInboundMapper.toDTO(result),
      };
    } catch (error) {
      console.error("Error processing loan return:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Gagal memproses pengembalian",
      };
    }
  }
}
