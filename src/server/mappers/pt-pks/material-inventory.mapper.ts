import type { Unit, Category, ItemType, Warehouse, Bin, Item } from "@prisma/client";
import type {
  UnitDTO,
  CategoryDTO,
  ItemTypeDTO,
  WarehouseDTO,
  BinDTO,
  ItemDTO,
} from "~/server/types/pt-pks/material-inventory";

export function mapUnitToDTO(unit: Unit): UnitDTO {
  return {
    id: unit.id,
    code: unit.code,
    name: unit.name,
    isBase: unit.isBase,
    conversionToBase: Number(unit.conversionToBase),
    description: unit.description ?? undefined,
    isActive: unit.isActive,
    createdAt: unit.createdAt.toISOString(),
    updatedAt: unit.updatedAt.toISOString(),
  };
}

export function mapCategoryToDTO(category: Category): CategoryDTO {
  return {
    id: category.id,
    code: category.code,
    name: category.name,
    description: category.description ?? undefined,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function mapItemTypeToDTO(
  itemType: ItemType & { category?: Category }
): ItemTypeDTO {
  return {
    id: itemType.id,
    categoryId: itemType.categoryId,
    categoryName: itemType.category?.name,
    code: itemType.code,
    name: itemType.name,
    description: itemType.description ?? undefined,
    isActive: itemType.isActive,
    createdAt: itemType.createdAt.toISOString(),
    updatedAt: itemType.updatedAt.toISOString(),
  };
}

export function mapWarehouseToDTO(warehouse: Warehouse): WarehouseDTO {
  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    address: warehouse.address ?? undefined,
    isActive: warehouse.isActive,
    createdAt: warehouse.createdAt.toISOString(),
    updatedAt: warehouse.updatedAt.toISOString(),
  };
}

export function mapBinToDTO(bin: Bin & { warehouse?: Warehouse }): BinDTO {
  return {
    id: bin.id,
    warehouseId: bin.warehouseId,
    warehouseName: bin.warehouse?.name,
    code: bin.code,
    name: bin.name,
    description: bin.description ?? undefined,
    isActive: bin.isActive,
    createdAt: bin.createdAt.toISOString(),
    updatedAt: bin.updatedAt.toISOString(),
  };
}

export function mapItemToDTO(
  item: Item & {
    category?: Category;
    itemType?: ItemType;
    baseUnit?: Unit;
    defaultIssueUnit?: Unit | null;
  }
): ItemDTO {
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    description: item.description ?? undefined,
    categoryId: item.categoryId,
    categoryName: item.category?.name,
    itemTypeId: item.itemTypeId,
    itemTypeName: item.itemType?.name,
    baseUnitId: item.baseUnitId,
    baseUnitName: item.baseUnit?.name,
    defaultIssueUnitId: item.defaultIssueUnitId ?? undefined,
    defaultIssueUnitName: item.defaultIssueUnit?.name,
    valuationMethod: item.valuationMethod,
    minStock: item.minStock ? Number(item.minStock) : undefined,
    maxStock: item.maxStock ? Number(item.maxStock) : undefined,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
