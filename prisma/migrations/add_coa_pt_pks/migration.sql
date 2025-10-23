-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GROUP_VIEWER', 'EXECUTIVE', 'PT_MANAGER', 'PT_NILO_ADMIN', 'PT_ZTA_ADMIN', 'PT_TAM_ADMIN', 'PT_HTK_ADMIN', 'PT_PKS_ADMIN', 'UNIT_SUPERVISOR', 'TECHNICIAN', 'OPERATOR', 'HR', 'FINANCE_AR', 'FINANCE_AP', 'GL_ACCOUNTANT');

-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('RAMP_PERON', 'KUD', 'KELOMPOK_TANI');

-- CreateEnum
CREATE TYPE "PajakPKP" AS ENUM ('PKP_11_PERSEN', 'PKP_1_1_PERSEN', 'NON_PKP');

-- CreateEnum
CREATE TYPE "FamilyRelation" AS ENUM ('ISTRI', 'ANAK');

-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('COMPANY', 'PERSON');

-- CreateEnum
CREATE TYPE "PkpStatus" AS ENUM ('NON_PKP', 'PKP_11', 'PKP_1_1');

-- CreateEnum
CREATE TYPE "BuyerStatus" AS ENUM ('DRAFT', 'VERIFIED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransporterType" AS ENUM ('PERUSAHAAN', 'PERORANGAN');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "AccountClass" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'COGS', 'EXPENSE', 'OTHER_INCOME', 'OTHER_EXPENSE');

-- CreateEnum
CREATE TYPE "NormalSide" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "TaxCode" AS ENUM ('NON_TAX', 'PPN_MASUKAN', 'PPN_KELUARAN', 'PPH21', 'PPH22', 'PPH23');

-- CreateEnum
CREATE TYPE "SystemAccountKey" AS ENUM ('TBS_PURCHASE', 'INVENTORY_TBS', 'AP_SUPPLIER_TBS', 'UNLOADING_EXPENSE_SPTI', 'UNLOADING_EXPENSE_SPLO', 'SALES_CPO', 'SALES_KERNEL', 'INVENTORY_CPO', 'INVENTORY_KERNEL', 'COGS_CPO', 'COGS_KERNEL', 'CASH_DEFAULT', 'BANK_DEFAULT', 'PPN_KELUARAN', 'PPN_MASUKAN', 'PPH22_DEFAULT', 'PPH23_DEFAULT');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan" (
    "id_karyawan" TEXT NOT NULL,
    "nama" VARCHAR(100),
    "status_kk" VARCHAR(50),
    "jenis_kelamin" CHAR(1),
    "agama" VARCHAR(30),
    "suku" VARCHAR(50),
    "golongan_darah" VARCHAR(5),
    "no_telp_hp" VARCHAR(20),
    "tempat_lahir" VARCHAR(50),
    "tanggal_lahir" TIMESTAMP(3),
    "umur" INTEGER,
    "alamat_rt_rw" VARCHAR(20),
    "alamat_desa" VARCHAR(100),
    "alamat_kecamatan" VARCHAR(100),
    "alamat_kabupaten" VARCHAR(100),
    "alamat_provinsi" VARCHAR(100),
    "pendidikan_terakhir" VARCHAR(50),
    "jurusan" VARCHAR(100),
    "jabatan" VARCHAR(100),
    "devisi" VARCHAR(100),
    "level" VARCHAR(50),
    "tgl_masuk_kerja" TIMESTAMP(3),
    "tgl_terakhir_kerja" TIMESTAMP(3),
    "masa_kerja" VARCHAR(50),
    "status_pkwt" VARCHAR(50),
    "no_bpjs_tenaga_kerja" VARCHAR(50),
    "no_nik_ktp" VARCHAR(20),
    "no_bpjs_kesehatan" VARCHAR(50),
    "no_npwp" VARCHAR(50),
    "status_pajak" VARCHAR(20),
    "no_rekening_bank" VARCHAR(50),
    "perusahaan_sebelumnya" VARCHAR(100),
    "companyId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawan_pkey" PRIMARY KEY ("id_karyawan")
);

-- CreateTable
CREATE TABLE "employee_family" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "hubungan" "FamilyRelation" NOT NULL,
    "jenis_kelamin" CHAR(1),
    "tanggal_lahir" TIMESTAMP(3),
    "umur" INTEGER,
    "no_nik_ktp" VARCHAR(20),
    "no_bpjs_kesehatan" VARCHAR(50),
    "no_telp_hp" VARCHAR(20),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierTBS" (
    "id" TEXT NOT NULL,
    "nomorForm" TEXT,
    "typeSupplier" "SupplierType" NOT NULL,
    "pajakPKP" "PajakPKP" NOT NULL DEFAULT 'NON_PKP',
    "namaPemilik" TEXT NOT NULL,
    "alamatPemilik" TEXT,
    "hpPemilik" TEXT,
    "namaPerusahaan" TEXT,
    "alamatRampPeron" TEXT,
    "hpPerusahaan" TEXT,
    "bujur" TEXT,
    "lintang" TEXT,
    "profilKebun" JSONB,
    "pengelolaanSwadaya" TEXT,
    "pengelolaanKelompok" TEXT,
    "pengelolaanPerusahaan" TEXT,
    "jenisBibit" TEXT,
    "sertifikasiISPO" BOOLEAN NOT NULL DEFAULT false,
    "sertifikasiRSPO" BOOLEAN NOT NULL DEFAULT false,
    "aktePendirian" TEXT,
    "aktePerubahan" TEXT,
    "nib" TEXT,
    "siup" TEXT,
    "npwp" TEXT,
    "penjualanLangsungPKS" TEXT,
    "penjualanAgen" TEXT,
    "transportMilikSendiri" INTEGER,
    "transportPihak3" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierTBS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "buyerCode" TEXT NOT NULL,
    "type" "BuyerType" NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "npwp" TEXT,
    "pkpStatus" "PkpStatus" NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT,
    "billingEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationAddr" TEXT NOT NULL,
    "status" "BuyerStatus" NOT NULL DEFAULT 'VERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerContact" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isBilling" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BuyerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerDoc" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,

    CONSTRAINT "BuyerDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transporter" (
    "id" TEXT NOT NULL,
    "type" "TransporterType" NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "npwp" TEXT,
    "pkpStatus" "PkpStatus" NOT NULL,
    "addressLine" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "picName" TEXT,
    "picPhone" TEXT,
    "picEmail" TEXT,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankAccountNm" TEXT,
    "statementUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "status" "RecordStatus" NOT NULL DEFAULT 'AKTIF',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transporter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "plateNo" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacityTons" DECIMAL(10,2),
    "stnkUrl" TEXT,
    "stnkValidThru" TIMESTAMP(3),
    "kirUrl" TEXT,
    "kirValidThru" TIMESTAMP(3),
    "gpsId" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "nik" TEXT,
    "simType" TEXT,
    "simUrl" TEXT,
    "simValidThru" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportTariff" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "commodity" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "includeToll" BOOLEAN NOT NULL DEFAULT false,
    "includeUnload" BOOLEAN NOT NULL DEFAULT false,
    "includeTax" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportTariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportContract" (
    "id" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "buyerId" TEXT,
    "commodity" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "baseTariffId" TEXT,
    "dokUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "AccountClass" NOT NULL,
    "normalSide" "NormalSide" NOT NULL,
    "isPosting" BOOLEAN NOT NULL DEFAULT true,
    "isCashBank" BOOLEAN NOT NULL DEFAULT false,
    "taxCode" "TaxCode" NOT NULL DEFAULT 'NON_TAX',
    "currency" VARCHAR(10),
    "description" VARCHAR(300),
    "status" "RecordStatus" NOT NULL DEFAULT 'AKTIF',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAccountMap" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "key" "SystemAccountKey" NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemAccountMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalPeriod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_userId_key" ON "karyawan"("userId");

-- CreateIndex
CREATE INDEX "employee_family_employeeId_idx" ON "employee_family"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierTBS_nib_key" ON "SupplierTBS"("nib");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierTBS_npwp_key" ON "SupplierTBS"("npwp");

-- CreateIndex
CREATE INDEX "SupplierTBS_typeSupplier_idx" ON "SupplierTBS"("typeSupplier");

-- CreateIndex
CREATE INDEX "SupplierTBS_pajakPKP_idx" ON "SupplierTBS"("pajakPKP");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_buyerCode_key" ON "Buyer"("buyerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_npwp_key" ON "Buyer"("npwp");

-- CreateIndex
CREATE INDEX "Buyer_type_idx" ON "Buyer"("type");

-- CreateIndex
CREATE INDEX "Buyer_status_idx" ON "Buyer"("status");

-- CreateIndex
CREATE INDEX "Buyer_city_idx" ON "Buyer"("city");

-- CreateIndex
CREATE INDEX "Buyer_province_idx" ON "Buyer"("province");

-- CreateIndex
CREATE INDEX "BuyerContact_buyerId_idx" ON "BuyerContact"("buyerId");

-- CreateIndex
CREATE INDEX "BuyerDoc_buyerId_idx" ON "BuyerDoc"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "Transporter_npwp_key" ON "Transporter"("npwp");

-- CreateIndex
CREATE INDEX "Transporter_legalName_idx" ON "Transporter"("legalName");

-- CreateIndex
CREATE INDEX "Transporter_pkpStatus_idx" ON "Transporter"("pkpStatus");

-- CreateIndex
CREATE INDEX "Transporter_status_idx" ON "Transporter"("status");

-- CreateIndex
CREATE INDEX "Transporter_city_idx" ON "Transporter"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNo_key" ON "Vehicle"("plateNo");

-- CreateIndex
CREATE INDEX "Vehicle_transporterId_idx" ON "Vehicle"("transporterId");

-- CreateIndex
CREATE INDEX "Vehicle_plateNo_idx" ON "Vehicle"("plateNo");

-- CreateIndex
CREATE INDEX "Driver_transporterId_idx" ON "Driver"("transporterId");

-- CreateIndex
CREATE INDEX "Driver_name_idx" ON "Driver"("name");

-- CreateIndex
CREATE INDEX "TransportTariff_transporterId_origin_destination_commodity_idx" ON "TransportTariff"("transporterId", "origin", "destination", "commodity");

-- CreateIndex
CREATE UNIQUE INDEX "TransportContract_contractNo_key" ON "TransportContract"("contractNo");

-- CreateIndex
CREATE INDEX "TransportContract_transporterId_idx" ON "TransportContract"("transporterId");

-- CreateIndex
CREATE INDEX "TransportContract_contractNo_idx" ON "TransportContract"("contractNo");

-- CreateIndex
CREATE INDEX "Account_companyId_class_idx" ON "Account"("companyId", "class");

-- CreateIndex
CREATE INDEX "Account_parentId_idx" ON "Account"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_companyId_code_key" ON "Account"("companyId", "code");

-- CreateIndex
CREATE INDEX "SystemAccountMap_accountId_idx" ON "SystemAccountMap"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemAccountMap_companyId_key_key" ON "SystemAccountMap"("companyId", "key");

-- CreateIndex
CREATE INDEX "FiscalPeriod_companyId_isClosed_idx" ON "FiscalPeriod"("companyId", "isClosed");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalPeriod_companyId_year_month_key" ON "FiscalPeriod"("companyId", "year", "month");

-- CreateIndex
CREATE INDEX "OpeningBalance_accountId_idx" ON "OpeningBalance"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningBalance_companyId_periodId_accountId_key" ON "OpeningBalance"("companyId", "periodId", "accountId");

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_family" ADD CONSTRAINT "employee_family_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "karyawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerContact" ADD CONSTRAINT "BuyerContact_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerDoc" ADD CONSTRAINT "BuyerDoc_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportTariff" ADD CONSTRAINT "TransportTariff_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportContract" ADD CONSTRAINT "TransportContract_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccountMap" ADD CONSTRAINT "SystemAccountMap_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAccountMap" ADD CONSTRAINT "SystemAccountMap_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalPeriod" ADD CONSTRAINT "FiscalPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "FiscalPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

