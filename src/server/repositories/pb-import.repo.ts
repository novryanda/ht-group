/**
 * PB Import Repository
 * Database operations for PB Import module
 */

import { db } from "~/server/db";
import type { Prisma, ImportStatus } from "@prisma/client";
import type { 
  PbImportBatchEntity, 
  PbImportRowEntity,
  PbTicketEntity,
  CreatePbImportRowInput,
  CreatePbTicketInput,
  ListBatchesQuery,
  ListRowsQuery,
} from "~/server/types/pb-import";

// ============================================================================
// PB IMPORT BATCH REPOSITORY
// ============================================================================

export class PbImportBatchRepository {
  /**
   * Create a new import batch
   */
  static async create(data: {
    fileName: string;
    fileHash: string;
    periodFrom?: Date | null;
    periodTo?: Date | null;
    printedAt?: Date | null;
    note?: string | null;
    createdById?: string | null;
  }): Promise<PbImportBatchEntity> {
    return db.pbImportBatch.create({
      data: {
        fileName: data.fileName,
        fileHash: data.fileHash,
        periodFrom: data.periodFrom,
        periodTo: data.periodTo,
        printedAt: data.printedAt,
        note: data.note,
        createdById: data.createdById,
        status: "DRAFT",
      },
    });
  }

  /**
   * Find batch by ID
   */
  static async findById(id: string) {
    return db.pbImportBatch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rows: true,
            tickets: true,
          },
        },
      },
    });
  }

  /**
   * Find batch by file hash (for idempotency check)
   */
  static async findByFileHash(fileHash: string) {
    return db.pbImportBatch.findUnique({
      where: { fileHash },
      include: {
        _count: {
          select: {
            rows: true,
            tickets: true,
          },
        },
      },
    });
  }

  /**
   * List batches with pagination and filters
   */
  static async findMany(query: ListBatchesQuery) {
    const { page, pageSize, status, search, sortBy, sortDir } = query;

    const where: Prisma.PbImportBatchWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
        { note: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [batches, total] = await Promise.all([
      db.pbImportBatch.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortDir },
        include: {
          _count: {
            select: {
              rows: true,
              tickets: true,
            },
          },
        },
      }),
      db.pbImportBatch.count({ where }),
    ]);

    return {
      batches,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Update batch status to POSTED
   */
  static async markAsPosted(id: string): Promise<PbImportBatchEntity> {
    return db.pbImportBatch.update({
      where: { id },
      data: {
        status: "POSTED",
        postedAt: new Date(),
      },
    });
  }

  /**
   * Delete batch (cascade will delete rows)
   */
  static async delete(id: string) {
    return db.pbImportBatch.delete({
      where: { id },
    });
  }
}

// ============================================================================
// PB IMPORT ROW REPOSITORY
// ============================================================================

export class PbImportRowRepository {
  /**
   * Create multiple rows (bulk insert with upsert by uniqueKey)
   */
  static async createMany(rows: CreatePbImportRowInput[]) {
    // Use transaction for bulk insert
    return db.$transaction(
      rows.map((row) =>
        db.pbImportRow.upsert({
          where: { uniqueKey: row.uniqueKey },
          create: {
            batchId: row.batchId,
            sheetName: row.sheetName,
            rowIndex: row.rowIndex,
            noSeri: row.noSeri,
            noPolisi: row.noPolisi,
            namaRelasi: row.namaRelasi,
            produk: row.produk,
            timbang1Kg: row.timbang1Kg,
            timbang2Kg: row.timbang2Kg,
            netto1Kg: row.netto1Kg,
            potPct: row.potPct,
            potKg: row.potKg,
            terimaKg: row.terimaKg,
            harga: row.harga,
            total: row.total,
            pph: row.pph,
            totalPay: row.totalPay,
            tanggal: row.tanggal,
            jamMasuk: row.jamMasuk,
            jamKeluar: row.jamKeluar,
            lokasiKebun: row.lokasiKebun,
            payeeName: row.payeeName,
            bankName: row.bankName,
            accountNo: row.accountNo,
            penimbang: row.penimbang,
            supplierId: row.supplierId,
            vehicleId: row.vehicleId,
            uniqueKey: row.uniqueKey,
          },
          update: {}, // Don't update if exists (idempotent)
        })
      )
    );
  }

  /**
   * Find rows by batch ID with pagination
   */
  static async findByBatchId(batchId: string, query: ListRowsQuery) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const [rows, total] = await Promise.all([
      db.pbImportRow.findMany({
        where: { batchId },
        skip,
        take: pageSize,
        orderBy: { createdAt: "asc" },
      }),
      db.pbImportRow.count({ where: { batchId } }),
    ]);

    return {
      rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get all rows for a batch (for validation/commit)
   */
  static async getAllByBatchId(batchId: string): Promise<PbImportRowEntity[]> {
    return db.pbImportRow.findMany({
      where: { batchId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Update row mappings (supplier/vehicle)
   */
  static async updateMappings(
    items: Array<{ rowId: string; supplierId?: string; vehicleId?: string }>
  ) {
    return db.$transaction(
      items.map((item) =>
        db.pbImportRow.update({
          where: { id: item.rowId },
          data: {
            supplierId: item.supplierId,
            vehicleId: item.vehicleId,
          },
        })
      )
    );
  }

  /**
   * Find row by ID
   */
  static async findById(id: string) {
    return db.pbImportRow.findUnique({
      where: { id },
    });
  }

  /**
   * Count rows by batch ID
   */
  static async countByBatchId(batchId: string) {
    return db.pbImportRow.count({
      where: { batchId },
    });
  }
}

// ============================================================================
// PB TICKET REPOSITORY
// ============================================================================

export class PbTicketRepository {
  /**
   * Create a ticket from validated row
   */
  static async create(data: CreatePbTicketInput): Promise<PbTicketEntity> {
    return db.pbTicket.create({
      data: {
        batchId: data.batchId,
        rowId: data.rowId,
        sheetName: data.sheetName,
        date: data.date,
        ticketNo: data.ticketNo,
        vehiclePlate: data.vehiclePlate,
        supplierId: data.supplierId,
        cluster: data.cluster,
        wbInAt: data.wbInAt,
        wbOutAt: data.wbOutAt,
        grossKg: data.grossKg,
        tareKg: data.tareKg,
        netto1Kg: data.netto1Kg,
        potPct: data.potPct,
        potKg: data.potKg,
        receiveKg: data.receiveKg,
        price: data.price,
        total: data.total,
        pph: data.pph,
        totalPay: data.totalPay,
        payeeName: data.payeeName,
        bankName: data.bankName,
        accountNo: data.accountNo,
        weigherName: data.weigherName,
      },
    });
  }

  /**
   * Create multiple tickets in transaction
   */
  static async createMany(tickets: CreatePbTicketInput[]) {
    return db.$transaction(
      tickets.map((ticket) =>
        db.pbTicket.create({ data: ticket })
      )
    );
  }

  /**
   * Find tickets by batch ID
   */
  static async findByBatchId(batchId: string) {
    return db.pbTicket.findMany({
      where: { batchId },
      orderBy: { date: "asc" },
    });
  }

  /**
   * Get summary statistics for batch
   */
  static async getSummaryByBatchId(batchId: string) {
    const result = await db.pbTicket.aggregate({
      where: { batchId },
      _sum: {
        receiveKg: true,
        pph: true,
        totalPay: true,
      },
      _count: true,
    });

    return {
      count: result._count,
      totalReceiveKg: result._sum.receiveKg ?? 0,
      totalPph: result._sum.pph ?? 0,
      totalPay: result._sum.totalPay ?? 0,
    };
  }
}

