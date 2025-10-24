import type { GoodsIssue, GoodsIssueLine, Warehouse, Item, Unit } from "@prisma/client";
import type { WarehouseOutboundDTO, WarehouseOutboundLineDTO } from "~/server/types/pt-pks/warehouse-transaction";

type GoodsIssueWithRelations = GoodsIssue & {
  warehouse: Warehouse;
  lines: Array<
    GoodsIssueLine & {
      item: Item;
      unit: Unit;
    }
  >;
};

export class WarehouseOutboundMapper {
  /**
   * Map Prisma GoodsIssue to DTO
   */
  static toDTO(data: GoodsIssueWithRelations): WarehouseOutboundDTO {
    return {
      id: data.id,
      docNumber: data.docNumber,
      date: data.date.toISOString(),
      warehouseId: data.warehouseId,
      warehouseName: data.warehouse.name,
      purpose: data.purpose,
      targetDept: data.targetDept ?? "",
      note: data.note ?? undefined,
      status: "APPROVED", // Default status (GoodsIssue doesn't have status field yet)
      createdById: data.createdById,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      lines: data.lines.map((line) => this.lineToDTO(line)),
    };
  }

  /**
   * Map array of GoodsIssue to DTOs
   */
  static toDTOList(data: GoodsIssueWithRelations[]): WarehouseOutboundDTO[] {
    return data.map((item) => this.toDTO(item));
  }

  /**
   * Map GoodsIssueLine to DTO
   */
  static lineToDTO(
    line: GoodsIssueLine & {
      item: Item;
      unit: Unit;
    }
  ): WarehouseOutboundLineDTO {
    return {
      id: line.id,
      outboundId: line.issueId,
      itemId: line.itemId,
      itemName: line.item.name,
      itemSKU: line.item.sku,
      unitId: line.unitId,
      unitName: line.unit.name,
      qty: Number(line.qty),
      qtyReturned: 0, // TODO: Track returned qty from inbound returns
      note: line.note ?? undefined,
    };
  }
}
