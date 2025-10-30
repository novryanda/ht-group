/**
 * Mapper for Weighbridge Ticket
 * Converts Prisma models to DTOs
 */

import type {
  WeighbridgeTicket,
  Vehicle,
  SupplierTBS,
  Item,
  Transporter,
  Category,
} from "@prisma/client";
import type {
  WeighbridgeTicketDTO,
  VehicleInfoDTO,
  SupplierInfoDTO,
  ItemInfoDTO,
  VehicleLookupDTO,
  SupplierLookupDTO,
  ItemLookupDTO,
} from "~/server/types/pt-pks/weighbridge";

type WeighbridgeWithRelations = WeighbridgeTicket & {
  vehicle?: Vehicle & { transporter?: Transporter };
  supplier?: SupplierTBS;
  item?: Item & { category?: Category };
};

export class WeighbridgeMapper {
  static toDTO = (
    ticket: WeighbridgeWithRelations
  ): WeighbridgeTicketDTO => {
    return {
      id: ticket.id,
      companyId: ticket.companyId,
      noSeri: ticket.noSeri,
      vehicleId: ticket.vehicleId,
      supplierId: ticket.supplierId,
      itemId: ticket.itemId,
      tanggal: ticket.tanggal.toISOString().split("T")[0] ?? "",
      jamMasuk: ticket.jamMasuk.toISOString(),
      jamKeluar: ticket.jamKeluar?.toISOString() ?? null,
      timbang1: Number(ticket.timbang1),
      timbang2: Number(ticket.timbang2),
      netto1: Number(ticket.netto1),
      potPercent: Number(ticket.potPercent),
      potKg: Number(ticket.potKg),
      beratTerima: Number(ticket.beratTerima),
      lokasiKebun: ticket.lokasiKebun ?? null,
      penimbang: ticket.penimbang ?? null,
      hargaPerKg: Number(ticket.hargaPerKg),
      pphRate: Number(ticket.pphRate),
      upahBongkarPerKg: Number(ticket.upahBongkarPerKg),
      total: Number(ticket.total),
      totalPph: Number(ticket.totalPph),
      totalUpahBongkar: Number(ticket.totalUpahBongkar),
      totalPembayaranSupplier: Number(ticket.totalPembayaranSupplier),
      status: ticket.status,
      purchaseJeId: ticket.purchaseJeId ?? null,
      unloadJeId: ticket.unloadJeId ?? null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      createdById: ticket.createdById,

      // Relations (optional)
      vehicle: ticket.vehicle
        ? WeighbridgeMapper.toVehicleInfo(ticket.vehicle)
        : undefined,
      supplier: ticket.supplier
        ? WeighbridgeMapper.toSupplierInfo(ticket.supplier)
        : undefined,
      item: ticket.item ? WeighbridgeMapper.toItemInfo(ticket.item) : undefined,
    };
  };

  static toDTOList = (
    tickets: WeighbridgeWithRelations[]
  ): WeighbridgeTicketDTO[] => {
    return tickets.map(WeighbridgeMapper.toDTO);
  };

  static toVehicleInfo = (
    vehicle: Vehicle & { transporter?: Transporter }
  ): VehicleInfoDTO => {
    return {
      id: vehicle.id,
      plateNo: vehicle.plateNo,
      type: vehicle.type,
      capacityTons: vehicle.capacityTons ? Number(vehicle.capacityTons) : null,
    };
  };

  static toSupplierInfo = (
    supplier: SupplierTBS
  ): SupplierInfoDTO => {
    // Extract lokasiKebun from profilKebun JSON if exists
    let lokasiKebun: string | null = null;
    if (supplier.profilKebun && typeof supplier.profilKebun === "object") {
      // Assuming profilKebun structure: { lokasi: string } or array
      const profil = supplier.profilKebun as Record<string, unknown>;
      if (profil.lokasi && typeof profil.lokasi === "string") {
        lokasiKebun = profil.lokasi;
      } else if (Array.isArray(profil) && profil.length > 0) {
        const first = profil[0] as Record<string, unknown>;
        if (first?.lokasi && typeof first.lokasi === "string") {
          lokasiKebun = first.lokasi;
        }
      }
    }

    return {
      id: supplier.id,
      namaPemilik: supplier.namaPemilik,
      namaPerusahaan: supplier.namaPerusahaan ?? null,
      alamatRampPeron: supplier.alamatRampPeron ?? null,
      lokasiKebun,
      bankName: supplier.bankName ?? null,
      bankAccountNo: supplier.bankAccountNo ?? null,
      bankAccountName: supplier.bankAccountName ?? null,
    };
  };

  static toItemInfo = (
  item: Item & { category?: Category }
  ): ItemInfoDTO => {
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
    };
  };

  // Lookup mappers for dropdown options
  static toVehicleLookup = (
  vehicle: Vehicle & { transporter?: Transporter }
  ): VehicleLookupDTO => {
    return {
      id: vehicle.id,
      plateNo: vehicle.plateNo,
      type: vehicle.type,
      transporterId: vehicle.transporterId,
      transporterName: vehicle.transporter?.legalName ?? "N/A",
    };
  };

  static toSupplierLookup = (
  supplier: SupplierTBS
  ): SupplierLookupDTO => {
    return {
      id: supplier.id,
      namaPemilik: supplier.namaPemilik,
      namaPerusahaan: supplier.namaPerusahaan ?? null,
      typeSupplier: supplier.typeSupplier,
      pajakPKP: supplier.pajakPKP,
      alamatRampPeron: supplier.alamatRampPeron ?? null,
      bankName: supplier.bankName ?? null,
      bankAccountNo: supplier.bankAccountNo ?? null,
      bankAccountName: supplier.bankAccountName ?? null,
    };
  };

  static toItemLookup = (
  item: Item & { category: Category }
  ): ItemLookupDTO => {
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      categoryName: item.category.name,
    };
  };
}
