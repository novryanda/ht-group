import { db } from "~/server/db";
import { Decimal } from "@prisma/client/runtime/library";
import {
  GoodsReceiptRepository,
  GoodsIssueRepository,
  StockTransferRepository,
  StockAdjustmentRepository,
  StockCountRepository,
} from "~/server/repositories/docs.repo";
import { StockService } from "~/server/services/stock.service";
import {
  GoodsReceiptMapper,
  GoodsIssueMapper,
  StockTransferMapper,
  StockAdjustmentMapper,
  StockCountMapper,
} from "~/server/mappers/inventory.mapper";
import {
  generateGrnCode,
  generateIssueCode,
  generateTransferCode,
  generateAdjustmentCode,
  generateCountCode,
  getCurrentYearMonth,
} from "~/server/lib/codegen";
import type {
  CreateGrnDTO,
  CreateIssueDTO,
  CreateTransferDTO,
  CreateAdjustmentDTO,
  CreateCountDTO,
  GoodsReceiptDTO,
  GoodsIssueDTO,
  StockTransferDTO,
  StockAdjustmentDTO,
  StockCountDTO,
  PaginatedResult,
} from "~/server/types/inventory";

// ============================================================================
// GOODS RECEIPT NOTE (GRN) SERVICE
// ============================================================================

export class GrnService {
  static async create(data: CreateGrnDTO): Promise<GoodsReceiptDTO> {
    // Generate GRN number
    const yearMonth = getCurrentYearMonth();
    const lastCode = await GoodsReceiptRepository.getLastReceiptNoForMonth(yearMonth);
    const receiptNo = generateGrnCode(lastCode);

    // Create GRN with stock updates in transaction
    const grn = await db.$transaction(async (tx) => {
      // Create GRN document
      const createdGrn = await GoodsReceiptRepository.create(receiptNo, data);

      // Update stock for each item
      for (const item of data.items) {
        await StockService.increase(
          item.materialId,
          item.locationId,
          item.qty,
          "IN_GRN",
          "GOODS_RECEIPT",
          createdGrn.id,
          item.note
        );
      }

      return createdGrn;
    });

    return GoodsReceiptMapper.toDTO(grn);
  }

  static async getById(id: string): Promise<GoodsReceiptDTO | null> {
    const grn = await GoodsReceiptRepository.findById(id);
    return grn ? GoodsReceiptMapper.toDTO(grn) : null;
  }

  static async getList(filter: {
    warehouseId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<GoodsReceiptDTO>> {
    const { grns, total } = await GoodsReceiptRepository.findMany(filter);
    return {
      data: GoodsReceiptMapper.toDTOList(grns),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }
}

// ============================================================================
// GOODS ISSUE SERVICE
// ============================================================================

export class GoodsIssueService {
  static async create(data: CreateIssueDTO): Promise<GoodsIssueDTO> {
    // Generate Issue number
    const yearMonth = getCurrentYearMonth();
    const lastCode = await GoodsIssueRepository.getLastIssueNoForMonth(yearMonth);
    const issueNo = generateIssueCode(lastCode);

    // Create Issue with stock updates in transaction
    const issue = await db.$transaction(async (tx) => {
      // Create Issue document
      const createdIssue = await GoodsIssueRepository.create(issueNo, data);

      // Update stock for each item (decrease)
      for (const item of data.items) {
        await StockService.decrease(
          item.materialId,
          item.locationId,
          item.qty,
          "OUT_ISSUE",
          "GOODS_ISSUE",
          createdIssue.id,
          item.note
        );
      }

      return createdIssue;
    });

    return GoodsIssueMapper.toDTO(issue);
  }

  static async getById(id: string): Promise<GoodsIssueDTO | null> {
    const issue = await GoodsIssueRepository.findById(id);
    return issue ? GoodsIssueMapper.toDTO(issue) : null;
  }

  static async getList(filter: {
    warehouseId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<GoodsIssueDTO>> {
    const { issues, total } = await GoodsIssueRepository.findMany(filter);
    return {
      data: GoodsIssueMapper.toDTOList(issues),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }
}

// ============================================================================
// STOCK TRANSFER SERVICE
// ============================================================================

export class StockTransferService {
  static async create(data: CreateTransferDTO): Promise<StockTransferDTO> {
    // Generate Transfer number
    const yearMonth = getCurrentYearMonth();
    const lastCode = await StockTransferRepository.getLastTransferNoForMonth(yearMonth);
    const transferNo = generateTransferCode(lastCode);

    // Create Transfer with stock updates in transaction
    const transfer = await db.$transaction(async (tx) => {
      // Create Transfer document
      const createdTransfer = await StockTransferRepository.create(transferNo, data);

      // Transfer stock
      await StockService.transfer(
        data.fromLocId,
        data.toLocId,
        data.materialId,
        data.qty,
        "STOCK_TRANSFER",
        createdTransfer.id,
        data.note
      );

      return createdTransfer;
    });

    return StockTransferMapper.toDTO(transfer);
  }

  static async getById(id: string): Promise<StockTransferDTO | null> {
    const transfer = await StockTransferRepository.findById(id);
    return transfer ? StockTransferMapper.toDTO(transfer) : null;
  }

  static async getList(filter: {
    materialId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<StockTransferDTO>> {
    const { transfers, total } = await StockTransferRepository.findMany(filter);
    return {
      data: StockTransferMapper.toDTOList(transfers),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }
}

// ============================================================================
// STOCK ADJUSTMENT SERVICE
// ============================================================================

export class StockAdjustmentService {
  static async create(data: CreateAdjustmentDTO): Promise<StockAdjustmentDTO> {
    // Generate Adjustment number
    const yearMonth = getCurrentYearMonth();
    const lastCode = await StockAdjustmentRepository.getLastAdjNoForMonth(yearMonth);
    const adjNo = generateAdjustmentCode(lastCode);

    // Create Adjustment with stock updates in transaction
    const adjustment = await db.$transaction(async (tx) => {
      // Create Adjustment document
      const createdAdj = await StockAdjustmentRepository.create(adjNo, data);

      // Update stock for each item
      for (const item of data.items) {
        if (item.qtyDiff > 0) {
          // Positive adjustment (increase)
          await StockService.increase(
            item.materialId,
            item.locationId,
            item.qtyDiff,
            "IN_ADJUSTMENT",
            "STOCK_ADJUSTMENT",
            createdAdj.id,
            item.note
          );
        } else {
          // Negative adjustment (decrease)
          await StockService.decrease(
            item.materialId,
            item.locationId,
            Math.abs(item.qtyDiff),
            "OUT_ADJUSTMENT",
            "STOCK_ADJUSTMENT",
            createdAdj.id,
            item.note
          );
        }
      }

      return createdAdj;
    });

    return StockAdjustmentMapper.toDTO(adjustment);
  }

  static async getById(id: string): Promise<StockAdjustmentDTO | null> {
    const adjustment = await StockAdjustmentRepository.findById(id);
    return adjustment ? StockAdjustmentMapper.toDTO(adjustment) : null;
  }

  static async getList(filter: {
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<StockAdjustmentDTO>> {
    const { adjustments, total } = await StockAdjustmentRepository.findMany(filter);
    return {
      data: StockAdjustmentMapper.toDTOList(adjustments),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }
}

// ============================================================================
// STOCK COUNT (OPNAME) SERVICE
// ============================================================================

export class StockCountService {
  static async create(data: CreateCountDTO): Promise<StockCountDTO> {
    // Generate Count number
    const yearMonth = getCurrentYearMonth();
    const lastCode = await StockCountRepository.getLastCountNoForMonth(yearMonth);
    const countNo = generateCountCode(lastCode);

    // Create Stock Count (status: OPEN)
    const count = await StockCountRepository.create(countNo, data);
    return StockCountMapper.toDTO(count);
  }

  static async getById(id: string): Promise<StockCountDTO | null> {
    const count = await StockCountRepository.findById(id);
    return count ? StockCountMapper.toDTO(count) : null;
  }

  static async getList(filter: {
    warehouseId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<StockCountDTO>> {
    const { counts, total } = await StockCountRepository.findMany(filter);
    return {
      data: StockCountMapper.toDTOList(counts),
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  static async post(countId: string): Promise<StockCountDTO> {
    // Get count with lines
    const count = await StockCountRepository.findById(countId);
    if (!count) {
      throw new Error("STOCK_COUNT_NOT_FOUND: Stock count tidak ditemukan");
    }

    if (count.status === "POSTED") {
      throw new Error("STOCK_COUNT_ALREADY_POSTED: Stock count sudah di-posting");
    }

    // Post differences in transaction
    await db.$transaction(async (tx) => {
      // Post stock count differences
      await StockService.postStockCountDiff(
        count.lines.map((line) => ({
          materialId: line.materialId,
          locationId: line.locationId,
          countedQty: line.countedQty.toNumber(),
          systemQty: line.systemQty.toNumber(),
          note: line.note ?? undefined,
        })),
        count.id
      );

      // Update status to POSTED
      await StockCountRepository.updateStatus(countId, "POSTED");
    });

    // Return updated count
    const updatedCount = await StockCountRepository.findById(countId);
    return StockCountMapper.toDTO(updatedCount!);
  }
}

