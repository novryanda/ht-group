import { db } from "~/server/db";
import type { 
  CreateBuyerDTO, 
  UpdateBuyerDTO, 
  BuyerFilter, 
  BuyerPagination,
  BuyerWithRelations,
  DuplicateCheckParams
} from "~/server/types/buyer";
import { Prisma } from "@prisma/client";

export class BuyerRepository {
  /**
   * Create a new buyer with contacts and documents
   */
  static async create(data: CreateBuyerDTO, buyerCode: string, verifiedById: string): Promise<BuyerWithRelations> {
    return db.buyer.create({
      data: {
        buyerCode,
        type: data.type,
        legalName: data.legalName,
        tradeName: data.tradeName,
        npwp: data.npwp,
        pkpStatus: data.pkpStatus,
        addressLine: data.addressLine,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        billingEmail: data.billingEmail,
        phone: data.phone,
        destinationName: data.destinationName,
        destinationAddr: data.destinationAddr,
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById,
        contacts: {
          create: data.contacts,
        },
        docs: data.docs && data.docs.length > 0 ? {
          create: data.docs,
        } : undefined,
      },
      include: {
        contacts: true,
        docs: true,
      },
    });
  }

  /**
   * Find buyers with filtering and pagination
   */
  static async findMany(
    filter: BuyerFilter = {},
    pagination: BuyerPagination = {}
  ): Promise<{ buyers: BuyerWithRelations[]; total: number }> {
    const { page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.BuyerWhereInput = {};

    if (filter.query) {
      where.OR = [
        { buyerCode: { contains: filter.query, mode: "insensitive" } },
        { legalName: { contains: filter.query, mode: "insensitive" } },
        { tradeName: { contains: filter.query, mode: "insensitive" } },
        { npwp: { contains: filter.query, mode: "insensitive" } },
      ];
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.pkpStatus) {
      where.pkpStatus = filter.pkpStatus;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.city) {
      where.city = { contains: filter.city, mode: "insensitive" };
    }

    if (filter.province) {
      where.province = { contains: filter.province, mode: "insensitive" };
    }

    // Execute queries in parallel
    const [buyers, total] = await Promise.all([
      db.buyer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          contacts: true,
          docs: true,
        },
      }),
      db.buyer.count({ where }),
    ]);

    return { buyers, total };
  }

  /**
   * Find buyer by ID
   */
  static async findById(id: string): Promise<BuyerWithRelations | null> {
    return db.buyer.findUnique({
      where: { id },
      include: {
        contacts: true,
        docs: true,
      },
    });
  }

  /**
   * Find buyer by code
   */
  static async findByCode(buyerCode: string): Promise<BuyerWithRelations | null> {
    return db.buyer.findUnique({
      where: { buyerCode },
      include: {
        contacts: true,
        docs: true,
      },
    });
  }

  /**
   * Find buyer by NPWP
   */
  static async findByNpwp(npwp: string): Promise<BuyerWithRelations | null> {
    return db.buyer.findUnique({
      where: { npwp },
      include: {
        contacts: true,
        docs: true,
      },
    });
  }

  /**
   * Find buyers by name, city, and province (for duplicate checking when NPWP is empty)
   */
  static async findByNameAndLocation(
    legalName: string,
    city: string,
    province: string
  ): Promise<BuyerWithRelations[]> {
    return db.buyer.findMany({
      where: {
        legalName: {
          equals: legalName,
          mode: "insensitive",
        },
        city: {
          equals: city,
          mode: "insensitive",
        },
        province: {
          equals: province,
          mode: "insensitive",
        },
      },
      include: {
        contacts: true,
        docs: true,
      },
    });
  }

  /**
   * Check for duplicates based on NPWP or name+location
   */
  static async checkDuplicate(params: DuplicateCheckParams): Promise<BuyerWithRelations[]> {
    const duplicates: BuyerWithRelations[] = [];

    // Check by NPWP if provided
    if (params.npwp) {
      const byNpwp = await this.findByNpwp(params.npwp);
      if (byNpwp) {
        duplicates.push(byNpwp);
      }
    }

    // Check by name + location if NPWP is not provided
    if (!params.npwp && params.legalName && params.city && params.province) {
      const byLocation = await this.findByNameAndLocation(
        params.legalName,
        params.city,
        params.province
      );
      duplicates.push(...byLocation);
    }

    return duplicates;
  }

  /**
   * Update buyer
   */
  static async update(id: string, data: UpdateBuyerDTO): Promise<BuyerWithRelations> {
    // Delete existing contacts and docs if provided in update
    if (data.contacts || data.docs) {
      await db.buyer.update({
        where: { id },
        data: {
          contacts: data.contacts ? { deleteMany: {} } : undefined,
          docs: data.docs ? { deleteMany: {} } : undefined,
        },
      });
    }

    return db.buyer.update({
      where: { id },
      data: {
        type: data.type,
        legalName: data.legalName,
        tradeName: data.tradeName,
        npwp: data.npwp,
        pkpStatus: data.pkpStatus,
        addressLine: data.addressLine,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        billingEmail: data.billingEmail,
        phone: data.phone,
        destinationName: data.destinationName,
        destinationAddr: data.destinationAddr,
        status: data.status,
        contacts: data.contacts ? {
          create: data.contacts,
        } : undefined,
        docs: data.docs ? {
          create: data.docs,
        } : undefined,
      },
      include: {
        contacts: true,
        docs: true,
      },
    });
  }

  /**
   * Delete buyer
   */
  static async delete(id: string): Promise<void> {
    await db.buyer.delete({
      where: { id },
    });
  }

  /**
   * Get the last buyer code for a given year-month (for code generation)
   */
  static async getLastBuyerCodeForMonth(yearMonth: string): Promise<string | null> {
    const prefix = `B-${yearMonth}-`;
    
    const lastBuyer = await db.buyer.findFirst({
      where: {
        buyerCode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        buyerCode: "desc",
      },
      select: {
        buyerCode: true,
      },
    });

    return lastBuyer?.buyerCode ?? null;
  }

  /**
   * Get buyer statistics
   */
  static async getStats() {
    const [total, byType, byStatus, byPkp] = await Promise.all([
      db.buyer.count(),
      db.buyer.groupBy({
        by: ["type"],
        _count: true,
      }),
      db.buyer.groupBy({
        by: ["status"],
        _count: true,
      }),
      db.buyer.groupBy({
        by: ["pkpStatus"],
        _count: true,
      }),
    ]);

    return {
      total,
      byType,
      byStatus,
      byPkp,
    };
  }
}

