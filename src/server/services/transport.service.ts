import { TransportRepository } from "~/server/repositories/transport.repo";
import { TransporterMapper } from "~/server/mappers/transporter.mapper";
import type {
  CreateTransporterDTO,
  UpdateTransporterDTO,
  TransporterFilter,
  TransporterPagination,
  TransporterListResult,
  TransporterWithRelations,
  TariffCalculationParams,
  TariffCalculationResult,
} from "~/server/types/transporter";

/**
 * Transport Service - Business logic layer
 */
export class TransportService {
  /**
   * Create a new transporter
   * - Validates PKP vs NPWP
   * - Validates plate number uniqueness
   * - Validates contract number uniqueness
   * - Validates contract period
   * - Sets isVerified to true (admin input)
   */
  static async createTransporter(
    data: CreateTransporterDTO
  ): Promise<TransporterWithRelations> {
    // Validate PKP vs NPWP
    if (data.pkpStatus !== "NON_PKP" && !data.npwp) {
      throw new Error("NPWP wajib diisi untuk status PKP");
    }

    // Validate plate number uniqueness
    if (data.vehicles && data.vehicles.length > 0) {
      for (const vehicle of data.vehicles) {
        const exists = await TransportRepository.isPlateNoExists(vehicle.plateNo);
        if (exists) {
          throw new Error(`Nomor plat ${vehicle.plateNo} sudah terdaftar`);
        }
      }
    }

    // Validate contract number uniqueness
    if (data.contracts && data.contracts.length > 0) {
      for (const contract of data.contracts) {
        const exists = await TransportRepository.isContractNoExists(contract.contractNo);
        if (exists) {
          throw new Error(`Nomor kontrak ${contract.contractNo} sudah terdaftar`);
        }

        // Validate contract period
        if (contract.startDate && contract.endDate) {
          const start = new Date(contract.startDate);
          const end = new Date(contract.endDate);
          if (end < start) {
            throw new Error(`Tanggal akhir kontrak ${contract.contractNo} harus lebih besar dari tanggal mulai`);
          }
        }
      }
    }

    // Validate document expiry dates (should be >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.vehicles && data.vehicles.length > 0) {
      for (const vehicle of data.vehicles) {
        if (vehicle.stnkValidThru) {
          const stnkDate = new Date(vehicle.stnkValidThru);
          stnkDate.setHours(0, 0, 0, 0);
          if (stnkDate < today) {
            throw new Error(`STNK kendaraan ${vehicle.plateNo} sudah kedaluwarsa`);
          }
        }
        if (vehicle.kirValidThru) {
          const kirDate = new Date(vehicle.kirValidThru);
          kirDate.setHours(0, 0, 0, 0);
          if (kirDate < today) {
            throw new Error(`KIR kendaraan ${vehicle.plateNo} sudah kedaluwarsa`);
          }
        }
      }
    }

    if (data.drivers && data.drivers.length > 0) {
      for (const driver of data.drivers) {
        if (driver.simValidThru) {
          const simDate = new Date(driver.simValidThru);
          simDate.setHours(0, 0, 0, 0);
          if (simDate < today) {
            throw new Error(`SIM pengemudi ${driver.name} sudah kedaluwarsa`);
          }
        }
      }
    }

    // Create transporter
    const transporter = await TransportRepository.create(data);

    return TransporterMapper.toDTO(transporter);
  }

  /**
   * Get transporters with filtering and pagination
   */
  static async getTransporters(
    filter: TransporterFilter = {},
    pagination: TransporterPagination = {}
  ): Promise<TransporterListResult> {
    const { transporters, total } = await TransportRepository.findMany(filter, pagination);

    return {
      transporters: TransporterMapper.toDTOList(transporters),
      total,
    };
  }

  /**
   * Get transporter by ID
   */
  static async getTransporterById(id: string): Promise<TransporterWithRelations | null> {
    const transporter = await TransportRepository.findById(id);
    return transporter ? TransporterMapper.toDTO(transporter) : null;
  }

  /**
   * Update transporter
   */
  static async updateTransporter(
    id: string,
    data: UpdateTransporterDTO
  ): Promise<TransporterWithRelations> {
    // Check if transporter exists
    const existing = await TransportRepository.findById(id);
    if (!existing) {
      throw new Error("Transportir tidak ditemukan");
    }

    // Validate PKP vs NPWP
    const pkpStatus = data.pkpStatus ?? existing.pkpStatus;
    const npwp = data.npwp !== undefined ? data.npwp : existing.npwp;
    if (pkpStatus !== "NON_PKP" && !npwp) {
      throw new Error("NPWP wajib diisi untuk status PKP");
    }

    // Validate plate number uniqueness (exclude current transporter)
    if (data.vehicles && data.vehicles.length > 0) {
      for (const vehicle of data.vehicles) {
        const exists = await TransportRepository.isPlateNoExists(vehicle.plateNo, id);
        if (exists) {
          throw new Error(`Nomor plat ${vehicle.plateNo} sudah terdaftar`);
        }
      }
    }

    // Validate contract number uniqueness (exclude current transporter)
    if (data.contracts && data.contracts.length > 0) {
      for (const contract of data.contracts) {
        const exists = await TransportRepository.isContractNoExists(contract.contractNo, id);
        if (exists) {
          throw new Error(`Nomor kontrak ${contract.contractNo} sudah terdaftar`);
        }

        // Validate contract period
        if (contract.startDate && contract.endDate) {
          const start = new Date(contract.startDate);
          const end = new Date(contract.endDate);
          if (end < start) {
            throw new Error(`Tanggal akhir kontrak ${contract.contractNo} harus lebih besar dari tanggal mulai`);
          }
        }
      }
    }

    // Update transporter
    const transporter = await TransportRepository.update(id, data);

    return TransporterMapper.toDTO(transporter);
  }

  /**
   * Soft delete transporter (set status to NONAKTIF)
   */
  static async deleteTransporter(id: string): Promise<TransporterWithRelations> {
    // Check if transporter exists
    const existing = await TransportRepository.findById(id);
    if (!existing) {
      throw new Error("Transportir tidak ditemukan");
    }

    const transporter = await TransportRepository.softDelete(id);

    return TransporterMapper.toDTO(transporter);
  }

  /**
   * Toggle transporter status (AKTIF <-> NONAKTIF)
   */
  static async toggleTransporterStatus(id: string): Promise<TransporterWithRelations> {
    // Check if transporter exists
    const existing = await TransportRepository.findById(id);
    if (!existing) {
      throw new Error("Transportir tidak ditemukan");
    }

    const transporter = await TransportRepository.toggleStatus(id);

    return TransporterMapper.toDTO(transporter);
  }

  /**
   * Hard delete transporter (permanently remove from database)
   */
  static async hardDeleteTransporter(id: string): Promise<{ id: string }> {
    // Check if transporter exists
    const existing = await TransportRepository.findById(id);
    if (!existing) {
      throw new Error("Transportir tidak ditemukan");
    }

    await TransportRepository.hardDelete(id);

    return { id };
  }

  /**
   * Calculate tariff based on unit (TON/KM/TRIP)
   * Helper for integration with timbangan/SLIP module
   */
  static async calculateTariff(
    params: TariffCalculationParams
  ): Promise<TariffCalculationResult> {
    // This is a placeholder for tariff calculation logic
    // In real implementation, this would fetch the tariff from DB
    // and calculate based on quantity and unit
    
    // For now, return a simple structure
    const baseAmount = 0; // Would be fetched from tariff
    const tollAmount = 0;
    const unloadAmount = 0;
    const taxAmount = 0;
    const totalAmount = baseAmount + tollAmount + unloadAmount + taxAmount;

    return {
      baseAmount,
      tollAmount,
      unloadAmount,
      taxAmount,
      totalAmount,
      unit: "TON", // Would be from tariff
      quantity: params.quantity,
    };
  }

  /**
   * Get transporters with expiring documents (within 30 days)
   * Helper for dashboard alerts
   */
  static async getExpiringDocuments(days = 30): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // This would query vehicles and drivers with expiring documents
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Get transporter statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalVehicles: number;
    totalDrivers: number;
  }> {
    // This would aggregate statistics from the database
    // For now, return placeholder
    return {
      total: 0,
      byType: {},
      byStatus: {},
      totalVehicles: 0,
      totalDrivers: 0,
    };
  }
}

