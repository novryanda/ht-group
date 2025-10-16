import { db } from "~/server/db";
import { Decimal } from "@prisma/client/runtime/library";
import { type LedgerType } from "@prisma/client";
import { StockRepository, StockLedgerRepository } from "~/server/repositories/stock.repo";
import type { OpeningBalanceLineDTO } from "~/server/types/inventory";

// ============================================================================
// STOCK SERVICE - Atomic Stock Operations
// ============================================================================

export class StockService {
  /**
   * Increase stock (atomic operation with ledger)
   * Used for: GRN, Transfer IN, Adjustment IN, Opening Balance
   */
  static async increase(
    materialId: string,
    locationId: string,
    qty: number,
    ledgerType: LedgerType,
    refTable?: string,
    refId?: string,
    note?: string
  ) {
    return db.$transaction(async (tx) => {
      // Get current stock
      const currentStock = await tx.stock.findUnique({
        where: {
          materialId_locationId: { materialId, locationId },
        },
      });

      const beforeQty = currentStock?.qtyOnHand ?? new Decimal(0);
      const afterQty = beforeQty.add(new Decimal(qty));

      // Upsert stock
      await tx.stock.upsert({
        where: {
          materialId_locationId: { materialId, locationId },
        },
        create: {
          materialId,
          locationId,
          qtyOnHand: afterQty,
        },
        update: {
          qtyOnHand: afterQty,
        },
      });

      // Create ledger entry
      await tx.stockLedger.create({
        data: {
          materialId,
          locationId,
          ledgerType,
          qty: new Decimal(qty),
          beforeQty,
          afterQty,
          refTable,
          refId,
          note,
        },
      });

      return { beforeQty: beforeQty.toNumber(), afterQty: afterQty.toNumber() };
    });
  }

  /**
   * Decrease stock (atomic operation with ledger)
   * Used for: Issue, Transfer OUT, Adjustment OUT
   * Throws error if insufficient stock
   */
  static async decrease(
    materialId: string,
    locationId: string,
    qty: number,
    ledgerType: LedgerType,
    refTable?: string,
    refId?: string,
    note?: string
  ) {
    return db.$transaction(async (tx) => {
      // Get current stock
      const currentStock = await tx.stock.findUnique({
        where: {
          materialId_locationId: { materialId, locationId },
        },
      });

      if (!currentStock) {
        throw new Error(`STOCK_NOT_FOUND: Material ${materialId} tidak ditemukan di lokasi ${locationId}`);
      }

      const beforeQty = currentStock.qtyOnHand;
      const afterQty = beforeQty.sub(new Decimal(qty));

      // Check if sufficient stock
      if (afterQty.isNegative()) {
        throw new Error(
          `STOCK_INSUFFICIENT: Stok tidak mencukupi. Tersedia: ${beforeQty.toNumber()}, Diminta: ${qty}`
        );
      }

      // Update stock
      await tx.stock.update({
        where: {
          materialId_locationId: { materialId, locationId },
        },
        data: {
          qtyOnHand: afterQty,
        },
      });

      // Create ledger entry
      await tx.stockLedger.create({
        data: {
          materialId,
          locationId,
          ledgerType,
          qty: new Decimal(-qty), // Negative for decrease
          beforeQty,
          afterQty,
          refTable,
          refId,
          note,
        },
      });

      return { beforeQty: beforeQty.toNumber(), afterQty: afterQty.toNumber() };
    });
  }

  /**
   * Transfer stock between locations (atomic operation)
   * Creates 2 ledger entries: OUT from source, IN to destination
   */
  static async transfer(
    fromLocId: string,
    toLocId: string,
    materialId: string,
    qty: number,
    refTable: string,
    refId: string,
    note?: string
  ) {
    return db.$transaction(async (tx) => {
      // Decrease from source location
      const fromStock = await tx.stock.findUnique({
        where: {
          materialId_locationId: { materialId, locationId: fromLocId },
        },
      });

      if (!fromStock) {
        throw new Error(`STOCK_NOT_FOUND: Material ${materialId} tidak ditemukan di lokasi asal`);
      }

      const fromBeforeQty = fromStock.qtyOnHand;
      const fromAfterQty = fromBeforeQty.sub(new Decimal(qty));

      if (fromAfterQty.isNegative()) {
        throw new Error(
          `STOCK_INSUFFICIENT: Stok tidak mencukupi di lokasi asal. Tersedia: ${fromBeforeQty.toNumber()}, Diminta: ${qty}`
        );
      }

      await tx.stock.update({
        where: {
          materialId_locationId: { materialId, locationId: fromLocId },
        },
        data: {
          qtyOnHand: fromAfterQty,
        },
      });

      // Create OUT ledger
      await tx.stockLedger.create({
        data: {
          materialId,
          locationId: fromLocId,
          ledgerType: "OUT_TRANSFER",
          qty: new Decimal(-qty),
          beforeQty: fromBeforeQty,
          afterQty: fromAfterQty,
          refTable,
          refId,
          note,
        },
      });

      // Increase to destination location
      const toStock = await tx.stock.findUnique({
        where: {
          materialId_locationId: { materialId, locationId: toLocId },
        },
      });

      const toBeforeQty = toStock?.qtyOnHand ?? new Decimal(0);
      const toAfterQty = toBeforeQty.add(new Decimal(qty));

      await tx.stock.upsert({
        where: {
          materialId_locationId: { materialId, locationId: toLocId },
        },
        create: {
          materialId,
          locationId: toLocId,
          qtyOnHand: toAfterQty,
        },
        update: {
          qtyOnHand: toAfterQty,
        },
      });

      // Create IN ledger
      await tx.stockLedger.create({
        data: {
          materialId,
          locationId: toLocId,
          ledgerType: "IN_TRANSFER",
          qty: new Decimal(qty),
          beforeQty: toBeforeQty,
          afterQty: toAfterQty,
          refTable,
          refId,
          note,
        },
      });

      return {
        from: { beforeQty: fromBeforeQty.toNumber(), afterQty: fromAfterQty.toNumber() },
        to: { beforeQty: toBeforeQty.toNumber(), afterQty: toAfterQty.toNumber() },
      };
    });
  }

  /**
   * Post opening balance (batch operation)
   */
  static async postOpeningBalance(lines: OpeningBalanceLineDTO[]) {
    return db.$transaction(async (tx) => {
      const results = [];

      for (const line of lines) {
        const { materialId, locationId, qty, note } = line;

        // Check if stock already exists
        const existingStock = await tx.stock.findUnique({
          where: {
            materialId_locationId: { materialId, locationId },
          },
        });

        if (existingStock && existingStock.qtyOnHand.toNumber() > 0) {
          throw new Error(
            `OPENING_BALANCE_EXISTS: Saldo awal sudah ada untuk material ${materialId} di lokasi ${locationId}`
          );
        }

        const afterQty = new Decimal(qty);

        // Upsert stock
        await tx.stock.upsert({
          where: {
            materialId_locationId: { materialId, locationId },
          },
          create: {
            materialId,
            locationId,
            qtyOnHand: afterQty,
          },
          update: {
            qtyOnHand: afterQty,
          },
        });

        // Create ledger entry
        await tx.stockLedger.create({
          data: {
            materialId,
            locationId,
            ledgerType: "IN_OPENING",
            qty: afterQty,
            beforeQty: new Decimal(0),
            afterQty,
            refTable: "OPENING_BALANCE",
            note,
          },
        });

        results.push({ materialId, locationId, qty });
      }

      return results;
    });
  }

  /**
   * Post stock count differences (batch operation)
   * Creates COUNT_DIFF_IN or COUNT_DIFF_OUT ledger entries
   */
  static async postStockCountDiff(
    lines: Array<{
      materialId: string;
      locationId: string;
      countedQty: number;
      systemQty: number;
      note?: string;
    }>,
    refId: string
  ) {
    return db.$transaction(async (tx) => {
      const results = [];

      for (const line of lines) {
        const { materialId, locationId, countedQty, systemQty, note } = line;
        const diffQty = countedQty - systemQty;

        if (diffQty === 0) {
          // No difference, skip
          continue;
        }

        const ledgerType: LedgerType = diffQty > 0 ? "COUNT_DIFF_IN" : "COUNT_DIFF_OUT";
        const beforeQty = new Decimal(systemQty);
        const afterQty = new Decimal(countedQty);

        // Update stock
        await tx.stock.update({
          where: {
            materialId_locationId: { materialId, locationId },
          },
          data: {
            qtyOnHand: afterQty,
          },
        });

        // Create ledger entry
        await tx.stockLedger.create({
          data: {
            materialId,
            locationId,
            ledgerType,
            qty: new Decimal(diffQty),
            beforeQty,
            afterQty,
            refTable: "STOCK_COUNT",
            refId,
            note,
          },
        });

        results.push({ materialId, locationId, diffQty });
      }

      return results;
    });
  }
}

