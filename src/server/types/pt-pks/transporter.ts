import { 
  type Transporter, 
  type Vehicle, 
  type Driver, 
  type TransportTariff, 
  type TransportContract,
  TransporterType, 
  PkpStatus, 
  RecordStatus 
} from "@prisma/client";

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface VehicleDTO {
  plateNo: string;
  type: string;
  capacityTons?: number;
  stnkUrl?: string;
  stnkValidThru?: Date | string;
  kirUrl?: string;
  kirValidThru?: Date | string;
  gpsId?: string;
  photoUrl?: string;
}

export interface DriverDTO {
  name: string;
  phone?: string;
  nik?: string;
  simType?: string;
  simUrl?: string;
  simValidThru?: Date | string;
}

export interface TariffDTO {
  origin: string;
  destination: string;
  commodity: string;
  unit: string; // TON | KM | TRIP
  price: number;
  includeToll?: boolean;
  includeUnload?: boolean;
  includeTax?: boolean;
  notes?: string;
}

export interface ContractDTO {
  contractNo: string;
  buyerId?: string;
  commodity: string;
  startDate?: Date | string;
  endDate?: Date | string;
  baseTariffId?: string;
  dokUrl?: string;
}

export interface CreateTransporterDTO {
  type: TransporterType;
  legalName: string;
  tradeName?: string;
  npwp?: string;
  pkpStatus: PkpStatus;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  picName?: string;
  picPhone?: string;
  picEmail?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountNm?: string;
  statementUrl?: string;
  notes?: string;
  vehicles?: VehicleDTO[];
  drivers?: DriverDTO[];
  tariffs?: TariffDTO[];
  contracts?: ContractDTO[];
}

export interface UpdateTransporterDTO {
  type?: TransporterType;
  legalName?: string;
  tradeName?: string;
  npwp?: string;
  pkpStatus?: PkpStatus;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  picName?: string;
  picPhone?: string;
  picEmail?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountNm?: string;
  statementUrl?: string;
  status?: RecordStatus;
  notes?: string;
  vehicles?: VehicleDTO[];
  drivers?: DriverDTO[];
  tariffs?: TariffDTO[];
  contracts?: ContractDTO[];
}

export interface TransporterWithRelations extends Transporter {
  vehicles: Vehicle[];
  drivers: Driver[];
  tariffs: TransportTariff[];
  contracts: TransportContract[];
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface TransporterFilter {
  query?: string; // Search by legalName, tradeName, npwp, plateNo
  type?: TransporterType;
  pkpStatus?: PkpStatus;
  status?: RecordStatus;
  city?: string;
  province?: string;
  commodity?: string; // Filter by tariff commodity
}

export interface TransporterPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TransporterListResult {
  transporters: TransporterWithRelations[];
  total: number;
}

// ============================================================================
// Tariff Calculation Types
// ============================================================================

export interface TariffCalculationParams {
  tariffId: string;
  quantity: number; // tons, km, or trips depending on unit
}

export interface TariffCalculationResult {
  baseAmount: number;
  tollAmount?: number;
  unloadAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  unit: string;
  quantity: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TransporterApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
  statusCode: number;
}

export interface TransporterListResponse extends TransporterApiResponse<TransporterWithRelations[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Re-export Prisma enums for convenience
// ============================================================================

export { TransporterType, PkpStatus, RecordStatus };

