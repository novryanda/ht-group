import type { 
  Transporter, 
  Vehicle, 
  Driver, 
  TransportTariff, 
  TransportContract 
} from "@prisma/client";
import type { TransporterWithRelations } from "~/server/types/transporter";

/**
 * Mapper class to transform Prisma models to DTOs and vice versa
 */
export class TransporterMapper {
  /**
   * Map Prisma Transporter to DTO with relations
   */
  static toDTO(transporter: TransporterWithRelations): TransporterWithRelations {
    return {
      ...transporter,
      vehicles: transporter.vehicles.map(this.vehicleToDTO),
      drivers: transporter.drivers.map(this.driverToDTO),
      tariffs: transporter.tariffs.map(this.tariffToDTO),
      contracts: transporter.contracts.map(this.contractToDTO),
    };
  }

  /**
   * Map array of Prisma Transporters to DTOs
   */
  static toDTOList(transporters: TransporterWithRelations[]): TransporterWithRelations[] {
    return transporters.map((transporter) => this.toDTO(transporter));
  }

  /**
   * Map Prisma Vehicle to DTO
   */
  static vehicleToDTO(vehicle: Vehicle): Vehicle {
    return { ...vehicle };
  }

  /**
   * Map Prisma Driver to DTO
   */
  static driverToDTO(driver: Driver): Driver {
    return { ...driver };
  }

  /**
   * Map Prisma TransportTariff to DTO
   */
  static tariffToDTO(tariff: TransportTariff): TransportTariff {
    return { ...tariff };
  }

  /**
   * Map Prisma TransportContract to DTO
   */
  static contractToDTO(contract: TransportContract): TransportContract {
    return { ...contract };
  }

  /**
   * Format transporter for list display (minimal fields)
   */
  static toListItem(transporter: TransporterWithRelations) {
    return {
      id: transporter.id,
      type: transporter.type,
      legalName: transporter.legalName,
      tradeName: transporter.tradeName,
      npwp: transporter.npwp,
      pkpStatus: transporter.pkpStatus,
      city: transporter.city,
      province: transporter.province,
      picName: transporter.picName,
      picPhone: transporter.picPhone,
      status: transporter.status,
      isVerified: transporter.isVerified,
      createdAt: transporter.createdAt,
      updatedAt: transporter.updatedAt,
      vehicleCount: transporter.vehicles.length,
      driverCount: transporter.drivers.length,
      tariffCount: transporter.tariffs.length,
      contractCount: transporter.contracts.length,
    };
  }

  /**
   * Format transporter for detail display (all fields)
   */
  static toDetailView(transporter: TransporterWithRelations) {
    return {
      ...transporter,
      vehicles: transporter.vehicles,
      drivers: transporter.drivers,
      tariffs: transporter.tariffs,
      contracts: transporter.contracts,
    };
  }
}

