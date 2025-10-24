import type { GoodsReceipt, GoodsReceiptLine, Warehouse, Item, Unit } from "@prisma/client";
import type { WarehouseInboundDTO, WarehouseInboundLineDTO } from "~/server/types/pt-pks/warehouse-transaction";

type GoodsReceiptWithRelations = GoodsReceipt & {
  warehouse: Warehouse;
  lines: Array<
    GoodsReceiptLine & {
      item: Item;
      unit: Unit;
    }
  >;
};

export class WarehouseInboundMapper {
  /**
   * Map Prisma GoodsReceipt to DTO
   */
  static toDTO(data: GoodsReceiptWithRelations): WarehouseInboundDTO {
    return {
      id: data.id,
      docNumber: data.docNumber,
      date: data.date.toISOString(),
      warehouseId: data.warehouseId,
      warehouseName: data.warehouse.name,
      sourceType: data.sourceType,
      sourceRef: data.sourceRef ?? undefined,
      note: data.note ?? undefined,
      createdById: data.createdById,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      lines: data.lines.map((line) => this.lineToDTO(line)),
    };
  }

  /**
   * Map array of GoodsReceipt to DTOs
   */
  static toDTOList(data: GoodsReceiptWithRelations[]): WarehouseInboundDTO[] {
    return data.map((item) => this.toDTO(item));
  }

  /**
   * Map GoodsReceiptLine to DTO
   */
  static lineToDTO(
    line: GoodsReceiptLine & {
      item: Item;
      unit: Unit;
    }
  ): WarehouseInboundLineDTO {
    return {
      id: line.id,
      inboundId: line.receiptId,
      itemId: line.itemId,
      itemName: line.item.name,
      itemSKU: line.item.sku,
      unitId: line.unitId,
      unitName: line.unit.name,
      qty: Number(line.qty),
      unitCost: line.unitCost ? Number(line.unitCost) : undefined,
      note: line.note ?? undefined,
    };
  }
}
