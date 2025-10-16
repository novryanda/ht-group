import type { Buyer, BuyerContact, BuyerDoc } from "@prisma/client";
import type { BuyerWithRelations } from "~/server/types/buyer";

/**
 * Mapper class to transform Prisma models to DTOs and vice versa
 */
export class BuyerMapper {
  /**
   * Map Prisma Buyer to DTO with relations
   */
  static toDTO(buyer: BuyerWithRelations): BuyerWithRelations {
    return {
      ...buyer,
      contacts: buyer.contacts.map(this.contactToDTO),
      docs: buyer.docs.map(this.docToDTO),
    };
  }

  /**
   * Map array of Prisma Buyers to DTOs
   */
  static toDTOList(buyers: BuyerWithRelations[]): BuyerWithRelations[] {
    return buyers.map((buyer) => this.toDTO(buyer));
  }

  /**
   * Map Prisma BuyerContact to DTO
   */
  static contactToDTO(contact: BuyerContact): BuyerContact {
    return { ...contact };
  }

  /**
   * Map Prisma BuyerDoc to DTO
   */
  static docToDTO(doc: BuyerDoc): BuyerDoc {
    return { ...doc };
  }

  /**
   * Format buyer for list display (minimal fields)
   */
  static toListItem(buyer: BuyerWithRelations) {
    return {
      id: buyer.id,
      buyerCode: buyer.buyerCode,
      type: buyer.type,
      legalName: buyer.legalName,
      tradeName: buyer.tradeName,
      npwp: buyer.npwp,
      pkpStatus: buyer.pkpStatus,
      city: buyer.city,
      province: buyer.province,
      status: buyer.status,
      billingEmail: buyer.billingEmail,
      phone: buyer.phone,
      createdAt: buyer.createdAt,
      updatedAt: buyer.updatedAt,
      contactCount: buyer.contacts.length,
      docCount: buyer.docs.length,
    };
  }

  /**
   * Format buyer for detail display (all fields)
   */
  static toDetailView(buyer: BuyerWithRelations) {
    return {
      ...buyer,
      contacts: buyer.contacts,
      docs: buyer.docs,
    };
  }
}

