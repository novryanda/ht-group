/**
 * Items API Class
 * Handles HTTP layer for item operations
 */

import { ItemService } from "~/server/services/pt-pks/item.service";
import type { ItemQueryParams } from "~/server/schemas/pt-pks/item";

export class ItemsAPI {
  private itemService: ItemService;

  constructor() {
    this.itemService = new ItemService();
  }

  /**
   * Generate SKU for new item
   */
  async generateSKU(categoryId: string, itemTypeId: string) {
    return this.itemService.generateSKU(categoryId, itemTypeId);
  }

  /**
   * Create new item
   */
  async create(data: unknown, userId?: string) {
    return this.itemService.createItem(data, userId);
  }

  /**
   * Update existing item
   */
  async update(id: string, data: unknown) {
    return this.itemService.updateItem(id, data);
  }

  /**
   * Delete item
   */
  async delete(id: string) {
    return this.itemService.deleteItem(id);
  }

  /**
   * Get item by ID
   */
  async getById(id: string) {
    return this.itemService.getItemById(id);
  }

  /**
   * Get items with pagination and filters
   */
  async getAll(params: ItemQueryParams) {
    return this.itemService.getItems(params);
  }

  /**
   * Get all active items
   */
  async getAllActive() {
    return this.itemService.getActiveItems();
  }

  /**
   * Check if SKU exists
   */
  async checkSKUExists(sku: string, excludeId?: string) {
    const exists = await this.itemService.checkSKUExists(sku, excludeId);
    return {
      success: true,
      data: { exists },
      statusCode: 200,
    };
  }
}
