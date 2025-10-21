import { db } from "~/server/db";
import type {
  CreateTransporterDTO,
  UpdateTransporterDTO,
  TransporterFilter,
  TransporterPagination,
  TransporterWithRelations
} from "~/server/types/pt-pks/transporter";
import { Prisma } from "@prisma/client";
import { sortByFuzzyMatch } from "~/server/lib/fuzzy-match";

export class TransportRepository {
  /**
   * Create a new transporter with nested relations
   */
  static async create(data: CreateTransporterDTO): Promise<TransporterWithRelations> {
    return db.transporter.create({
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
        picName: data.picName,
        picPhone: data.picPhone,
        picEmail: data.picEmail,
        bankName: data.bankName,
        bankAccountNo: data.bankAccountNo,
        bankAccountNm: data.bankAccountNm,
        statementUrl: data.statementUrl,
        notes: data.notes,
        isVerified: true, // Auto-verified on admin input
        status: "AKTIF",
        vehicles: data.vehicles && data.vehicles.length > 0 ? {
          create: data.vehicles.map(v => ({
            plateNo: v.plateNo,
            type: v.type,
            capacityTons: v.capacityTons,
            stnkUrl: v.stnkUrl,
            stnkValidThru: v.stnkValidThru,
            kirUrl: v.kirUrl,
            kirValidThru: v.kirValidThru,
            gpsId: v.gpsId,
            photoUrl: v.photoUrl,
          })),
        } : undefined,
        drivers: data.drivers && data.drivers.length > 0 ? {
          create: data.drivers.map(d => ({
            name: d.name,
            phone: d.phone,
            nik: d.nik,
            simType: d.simType,
            simUrl: d.simUrl,
            simValidThru: d.simValidThru,
          })),
        } : undefined,
        tariffs: data.tariffs && data.tariffs.length > 0 ? {
          create: data.tariffs.map(t => ({
            origin: t.origin,
            destination: t.destination,
            commodity: t.commodity,
            unit: t.unit,
            price: t.price,
            includeToll: t.includeToll ?? false,
            includeUnload: t.includeUnload ?? false,
            includeTax: t.includeTax ?? false,
            notes: t.notes,
          })),
        } : undefined,
        contracts: data.contracts && data.contracts.length > 0 ? {
          create: data.contracts.map(c => ({
            contractNo: c.contractNo,
            buyerId: c.buyerId,
            commodity: c.commodity,
            startDate: c.startDate,
            endDate: c.endDate,
            baseTariffId: c.baseTariffId,
            dokUrl: c.dokUrl,
          })),
        } : undefined,
      },
      include: {
        vehicles: true,
        drivers: true,
        tariffs: true,
        contracts: true,
      },
    });
  }

  /**
   * Find transporters with filtering and pagination
   */
  static async findMany(
    filter: TransporterFilter = {},
    pagination: TransporterPagination = {}
  ): Promise<{ transporters: TransporterWithRelations[]; total: number }> {
    const { page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.TransporterWhereInput = {};

    if (filter.query) {
      where.OR = [
        { legalName: { contains: filter.query, mode: "insensitive" } },
        { tradeName: { contains: filter.query, mode: "insensitive" } },
        { npwp: { contains: filter.query, mode: "insensitive" } },
        { 
          vehicles: {
            some: {
              plateNo: { contains: filter.query, mode: "insensitive" }
            }
          }
        },
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

    if (filter.commodity) {
      where.tariffs = {
        some: {
          commodity: { contains: filter.commodity, mode: "insensitive" }
        }
      };
    }

    // Execute queries
    const [transporters, total] = await Promise.all([
      db.transporter.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vehicles: true,
          drivers: true,
          tariffs: true,
          contracts: true,
        },
      }),
      db.transporter.count({ where }),
    ]);

    return { transporters, total };
  }

  /**
   * Find transporter by ID
   */
  static async findById(id: string): Promise<TransporterWithRelations | null> {
    return db.transporter.findUnique({
      where: { id },
      include: {
        vehicles: true,
        drivers: true,
        tariffs: true,
        contracts: true,
      },
    });
  }

  /**
   * Update transporter with nested upsert
   */
  static async update(id: string, data: UpdateTransporterDTO): Promise<TransporterWithRelations> {
    // Prepare update data
    const updateData: any = {
      type: data.type,
      legalName: data.legalName,
      tradeName: data.tradeName,
      npwp: data.npwp,
      pkpStatus: data.pkpStatus,
      addressLine: data.addressLine,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      picName: data.picName,
      picPhone: data.picPhone,
      picEmail: data.picEmail,
      bankName: data.bankName,
      bankAccountNo: data.bankAccountNo,
      bankAccountNm: data.bankAccountNm,
      statementUrl: data.statementUrl,
      status: data.status,
      notes: data.notes,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle nested updates
    if (data.vehicles !== undefined) {
      // Delete existing vehicles and create new ones
      await db.vehicle.deleteMany({ where: { transporterId: id } });
      if (data.vehicles.length > 0) {
        updateData.vehicles = {
          create: data.vehicles.map(v => ({
            plateNo: v.plateNo,
            type: v.type,
            capacityTons: v.capacityTons,
            stnkUrl: v.stnkUrl,
            stnkValidThru: v.stnkValidThru,
            kirUrl: v.kirUrl,
            kirValidThru: v.kirValidThru,
            gpsId: v.gpsId,
            photoUrl: v.photoUrl,
          })),
        };
      }
    }

    if (data.drivers !== undefined) {
      await db.driver.deleteMany({ where: { transporterId: id } });
      if (data.drivers.length > 0) {
        updateData.drivers = {
          create: data.drivers.map(d => ({
            name: d.name,
            phone: d.phone,
            nik: d.nik,
            simType: d.simType,
            simUrl: d.simUrl,
            simValidThru: d.simValidThru,
          })),
        };
      }
    }

    if (data.tariffs !== undefined) {
      await db.transportTariff.deleteMany({ where: { transporterId: id } });
      if (data.tariffs.length > 0) {
        updateData.tariffs = {
          create: data.tariffs.map(t => ({
            origin: t.origin,
            destination: t.destination,
            commodity: t.commodity,
            unit: t.unit,
            price: t.price,
            includeToll: t.includeToll ?? false,
            includeUnload: t.includeUnload ?? false,
            includeTax: t.includeTax ?? false,
            notes: t.notes,
          })),
        };
      }
    }

    if (data.contracts !== undefined) {
      await db.transportContract.deleteMany({ where: { transporterId: id } });
      if (data.contracts.length > 0) {
        updateData.contracts = {
          create: data.contracts.map(c => ({
            contractNo: c.contractNo,
            buyerId: c.buyerId,
            commodity: c.commodity,
            startDate: c.startDate,
            endDate: c.endDate,
            baseTariffId: c.baseTariffId,
            dokUrl: c.dokUrl,
          })),
        };
      }
    }

    return db.transporter.update({
      where: { id },
      data: updateData,
      include: {
        vehicles: true,
        drivers: true,
        tariffs: true,
        contracts: true,
      },
    });
  }

  /**
   * Soft delete transporter (set status to NONAKTIF)
   */
  static async softDelete(id: string): Promise<TransporterWithRelations> {
    return db.transporter.update({
      where: { id },
      data: { status: "NONAKTIF" },
      include: {
        vehicles: true,
        drivers: true,
        tariffs: true,
        contracts: true,
      },
    });
  }

  /**
   * Toggle transporter status (AKTIF <-> NONAKTIF)
   */
  static async toggleStatus(id: string): Promise<TransporterWithRelations> {
    const transporter = await db.transporter.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!transporter) {
      throw new Error("Transportir tidak ditemukan");
    }

    const newStatus = transporter.status === "AKTIF" ? "NONAKTIF" : "AKTIF";

    return db.transporter.update({
      where: { id },
      data: { status: newStatus },
      include: {
        vehicles: true,
        drivers: true,
        tariffs: true,
        contracts: true,
      },
    });
  }

  /**
   * Hard delete transporter (permanently delete from database)
   */
  static async hardDelete(id: string): Promise<void> {
    // Delete related records first (cascade delete)
    await db.$transaction([
      db.vehicle.deleteMany({ where: { transporterId: id } }),
      db.driver.deleteMany({ where: { transporterId: id } }),
      db.transportTariff.deleteMany({ where: { transporterId: id } }),
      db.transportContract.deleteMany({ where: { transporterId: id } }),
      db.transporter.delete({ where: { id } }),
    ]);
  }

  /**
   * Check if plate number already exists
   */
  static async isPlateNoExists(plateNo: string, excludeTransporterId?: string): Promise<boolean> {
    const where: Prisma.VehicleWhereInput = { plateNo };
    if (excludeTransporterId) {
      where.transporterId = { not: excludeTransporterId };
    }
    const count = await db.vehicle.count({ where });
    return count > 0;
  }

  /**
   * Check if contract number already exists
   */
  static async isContractNoExists(contractNo: string, excludeTransporterId?: string): Promise<boolean> {
    const where: Prisma.TransportContractWhereInput = { contractNo };
    if (excludeTransporterId) {
      where.transporterId = { not: excludeTransporterId };
    }
    const count = await db.transportContract.count({ where });
    return count > 0;
  }

  /**
   * Fuzzy search vehicles by plate number (for PB Import matching)
   * Returns vehicles sorted by similarity score
   */
  static async fuzzyFindVehicleByPlate(
    query: string,
    limit = 5
  ) {
    try {
      // Get all vehicles (or limit to reasonable number for performance)
      const vehicles = await db.vehicle.findMany({
        take: 100, // Limit initial fetch for performance
        orderBy: { createdAt: "desc" },
      });

      // Apply fuzzy matching
      const matches = sortByFuzzyMatch(
        vehicles,
        query,
        (v) => v.plateNo
      );

      return matches.slice(0, limit);
    } catch (error) {
      console.error("Error in fuzzy vehicle search:", error);
      throw error;
    }
  }
}

