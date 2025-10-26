-- CreateTable
CREATE TABLE "PksMutuProduksi" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "shift" VARCHAR(10) NOT NULL,
    "payload" JSONB NOT NULL,
    "syncStatus" VARCHAR(20),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PksMutuProduksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PksMutuProduksi_rowId_key" ON "PksMutuProduksi"("rowId");

-- CreateIndex
CREATE INDEX "PksMutuProduksi_tanggal_idx" ON "PksMutuProduksi"("tanggal");

-- CreateIndex
CREATE INDEX "PksMutuProduksi_shift_idx" ON "PksMutuProduksi"("shift");

-- CreateIndex
CREATE UNIQUE INDEX "PksMutuProduksi_tanggal_shift_key" ON "PksMutuProduksi"("tanggal", "shift");
