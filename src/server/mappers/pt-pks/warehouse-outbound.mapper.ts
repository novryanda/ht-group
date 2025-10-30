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
      purpose: data.purpose as WarehouseOutboundDTO["purpose"],
      targetDept: data.targetDept ?? undefined,
      pickerName: data.pickerName ?? undefined,
      loanReceiver: data.loanReceiver ?? undefined,
      expectedReturnAt: data.expectedReturnAt?.toISOString() ?? undefined,
      loanNotes: data.loanNotes ?? undefined,
      note: data.note ?? undefined,
      expenseAccountId: data.expenseAccountId ?? undefined,
      costCenter: data.costCenter ?? undefined,
      status: data.status as WarehouseOutboundDTO["status"],
      glStatus: data.glStatus ? (data.glStatus as WarehouseOutboundDTO["glStatus"]) : undefined,
      glPostedAt: data.glPostedAt?.toISOString() ?? undefined,
      glEntryId: data.glEntryId ?? undefined,
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
