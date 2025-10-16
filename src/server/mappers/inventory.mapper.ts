import { Decimal } from "@prisma/client/runtime/library";
import type {
  Uom,
  MaterialCategory,
  Material,
  Warehouse,
  Location,
  Stock,
  StockLedger,
  GoodsReceipt,
  GoodsReceiptItem,
  GoodsIssue,
  GoodsIssueItem,
  StockTransfer,
  StockAdjustment,
  StockAdjustmentItem,
  StockCount,
  StockCountLine,
} from "@prisma/client";
import type {
  UomDTO,
  MaterialCategoryDTO,
  MaterialDTO,
  WarehouseDTO,
  LocationDTO,
  StockDTO,
  StockLedgerDTO,
  GoodsReceiptDTO,
  GoodsReceiptItemDTO,
  GoodsIssueDTO,
  GoodsIssueItemDTO,
  StockTransferDTO,
  StockAdjustmentDTO,
  StockAdjustmentItemDTO,
  StockCountDTO,
  StockCountLineDTO,
} from "~/server/types/inventory";

// Helper to convert Decimal to number
const toNumber = (value: Decimal | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  return value.toNumber();
};

// ============================================================================
// UOM MAPPER
// ============================================================================

export class UomMapper {
  static toDTO(uom: Uom): UomDTO {
    return {
      id: uom.id,
      code: uom.code,
      name: uom.name,
      description: uom.description,
      createdAt: uom.createdAt,
      updatedAt: uom.updatedAt,
    };
  }

  static toDTOList(uoms: Uom[]): UomDTO[] {
    return uoms.map((uom) => this.toDTO(uom));
  }
}

// ============================================================================
// MATERIAL CATEGORY MAPPER
// ============================================================================

export class MaterialCategoryMapper {
  static toDTO(category: MaterialCategory): MaterialCategoryDTO {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      notes: category.notes,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toDTOList(categories: MaterialCategory[]): MaterialCategoryDTO[] {
    return categories.map((cat) => this.toDTO(cat));
  }
}

// ============================================================================
// MATERIAL MAPPER
// ============================================================================

export class MaterialMapper {
  static toDTO(material: Material & { category?: MaterialCategory; baseUom?: Uom }): MaterialDTO {
    return {
      id: material.id,
      code: material.code,
      name: material.name,
      categoryId: material.categoryId,
      baseUomId: material.baseUomId,
      minStock: toNumber(material.minStock),
      reorderPoint: toNumber(material.reorderPoint),
      isConsumable: material.isConsumable,
      photoUrl: material.photoUrl,
      specs: material.specs,
      isActive: material.isActive,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
      ...(material.category && { category: MaterialCategoryMapper.toDTO(material.category) }),
      ...(material.baseUom && { baseUom: UomMapper.toDTO(material.baseUom) }),
    };
  }

  static toDTOList(materials: (Material & { category?: MaterialCategory; baseUom?: Uom })[]): MaterialDTO[] {
    return materials.map((mat) => this.toDTO(mat));
  }
}

// ============================================================================
// WAREHOUSE MAPPER
// ============================================================================

export class WarehouseMapper {
  static toDTO(warehouse: Warehouse): WarehouseDTO {
    return {
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  static toDTOList(warehouses: Warehouse[]): WarehouseDTO[] {
    return warehouses.map((wh) => this.toDTO(wh));
  }
}

// ============================================================================
// LOCATION MAPPER
// ============================================================================

export class LocationMapper {
  static toDTO(location: Location & { warehouse?: Warehouse; parent?: Location | null; children?: Location[] }): LocationDTO {
    return {
      id: location.id,
      warehouseId: location.warehouseId,
      parentId: location.parentId,
      type: location.type,
      code: location.code,
      name: location.name,
      isActive: location.isActive,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
      ...(location.warehouse && { warehouse: WarehouseMapper.toDTO(location.warehouse) }),
      ...(location.parent && { parent: this.toDTO(location.parent) }),
      ...(location.children && { children: location.children.map((child) => this.toDTO(child)) }),
    };
  }

  static toDTOList(locations: (Location & { warehouse?: Warehouse; parent?: Location | null })[]): LocationDTO[] {
    return locations.map((loc) => this.toDTO(loc));
  }
}

// ============================================================================
// STOCK MAPPER
// ============================================================================

export class StockMapper {
  static toDTO(stock: Stock & { material?: any; location?: any }): StockDTO {
    return {
      id: stock.id,
      materialId: stock.materialId,
      locationId: stock.locationId,
      qtyOnHand: toNumber(stock.qtyOnHand) ?? 0,
      avgCost: toNumber(stock.avgCost),
      ...(stock.material && { material: MaterialMapper.toDTO(stock.material) }),
      ...(stock.location && { location: LocationMapper.toDTO(stock.location) }),
    };
  }

  static toDTOList(stocks: (Stock & { material?: any; location?: any })[]): StockDTO[] {
    return stocks.map((stock) => this.toDTO(stock));
  }
}

// ============================================================================
// STOCK LEDGER MAPPER
// ============================================================================

export class StockLedgerMapper {
  static toDTO(ledger: StockLedger & { material?: any; location?: any }): StockLedgerDTO {
    return {
      id: ledger.id,
      ts: ledger.ts,
      materialId: ledger.materialId,
      locationId: ledger.locationId,
      ledgerType: ledger.ledgerType,
      refTable: ledger.refTable,
      refId: ledger.refId,
      qty: toNumber(ledger.qty) ?? 0,
      beforeQty: toNumber(ledger.beforeQty),
      afterQty: toNumber(ledger.afterQty),
      note: ledger.note,
      ...(ledger.material && { material: MaterialMapper.toDTO(ledger.material) }),
      ...(ledger.location && { location: LocationMapper.toDTO(ledger.location) }),
    };
  }

  static toDTOList(ledgers: (StockLedger & { material?: any; location?: any })[]): StockLedgerDTO[] {
    return ledgers.map((ledger) => this.toDTO(ledger));
  }
}

// ============================================================================
// GOODS RECEIPT MAPPER
// ============================================================================

export class GoodsReceiptMapper {
  static toItemDTO(item: GoodsReceiptItem & { material?: any; location?: any; uom?: any }): GoodsReceiptItemDTO {
    return {
      id: item.id,
      goodsReceiptId: item.goodsReceiptId,
      materialId: item.materialId,
      locationId: item.locationId,
      uomId: item.uomId,
      qty: toNumber(item.qty) ?? 0,
      note: item.note,
      ...(item.material && { material: MaterialMapper.toDTO(item.material) }),
      ...(item.location && { location: LocationMapper.toDTO(item.location) }),
      ...(item.uom && { uom: UomMapper.toDTO(item.uom) }),
    };
  }

  static toDTO(grn: GoodsReceipt & { warehouse?: Warehouse; items?: any[] }): GoodsReceiptDTO {
    return {
      id: grn.id,
      receiptNo: grn.receiptNo,
      warehouseId: grn.warehouseId,
      date: grn.date,
      note: grn.note,
      createdAt: grn.createdAt,
      updatedAt: grn.updatedAt,
      ...(grn.warehouse && { warehouse: WarehouseMapper.toDTO(grn.warehouse) }),
      ...(grn.items && { items: grn.items.map((item) => this.toItemDTO(item)) }),
    };
  }

  static toDTOList(grns: (GoodsReceipt & { warehouse?: Warehouse; items?: any[] })[]): GoodsReceiptDTO[] {
    return grns.map((grn) => this.toDTO(grn));
  }
}

// ============================================================================
// GOODS ISSUE MAPPER
// ============================================================================

export class GoodsIssueMapper {
  static toItemDTO(item: GoodsIssueItem & { material?: any; location?: any; uom?: any }): GoodsIssueItemDTO {
    return {
      id: item.id,
      goodsIssueId: item.goodsIssueId,
      materialId: item.materialId,
      locationId: item.locationId,
      uomId: item.uomId,
      qty: toNumber(item.qty) ?? 0,
      note: item.note,
      ...(item.material && { material: MaterialMapper.toDTO(item.material) }),
      ...(item.location && { location: LocationMapper.toDTO(item.location) }),
      ...(item.uom && { uom: UomMapper.toDTO(item.uom) }),
    };
  }

  static toDTO(issue: GoodsIssue & { warehouse?: Warehouse; items?: any[] }): GoodsIssueDTO {
    return {
      id: issue.id,
      issueNo: issue.issueNo,
      warehouseId: issue.warehouseId,
      date: issue.date,
      requesterId: issue.requesterId,
      costCenter: issue.costCenter,
      note: issue.note,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      ...(issue.warehouse && { warehouse: WarehouseMapper.toDTO(issue.warehouse) }),
      ...(issue.items && { items: issue.items.map((item) => this.toItemDTO(item)) }),
    };
  }

  static toDTOList(issues: (GoodsIssue & { warehouse?: Warehouse; items?: any[] })[]): GoodsIssueDTO[] {
    return issues.map((issue) => this.toDTO(issue));
  }
}

// ============================================================================
// STOCK TRANSFER MAPPER
// ============================================================================

export class StockTransferMapper {
  static toDTO(transfer: StockTransfer & { fromLoc?: any; toLoc?: any; material?: any; uom?: any }): StockTransferDTO {
    return {
      id: transfer.id,
      transferNo: transfer.transferNo,
      date: transfer.date,
      fromLocId: transfer.fromLocId,
      toLocId: transfer.toLocId,
      materialId: transfer.materialId,
      uomId: transfer.uomId,
      qty: toNumber(transfer.qty) ?? 0,
      note: transfer.note,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      ...(transfer.fromLoc && { fromLoc: LocationMapper.toDTO(transfer.fromLoc) }),
      ...(transfer.toLoc && { toLoc: LocationMapper.toDTO(transfer.toLoc) }),
      ...(transfer.material && { material: MaterialMapper.toDTO(transfer.material) }),
      ...(transfer.uom && { uom: UomMapper.toDTO(transfer.uom) }),
    };
  }

  static toDTOList(transfers: (StockTransfer & { fromLoc?: any; toLoc?: any; material?: any; uom?: any })[]): StockTransferDTO[] {
    return transfers.map((transfer) => this.toDTO(transfer));
  }
}

// ============================================================================
// STOCK ADJUSTMENT MAPPER
// ============================================================================

export class StockAdjustmentMapper {
  static toItemDTO(item: StockAdjustmentItem & { material?: any; location?: any }): StockAdjustmentItemDTO {
    return {
      id: item.id,
      stockAdjustmentId: item.stockAdjustmentId,
      materialId: item.materialId,
      locationId: item.locationId,
      qtyDiff: toNumber(item.qtyDiff) ?? 0,
      note: item.note,
      ...(item.material && { material: MaterialMapper.toDTO(item.material) }),
      ...(item.location && { location: LocationMapper.toDTO(item.location) }),
    };
  }

  static toDTO(adjustment: StockAdjustment & { items?: any[] }): StockAdjustmentDTO {
    return {
      id: adjustment.id,
      adjNo: adjustment.adjNo,
      date: adjustment.date,
      reason: adjustment.reason,
      createdAt: adjustment.createdAt,
      updatedAt: adjustment.updatedAt,
      ...(adjustment.items && { items: adjustment.items.map((item) => this.toItemDTO(item)) }),
    };
  }

  static toDTOList(adjustments: (StockAdjustment & { items?: any[] })[]): StockAdjustmentDTO[] {
    return adjustments.map((adj) => this.toDTO(adj));
  }
}

// ============================================================================
// STOCK COUNT MAPPER
// ============================================================================

export class StockCountMapper {
  static toLineDTO(line: StockCountLine & { material?: any; location?: any }): StockCountLineDTO {
    return {
      id: line.id,
      stockCountId: line.stockCountId,
      materialId: line.materialId,
      locationId: line.locationId,
      countedQty: toNumber(line.countedQty) ?? 0,
      systemQty: toNumber(line.systemQty) ?? 0,
      diffQty: toNumber(line.diffQty) ?? 0,
      note: line.note,
      ...(line.material && { material: MaterialMapper.toDTO(line.material) }),
      ...(line.location && { location: LocationMapper.toDTO(line.location) }),
    };
  }

  static toDTO(count: StockCount & { warehouse?: Warehouse; lines?: any[] }): StockCountDTO {
    return {
      id: count.id,
      countNo: count.countNo,
      warehouseId: count.warehouseId,
      date: count.date,
      areaNote: count.areaNote,
      status: count.status,
      createdAt: count.createdAt,
      updatedAt: count.updatedAt,
      ...(count.warehouse && { warehouse: WarehouseMapper.toDTO(count.warehouse) }),
      ...(count.lines && { lines: count.lines.map((line) => this.toLineDTO(line)) }),
    };
  }

  static toDTOList(counts: (StockCount & { warehouse?: Warehouse; lines?: any[] })[]): StockCountDTO[] {
    return counts.map((count) => this.toDTO(count));
  }
}

