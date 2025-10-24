/**
 * Stock Service
 * Business logic for managing stock balances and stock ledger
 */

import { db } from "~/server/db";
import type { InitialStockInput } from "~/server/schemas/pt-pks/item";

export class StockService {
  /**
   * Add initial stock for new item
   */
  async addInitialStock(
    itemId: string,
    stockData: InitialStockInput,
    createdById: string,
  ): Promise<void> {
    if (stockData.quantity <= 0) {
      return; // Skip if no quantity
    }

    // Validate warehouse exists
    const warehouse = await db.warehouse.findUnique({
      where: { id: stockData.warehouseId },
    });

    if (!warehouse) {
      throw new Error("Gudang tidak ditemukan");
    }

    // Validate bin exists if provided
    if (stockData.binId) {
      const bin = await db.bin.findUnique({
        where: { id: stockData.binId },
      });

      if (!bin || bin.warehouseId !== stockData.warehouseId) {
        throw new Error("Bin tidak ditemukan atau tidak sesuai dengan gudang");
      }
    }

    // Insert/update stock balance
    await db.stockBalance.upsert({
      where: {
        itemId_warehouseId_binId: {
          itemId,
          warehouseId: stockData.warehouseId,
          binId: (stockData.binId ?? null) as any,
        },
      },
      update: {
        qtyOnHand: { increment: stockData.quantity },
        avgCost: stockData.unitCost,
      },
      create: {
        itemId,
        warehouseId: stockData.warehouseId,
        binId: stockData.binId ?? null,
        qtyOnHand: stockData.quantity,
        avgCost: stockData.unitCost,
      },
    });

    // Record in stock ledger
    await db.stockLedger.create({
      data: {
        itemId,
        warehouseId: stockData.warehouseId,
        binId: stockData.binId ?? null,
        referenceType: "ADJ",
        referenceId: "INITIAL_STOCK",
        qtyDelta: stockData.quantity,
        unitCost: stockData.unitCost,
        note: "Stok awal saat tambah barang",
        createdById,
      },
    });
  }

  /**
   * Get stock balance by item and location
   */
  async getStockBalance(
    itemId: string,
    warehouseId: string,
    binId?: string,
  ): Promise<{
    qtyOnHand: number;
    avgCost: number;
  } | null> {
    const stockBalance = await db.stockBalance.findUnique({
      where: {
        itemId_warehouseId_binId: {
          itemId,
          warehouseId,
          binId: (binId ?? null) as any,
        },
      },
    });

    if (!stockBalance) {
      return null;
    }

    return {
      qtyOnHand: Number(stockBalance.qtyOnHand),
      avgCost: Number(stockBalance.avgCost),
    };
  }

  /**
   * Get all stock balances for an item
   */
  async getItemStockBalances(itemId: string): Promise<Array<{
    warehouseId: string;
    warehouseName: string;
    binId: string | null;
    binName: string | null;
    qtyOnHand: number;
    avgCost: number;
  }>> {
    const stockBalances = await db.stockBalance.findMany({
      where: { itemId },
      include: {
        warehouse: { select: { name: true } },
        bin: { select: { name: true } },
      },
    });

    return stockBalances.map((sb: any) => ({
      warehouseId: sb.warehouseId,
      warehouseName: sb.warehouse.name,
      binId: sb.binId,
      binName: sb.bin?.name ?? null,
      qtyOnHand: Number(sb.qtyOnHand),
      avgCost: Number(sb.avgCost),
    }));
  }

  /**
   * Get stock ledger entries for an item
   */
  async getItemStockLedger(
    itemId: string,
    options?: {
      warehouseId?: string;
      binId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Array<{
    id: string;
    ts: Date;
    warehouseName: string;
    binName: string | null;
    referenceType: string;
    referenceId: string;
    qtyDelta: number;
    unitCost: number | null;
    note: string | null;
  }>> {
    const where: any = { itemId };
    
    if (options?.warehouseId) {
      where.warehouseId = options.warehouseId;
    }
    
    if (options?.binId !== undefined) {
      where.binId = options.binId;
    }

    const ledgerEntries = await db.stockLedger.findMany({
      where,
      include: {
        warehouse: { select: { name: true } },
        bin: { select: { name: true } },
      },
      orderBy: { ts: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return ledgerEntries.map((entry: any) => ({
      id: entry.id,
      ts: entry.ts,
      warehouseName: entry.warehouse.name,
      binName: entry.bin?.name ?? null,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
      qtyDelta: Number(entry.qtyDelta),
      unitCost: entry.unitCost ? Number(entry.unitCost) : null,
      note: entry.note,
    }));
  }

  /**
   * Validate stock availability before issue
   */
  async validateStockAvailability(
    itemId: string,
    warehouseId: string,
    binId: string | null,
    requiredQty: number,
  ): Promise<{ available: boolean; currentQty: number }> {
    const stockBalance = await this.getStockBalance(itemId, warehouseId, binId ?? undefined);
    
    if (!stockBalance) {
      return { available: false, currentQty: 0 };
    }

    return {
      available: stockBalance.qtyOnHand >= requiredQty,
      currentQty: stockBalance.qtyOnHand,
    };
  }
}
