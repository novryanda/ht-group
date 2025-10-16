/**
 * Reports Repository
 * Data access layer for monthly reports
 */

import { db } from "~/server/db";
import type {
  PbImportMonthlySummary,
  PbImportDailyBreakdown,
  PbImportSupplierBreakdown,
  InventoryMonthlySummary,
  InventoryDocumentBreakdown,
  InventoryMaterialBreakdown,
} from "~/server/types/reports";
import { formatDate } from "~/server/lib/date-utils";

// ============================================================================
// PB IMPORT REPOSITORY
// ============================================================================

export class PbImportReportRepository {
  /**
   * Aggregate PB Import data for a given period
   */
  static async aggregateMonthly(params: {
    companyCode?: string;
    start: Date;
    end: Date;
  }): Promise<PbImportMonthlySummary> {
    const where = {
      date: { gte: params.start, lte: params.end },
      ...(params.companyCode && { 
        batch: { 
          createdById: params.companyCode 
        } 
      }),
    };

    const rows = await db.pbTicket.findMany({
      where,
      select: {
        receiveKg: true,
        potKg: true,
        netto1Kg: true,
        price: true,
        totalPay: true,
        pph: true,
      },
    });

    let totalTerima = 0;
    let totalPotKg = 0;
    let totalNetto = 0;
    let totalPay = 0;
    let totalPph = 0;
    let totalHarga = 0;
    let nHarga = 0;

    for (const r of rows) {
      totalTerima += Number(r.receiveKg ?? 0);
      totalPotKg += Number(r.potKg ?? 0);
      totalNetto += Number(r.netto1Kg ?? 0);
      totalPay += Number(r.totalPay ?? 0);
      totalPph += Number(r.pph ?? 0);
      if (r.price != null) {
        totalHarga += Number(r.price);
        nHarga++;
      }
    }

    return {
      count: rows.length,
      totalTerimaKg: totalTerima,
      totalPotKg,
      totalNettoKg: totalNetto,
      avgPrice: nHarga > 0 ? totalHarga / nHarga : 0,
      totalPayment: totalPay,
      totalPph,
    };
  }

  /**
   * Get daily breakdown of PB Import
   */
  static async getDailyBreakdown(params: {
    companyCode?: string;
    start: Date;
    end: Date;
  }): Promise<PbImportDailyBreakdown[]> {
    const where = {
      date: { gte: params.start, lte: params.end },
      ...(params.companyCode && { 
        batch: { 
          createdById: params.companyCode 
        } 
      }),
    };

    const rows = await db.pbTicket.findMany({
      where,
      select: {
        date: true,
        receiveKg: true,
        netto1Kg: true,
        totalPay: true,
      },
      orderBy: { date: "asc" },
    });

    // Group by date
    const grouped = new Map<string, PbImportDailyBreakdown>();

    for (const row of rows) {
      const dateKey = formatDate(row.date);
      const existing = grouped.get(dateKey);

      if (existing) {
        existing.count++;
        existing.totalTerimaKg += Number(row.receiveKg ?? 0);
        existing.totalNettoKg += Number(row.netto1Kg ?? 0);
        existing.totalPayment += Number(row.totalPay ?? 0);
      } else {
        grouped.set(dateKey, {
          date: dateKey,
          count: 1,
          totalTerimaKg: Number(row.receiveKg ?? 0),
          totalNettoKg: Number(row.netto1Kg ?? 0),
          totalPayment: Number(row.totalPay ?? 0),
        });
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Get supplier breakdown of PB Import
   */
  static async getSupplierBreakdown(params: {
    companyCode?: string;
    start: Date;
    end: Date;
  }): Promise<PbImportSupplierBreakdown[]> {
    const where = {
      date: { gte: params.start, lte: params.end },
      ...(params.companyCode && { 
        batch: { 
          createdById: params.companyCode 
        } 
      }),
    };

    const rows = await db.pbTicket.findMany({
      where,
      select: {
        supplierId: true,
        receiveKg: true,
        netto1Kg: true,
        totalPay: true,
        row: {
          select: {
            namaRelasi: true,
          },
        },
      },
    });

    // Group by supplier
    const grouped = new Map<string, PbImportSupplierBreakdown>();

    for (const row of rows) {
      const supplierId = row.supplierId ?? "UNKNOWN";
      const supplierName = row.row?.namaRelasi ?? "Unknown Supplier";
      const existing = grouped.get(supplierId);

      if (existing) {
        existing.count++;
        existing.totalTerimaKg += Number(row.receiveKg ?? 0);
        existing.totalNettoKg += Number(row.netto1Kg ?? 0);
        existing.totalPayment += Number(row.totalPay ?? 0);
      } else {
        grouped.set(supplierId, {
          supplierId,
          supplierName,
          count: 1,
          totalTerimaKg: Number(row.receiveKg ?? 0),
          totalNettoKg: Number(row.netto1Kg ?? 0),
          totalPayment: Number(row.totalPay ?? 0),
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalPayment - a.totalPayment);
  }
}

// ============================================================================
// INVENTORY REPOSITORY
// ============================================================================

export class InventoryReportRepository {
  /**
   * Aggregate inventory document counts for a given period
   */
  static async aggregateMonthly(params: {
    companyCode?: string;
    start: Date;
    end: Date;
  }): Promise<InventoryMonthlySummary> {
    const dateFilter = { gte: params.start, lte: params.end };

    const [grn, issue, transfer, adjust, scount] = await Promise.all([
      db.goodsReceipt.count({ where: { date: dateFilter } }),
      db.goodsIssue.count({ where: { date: dateFilter } }),
      db.stockTransfer.count({ where: { date: dateFilter } }),
      db.stockAdjustment.count({ where: { date: dateFilter } }),
      db.stockCount.count({ where: { date: dateFilter } }),
    ]);

    return {
      grn,
      issue,
      transfer,
      adjustment: adjust,
      count: scount,
    };
  }

  /**
   * Get daily breakdown of inventory documents
   */
  static async getDailyBreakdown(params: {
    companyCode?: string;
    start: Date;
    end: Date;
  }): Promise<InventoryDocumentBreakdown[]> {
    const dateFilter = { gte: params.start, lte: params.end };

    const [grnDocs, issueDocs, transferDocs, adjustDocs, countDocs] = await Promise.all([
      db.goodsReceipt.findMany({ where: { date: dateFilter }, select: { date: true } }),
      db.goodsIssue.findMany({ where: { date: dateFilter }, select: { date: true } }),
      db.stockTransfer.findMany({ where: { date: dateFilter }, select: { date: true } }),
      db.stockAdjustment.findMany({ where: { date: dateFilter }, select: { date: true } }),
      db.stockCount.findMany({ where: { date: dateFilter }, select: { date: true } }),
    ]);

    // Group by date
    const grouped = new Map<string, InventoryDocumentBreakdown>();

    const addToGroup = (date: Date, type: keyof Omit<InventoryDocumentBreakdown, "date">) => {
      const dateKey = formatDate(date);
      const existing = grouped.get(dateKey);

      if (existing) {
        existing[type]++;
      } else {
        grouped.set(dateKey, {
          date: dateKey,
          grn: type === "grn" ? 1 : 0,
          issue: type === "issue" ? 1 : 0,
          transfer: type === "transfer" ? 1 : 0,
          adjustment: type === "adjustment" ? 1 : 0,
          count: type === "count" ? 1 : 0,
        });
      }
    };

    grnDocs.forEach((doc) => addToGroup(doc.date, "grn"));
    issueDocs.forEach((doc) => addToGroup(doc.date, "issue"));
    transferDocs.forEach((doc) => addToGroup(doc.date, "transfer"));
    adjustDocs.forEach((doc) => addToGroup(doc.date, "adjustment"));
    countDocs.forEach((doc) => addToGroup(doc.date, "count"));

    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get material movement breakdown
   */
  static async getMaterialBreakdown(params: {
    companyCode?: string;
    start: Date;
    end: Date;
  }): Promise<InventoryMaterialBreakdown[]> {
    const ledgers = await db.stockLedger.findMany({
      where: {
        ts: { gte: params.start, lte: params.end },
      },
      select: {
        materialId: true,
        qty: true,
        ledgerType: true,
        material: {
          select: {
            name: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by material
    const grouped = new Map<string, InventoryMaterialBreakdown>();

    for (const ledger of ledgers) {
      const materialId = ledger.materialId;
      const existing = grouped.get(materialId);
      const qty = Number(ledger.qty);
      const isIn = ledger.ledgerType.startsWith("IN_");

      if (existing) {
        if (isIn) {
          existing.totalIn += qty;
        } else {
          existing.totalOut += qty;
        }
        existing.netChange = existing.totalIn - existing.totalOut;
      } else {
        grouped.set(materialId, {
          materialId,
          materialName: ledger.material?.name ?? "Unknown",
          categoryName: ledger.material?.category?.name ?? "Unknown",
          totalIn: isIn ? qty : 0,
          totalOut: isIn ? 0 : qty,
          netChange: isIn ? qty : -qty,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => Math.abs(b.netChange) - Math.abs(a.netChange));
  }
}

