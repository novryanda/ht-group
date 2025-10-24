/**
 * Item Service
 * Business logic for managing material items with SKU generation,
 * stock validations, and multi-relation handling
 */

import { ItemRepo } from "~/server/repositories/pt-pks/item.repo";
import { categoryRepo } from "~/server/repositories/pt-pks/category.repo";
import { itemTypeRepo } from "~/server/repositories/pt-pks/item-type.repo";
import { unitRepo } from "~/server/repositories/pt-pks/unit.repo";
import { mapItemToDTO } from "~/server/mappers/pt-pks/material-inventory.mapper";
import { StockService } from "~/server/services/pt-pks/stock.service";
import {
  createItemSchema,
  updateItemSchema,
  type ItemQueryParams,
} from "~/server/schemas/pt-pks/item";
import type {
  ItemDTO,
  ListResponse,
} from "~/server/types/pt-pks/material-inventory";

export class ItemService {
  private itemRepo: ItemRepo;
  private stockService: StockService;

  constructor() {
    this.itemRepo = new ItemRepo();
    this.stockService = new StockService();
  }

  /**
   * Generate SKU format: {CategoryCode}-{ItemTypeCode}-{Seq}
   * Example: RM-STEEL-001, FG-PROD-042
   */
  async generateSKU(
    categoryId: string,
    itemTypeId: string,
  ): Promise<{ success: boolean; sku?: string; error?: string }> {
    try {
      const category = await categoryRepo.findById(categoryId);
      if (!category) {
        return { success: false, error: "Category not found" };
      }

      const itemType = await itemTypeRepo.findById(itemTypeId);
      if (!itemType) {
        return { success: false, error: "Item type not found" };
      }

      // Get count of items with same category and item type
      const count = await this.itemRepo.countByFilters({
        categoryId,
        itemTypeId,
      });

      const seq = String(count + 1).padStart(3, "0");
      const sku = `${category.code}-${itemType.code}-${seq}`;

      return { success: true, sku };
    } catch (error) {
      console.error("❌ Error generating SKU:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate min/max stock levels
   */
  private validateStockLevels(minStock: number, maxStock: number): boolean {
    if (minStock < 0 || maxStock < 0) return false;
    if (minStock > maxStock) return false;
    return true;
  }

  /**
   * Create new item with validations and optional initial stock
   */
  async createItem(data: unknown, userId?: string): Promise<{
    success: boolean;
    data?: ItemDTO;
    error?: string;
    details?: Record<string, unknown>;
    statusCode: number;
  }> {
    try {
      // Validate input
      const validatedData = createItemSchema.parse(data);

      // Validate stock levels
      if (
        !this.validateStockLevels(
          validatedData.minStock,
          validatedData.maxStock,
        )
      ) {
        return {
          success: false,
          error: "Invalid stock levels",
          details: { message: "Min stock must be less than or equal to max stock, and both must be non-negative" },
          statusCode: 400,
        };
      }

      // Check if SKU already exists
      const existingSKU = await this.itemRepo.findBySKU(validatedData.sku);
      if (existingSKU) {
        return {
          success: false,
          error: "SKU already exists",
          details: { field: "sku", value: validatedData.sku },
          statusCode: 409,
        };
      }

      // Validate relations exist
      const [category, itemType, baseUnit] = await Promise.all([
        categoryRepo.findById(validatedData.categoryId),
        itemTypeRepo.findById(validatedData.itemTypeId),
        unitRepo.findById(validatedData.baseUnitId),
      ]);

      if (!category) {
        return {
          success: false,
          error: "Category not found",
          statusCode: 404,
        };
      }

      if (!itemType) {
        return {
          success: false,
          error: "Item type not found",
          statusCode: 404,
        };
      }

      if (!baseUnit) {
        return {
          success: false,
          error: "Base unit not found",
          statusCode: 404,
        };
      }

      // Validate defaultIssueUnit if provided
      if (validatedData.defaultIssueUnitId) {
        const issueUnit = await unitRepo.findById(validatedData.defaultIssueUnitId);
        if (!issueUnit) {
          return {
            success: false,
            error: "Issue unit not found",
            statusCode: 404,
          };
        }
      }

      // Create item with Prisma connect syntax
      const itemData: any = {
        sku: validatedData.sku,
        name: validatedData.name,
        description: validatedData.description,
        category: { connect: { id: validatedData.categoryId } },
        itemType: { connect: { id: validatedData.itemTypeId } },
        baseUnit: { connect: { id: validatedData.baseUnitId } },
        valuationMethod: validatedData.valuationMethod,
        minStock: validatedData.minStock,
        maxStock: validatedData.maxStock,
        isActive: validatedData.isActive,
      };

      if (validatedData.defaultIssueUnitId) {
        itemData.defaultIssueUnit = { connect: { id: validatedData.defaultIssueUnitId } };
      }

      const item = await this.itemRepo.create(itemData);
      
      // Add initial stock if provided
      if (validatedData.initialStock && userId) {
        try {
          await this.stockService.addInitialStock(
            item.id,
            validatedData.initialStock,
            userId
          );
        } catch (stockError) {
          console.error("❌ Error adding initial stock:", stockError);
          // Note: Item already created, but initial stock failed
          // You might want to rollback item creation or handle differently
        }
      }

      const itemDTO = mapItemToDTO(item);

      return {
        success: true,
        data: itemDTO,
        statusCode: 201,
      };
    } catch (error) {
      console.error("❌ Error creating item:", error);

      if (error instanceof Error && error.name === "ZodError") {
        return {
          success: false,
          error: "Validation error",
          details: { errors: error },
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item",
        statusCode: 500,
      };
    }
  }

  /**
   * Update existing item
   */
  async updateItem(
    id: string,
    data: unknown,
  ): Promise<{
    success: boolean;
    data?: ItemDTO;
    error?: string;
    details?: Record<string, unknown>;
    statusCode: number;
  }> {
    try {
      // Validate input
      const validatedData = updateItemSchema.parse(data);

      // Check if item exists
      const existingItem = await this.itemRepo.findById(id);
      if (!existingItem) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      // Validate stock levels if provided
      if (validatedData.minStock !== undefined && validatedData.maxStock !== undefined) {
        if (
          !this.validateStockLevels(
            validatedData.minStock,
            validatedData.maxStock,
          )
        ) {
          return {
            success: false,
            error: "Invalid stock levels",
            details: { message: "Min stock must be less than or equal to max stock" },
            statusCode: 400,
          };
        }
      }

      // Check SKU uniqueness if changed
      if (validatedData.sku && validatedData.sku !== existingItem.sku) {
        const skuExists = await this.itemRepo.findBySKU(validatedData.sku);
        if (skuExists) {
          return {
            success: false,
            error: "SKU already exists",
            details: { field: "sku", value: validatedData.sku },
            statusCode: 409,
          };
        }
      }

      // Validate relations if provided
      if (validatedData.categoryId) {
        const category = await categoryRepo.findById(validatedData.categoryId);
        if (!category) {
          return {
            success: false,
            error: "Category not found",
            statusCode: 404,
          };
        }
      }

      if (validatedData.itemTypeId) {
        const itemType = await itemTypeRepo.findById(validatedData.itemTypeId);
        if (!itemType) {
          return {
            success: false,
            error: "Item type not found",
            statusCode: 404,
          };
        }
      }

      if (validatedData.baseUnitId) {
        const unit = await unitRepo.findById(validatedData.baseUnitId);
        if (!unit) {
          return {
            success: false,
            error: "Base unit not found",
            statusCode: 404,
          };
        }
      }

      if (validatedData.defaultIssueUnitId) {
        const issueUnit = await unitRepo.findById(validatedData.defaultIssueUnitId);
        if (!issueUnit) {
          return {
            success: false,
            error: "Issue unit not found",
            statusCode: 404,
          };
        }
      }

      // Build update data with Prisma connect syntax
      const updateData: any = {};
      
      if (validatedData.sku !== undefined) updateData.sku = validatedData.sku;
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.categoryId !== undefined) {
        updateData.category = { connect: { id: validatedData.categoryId } };
      }
      if (validatedData.itemTypeId !== undefined) {
        updateData.itemType = { connect: { id: validatedData.itemTypeId } };
      }
      if (validatedData.baseUnitId !== undefined) {
        updateData.baseUnit = { connect: { id: validatedData.baseUnitId } };
      }
      
      // Handle optional defaultIssueUnitId - disconnect if null/undefined
      if (validatedData.defaultIssueUnitId !== undefined) {
        if (validatedData.defaultIssueUnitId === null || validatedData.defaultIssueUnitId === "") {
          updateData.defaultIssueUnit = { disconnect: true };
        } else {
          updateData.defaultIssueUnit = { connect: { id: validatedData.defaultIssueUnitId } };
        }
      }
      
      if (validatedData.valuationMethod !== undefined) updateData.valuationMethod = validatedData.valuationMethod;
      if (validatedData.minStock !== undefined) updateData.minStock = validatedData.minStock;
      if (validatedData.maxStock !== undefined) updateData.maxStock = validatedData.maxStock;
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

      // Update item
      const item = await this.itemRepo.update(id, updateData);
      const itemDTO = mapItemToDTO(item);

      return {
        success: true,
        data: itemDTO,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error updating item:", error);

      if (error instanceof Error && error.name === "ZodError") {
        return {
          success: false,
          error: "Validation error",
          details: { errors: error },
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update item",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete item
   */
  async deleteItem(id: string): Promise<{
    success: boolean;
    error?: string;
    statusCode: number;
  }> {
    try {
      const item = await this.itemRepo.findById(id);
      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      await this.itemRepo.delete(id);

      return {
        success: true,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error deleting item:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete item",
        statusCode: 500,
      };
    }
  }

  /**
   * Get item by ID with relations
   */
  async getItemById(id: string): Promise<{
    success: boolean;
    data?: ItemDTO;
    error?: string;
    statusCode: number;
  }> {
    try {
      const item = await this.itemRepo.findById(id);

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      const itemDTO = mapItemToDTO(item);

      return {
        success: true,
        data: itemDTO,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error getting item:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get item",
        statusCode: 500,
      };
    }
  }

  /**
   * Get paginated items with filters
   */
  async getItems(
    params: ItemQueryParams,
  ): Promise<{
    success: boolean;
    data?: ListResponse<ItemDTO>;
    error?: string;
    statusCode: number;
  }> {
    try {
      const result = await this.itemRepo.findManyWithPagination(params);

      const items = result.data.map((item) => mapItemToDTO(item));

      return {
        success: true,
        data: {
          data: items,
          meta: result.meta,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error getting items:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get items",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all active items (for dropdowns)
   */
  async getActiveItems(): Promise<{
    success: boolean;
    data?: ItemDTO[];
    error?: string;
    statusCode: number;
  }> {
    try {
      const items = await this.itemRepo.findAllActive();
      const itemDTOs = items.map((item) => mapItemToDTO(item));

      return {
        success: true,
        data: itemDTOs,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error getting active items:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get active items",
        statusCode: 500,
      };
    }
  }

  /**
   * Check if SKU exists
   */
  async checkSKUExists(sku: string, excludeId?: string): Promise<boolean> {
    try {
      const item = await this.itemRepo.findBySKU(sku);
      if (!item) return false;
      if (excludeId && item.id === excludeId) return false;
      return true;
    } catch (error) {
      console.error("❌ Error checking SKU:", error);
      return false;
    }
  }
}
