/**
 * Repository for Weighbridge Ticket
 * Data access layer with Prisma
 */

import { db } from "~/server/db";
import type { Prisma, WeighbridgeTicket } from "@prisma/client";

export class WeighbridgeRepository {
  /**
   * Find tickets with filters and pagination
   */
  static async findMany(params: {
    companyId: string;
    startDate?: Date;
    endDate?: Date;
    supplierId?: string;
    vehicleId?: string;
    itemId?: string;
    status?: "DRAFT" | "APPROVED" | "POSTED";
    skip: number;
    take: number;
  }) {
    const where: Prisma.WeighbridgeTicketWhereInput = {
      companyId: params.companyId,
      ...(params.startDate &&
        params.endDate && {
          tanggal: {
            gte: params.startDate,
            lte: params.endDate,
          },
        }),
      ...(params.supplierId && { supplierId: params.supplierId }),
      ...(params.vehicleId && { vehicleId: params.vehicleId }),
      ...(params.itemId && { itemId: params.itemId }),
      ...(params.status && { status: params.status }),
    };

    const [tickets, total] = await Promise.all([
      db.weighbridgeTicket.findMany({
        where,
        include: {
          vehicle: {
            include: {
              transporter: true,
            },
          },
          supplier: true,
          item: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [{ tanggal: "desc" }, { noSeri: "desc" }],
        skip: params.skip,
        take: params.take,
      }),
      db.weighbridgeTicket.count({ where }),
    ]);

    return { tickets, total };
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string) {
    return db.weighbridgeTicket.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            transporter: true,
          },
        },
        supplier: true,
        item: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  /**
   * Find by noSeri and companyId
   */
  static async findByNoSeri(companyId: string, noSeri: string) {
    return db.weighbridgeTicket.findUnique({
      where: {
        companyId_noSeri: {
          companyId,
          noSeri,
        },
      },
    });
  }

  /**
   * Create single ticket (Phase 1: PB Harian)
   */
  static async create(
    data: Prisma.WeighbridgeTicketCreateInput
  ): Promise<WeighbridgeTicket> {
    return db.weighbridgeTicket.create({
      data,
      include: {
        vehicle: true,
        supplier: true,
        item: true,
      },
    });
  }

  /**
   * Bulk create tickets (Phase 1: PB Harian)
   */
  static async createMany(
    data: Prisma.WeighbridgeTicketCreateManyInput[]
  ): Promise<{ count: number }> {
    return db.weighbridgeTicket.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Update pricing fields (Phase 2: Timbangan)
   */
  static async updatePricing(
    id: string,
    data: {
      hargaPerKg: number;
      pphRate: number;
      upahBongkarPerKg: number;
      total: number;
      totalPph: number;
      totalUpahBongkar: number;
      totalPembayaranSupplier: number;
    }
  ) {
    return db.weighbridgeTicket.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        supplier: true,
        item: true,
      },
    });
  }

  /**
   * Update status (for posting/approval)
   */
  static async updateStatus(
    id: string,
    status: "DRAFT" | "APPROVED" | "POSTED"
  ) {
    return db.weighbridgeTicket.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete ticket
   */
  static async delete(id: string) {
    return db.weighbridgeTicket.delete({
      where: { id },
    });
  }

  /**
   * Generate next serial number for a date
   */
  static async generateNoSeri(companyId: string, tanggal: Date): Promise<string> {
    const dateStr = tanggal.toISOString().split("T")[0]?.replace(/-/g, "") ?? "";
    
    // Find last ticket for the date
    const lastTicket = await db.weighbridgeTicket.findFirst({
      where: {
        companyId,
        tanggal: {
          gte: new Date(tanggal.setHours(0, 0, 0, 0)),
          lt: new Date(tanggal.setHours(23, 59, 59, 999)),
        },
      },
      orderBy: { noSeri: "desc" },
      select: { noSeri: true },
    });

    if (lastTicket) {
      // Extract sequence from last noSeri (format: YYYYMMDD-XXX)
      const parts = lastTicket.noSeri.split("-");
      const lastSeq = parts[1] ? parseInt(parts[1], 10) : 0;
      const nextSeq = lastSeq + 1;
      return `${dateStr}-${nextSeq.toString().padStart(3, "0")}`;
    }

    return `${dateStr}-001`;
  }

  // ============================================
  // Lookup helpers for dropdowns
  // ============================================

  static async getActiveVehicles() {
    return db.vehicle.findMany({
      include: {
        transporter: true,
      },
      orderBy: { plateNo: "asc" },
    });
  }

  static async getActiveSuppliers() {
    return db.supplierTBS.findMany({
      orderBy: { namaPemilik: "asc" },
    });
  }

  static async getActiveItems() {
    return db.item.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });
  }
}
