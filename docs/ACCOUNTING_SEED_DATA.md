# Accounting Seed Data Documentation

## Overview
File `prisma/seed-accounting.ts` berisi data seed lengkap untuk sistem akuntansi PT Perkebunan Sawit (PT PKS), termasuk Chart of Accounts, Fiscal Periods, Opening Balances, dan sample Journal Entries.

## Cara Menjalankan

```bash
# Pastikan database sudah di-sync
npm run db:push

# Jalankan seed accounting
npm run db:seed-accounting
```

## Data yang Di-generate

### 1. Fiscal Periods (12 bulan untuk 2025)
- Periode Januari - September: **CLOSED** (sudah ditutup)
- Periode Oktober - Desember: **OPEN** (masih bisa input transaksi)

### 2. Chart of Accounts (89 akun)

#### AKTIVA (1-xxxx)
**Aktiva Lancar (1-1xxx)**
- **Kas dan Bank (1-1100)**
  - 1-1101: Kas Kecil
  - 1-1102: Bank Mandiri - Operasional
  - 1-1103: Bank BCA - Payroll

- **Piutang (1-1200)**
  - 1-1201: Piutang Dagang - CPO
  - 1-1202: Piutang Dagang - Kernel
  - 1-1203: Piutang Karyawan

- **Persediaan (1-1300)**
  - 1-1301: Persediaan TBS
  - 1-1302: Persediaan CPO
  - 1-1303: Persediaan Kernel
  - 1-1304: Persediaan Material
  - 1-1305: Persediaan Material Dipinjamkan

- **Uang Muka & Biaya Dibayar Dimuka (1-1400)**
  - 1-1401: Uang Muka Pembelian
  - 1-1402: PPN Masukan
  - 1-1403: PPh 22 Dibayar Dimuka
  - 1-1404: PPh 23 Dibayar Dimuka

**Aktiva Tetap (1-2xxx)**
- 1-2100: Tanah
- 1-2200: Bangunan
- 1-2201: Akumulasi Penyusutan Bangunan
- 1-2300: Mesin dan Peralatan
- 1-2301: Akumulasi Penyusutan Mesin
- 1-2400: Kendaraan
- 1-2401: Akumulasi Penyusutan Kendaraan

#### KEWAJIBAN (2-xxxx)
**Kewajiban Lancar (2-1xxx)**
- **Hutang Dagang (2-1100)**
  - 2-1101: Hutang Supplier TBS
  - 2-1102: Hutang Supplier Material

- **Hutang Pajak (2-1200)**
  - 2-1201: PPN Keluaran
  - 2-1202: PPh 21 Terutang
  - 2-1203: PPh 23 Terutang

- **Hutang Lain-lain (2-1300)**
  - 2-1301: Hutang Gaji
  - 2-1302: Hutang BPJS

**Kewajiban Jangka Panjang (2-2xxx)**
- 2-2100: Hutang Bank Jangka Panjang

#### EKUITAS (3-xxxx)
- 3-1000: Modal Disetor
- 3-2000: Laba Ditahan
- 3-3000: Laba Tahun Berjalan

#### PENDAPATAN (4-xxxx)
- 4-1001: Penjualan CPO
- 4-1002: Penjualan Kernel
- 4-1003: Penjualan PKO

#### BEBAN POKOK PENJUALAN (5-xxxx)
- 5-1000: HPP CPO
- 5-2000: HPP Kernel

#### BEBAN OPERASIONAL (6-xxxx)
**Biaya Produksi (6-1xxx)**
- 6-1001: Biaya Pembelian TBS
- 6-1002: Biaya Bongkar SPTI
- 6-1003: Biaya Bongkar SPLO
- 6-1004: Biaya Konsumsi Material Produksi
- 6-1005: Biaya Tenaga Kerja Langsung
- 6-1006: Biaya Listrik Produksi

**Biaya Pemeliharaan (6-2xxx)**
- 6-2001: Biaya Pemeliharaan Mesin
- 6-2002: Biaya Pemeliharaan Kendaraan
- 6-2003: Biaya Pemeliharaan Bangunan
- 6-2004: Biaya Material Pemeliharaan

**Biaya Umum & Administrasi (6-3xxx)**
- 6-3001: Gaji Karyawan
- 6-3002: BPJS Perusahaan
- 6-3003: Biaya Perjalanan Dinas
- 6-3004: Biaya Listrik Kantor
- 6-3005: Biaya Telepon & Internet
- 6-3006: Biaya ATK
- 6-3007: Biaya Penyusutan

**Biaya Penjualan (6-4xxx)**
- 6-4001: Biaya Komisi Penjualan
- 6-4002: Biaya Pengiriman

**Biaya Lain-lain (6-5xxx)**
- 6-5001: Kerugian Penyusutan Persediaan
- 6-5002: Biaya Administrasi Bank

#### PENDAPATAN LAIN-LAIN (7-xxxx)
- 7-1000: Pendapatan Bunga Bank
- 7-2000: Pendapatan Sewa
- 7-3000: Lain-lain

#### BEBAN LAIN-LAIN (8-xxxx)
- 8-1000: Beban Bunga Bank
- 8-2000: Beban Denda

### 3. System Account Mappings (22 mappings)
Pemetaan akun sistem untuk transaksi otomatis:
- `TBS_PURCHASE` → 6-1001 (Biaya Pembelian TBS)
- `INVENTORY_TBS` → 1-1301 (Persediaan TBS)
- `AP_SUPPLIER_TBS` → 2-1101 (Hutang Supplier TBS)
- `SALES_CPO` → 4-1001 (Penjualan CPO)
- `SALES_KERNEL` → 4-1002 (Penjualan Kernel)
- `INVENTORY_CPO` → 1-1302 (Persediaan CPO)
- `INVENTORY_KERNEL` → 1-1303 (Persediaan Kernel)
- `INVENTORY_GENERAL` → 1-1304 (Persediaan Material)
- `COGS_CPO` → 5-1000 (HPP CPO)
- `COGS_KERNEL` → 5-2000 (HPP Kernel)
- `CASH_DEFAULT` → 1-1101 (Kas Kecil)
- `BANK_DEFAULT` → 1-1102 (Bank Mandiri)
- `PPN_KELUARAN` → 2-1201
- `PPN_MASUKAN` → 1-1402
- `PPH22_DEFAULT` → 1-1403
- `PPH23_DEFAULT` → 1-1404
- `INVENTORY_ON_LOAN` → 1-1305
- `INVENTORY_ADJUSTMENT_LOSS` → 6-5001
- `PRODUCTION_CONSUMPTION` → 6-1004
- `MAINTENANCE_EXPENSE_DEFAULT` → 6-2004

### 4. Opening Balances (Oktober 2025)
**Total Aktiva: Rp 10,835,000,000**
- Kas & Bank: Rp 405,000,000
- Persediaan: Rp 805,000,000
- Aset Tetap (net): Rp 9,625,000,000

**Total Kewajiban: Rp 2,165,000,000**
- Hutang Lancar: Rp 165,000,000
- Hutang Jangka Panjang: Rp 2,000,000,000

**Total Ekuitas: Rp 8,670,000,000**
- Modal Disetor: Rp 5,000,000,000
- Laba Ditahan: Rp 2,335,000,000
- Laba Tahun Berjalan: Rp 1,335,000,000

**✅ Balance Check: Aktiva = Kewajiban + Ekuitas** ✅

### 5. Sample Journal Entries (12 transaksi Oktober 2025)

#### JU-2025-10-001 (05 Okt 2025) - Pembelian TBS
```
Persediaan TBS         Rp  85,000,000 (Debit)
  Hutang Supplier TBS  Rp  85,000,000 (Credit)
```
*Pembelian TBS 42.5 ton @ Rp 2,000,000/ton*

#### JU-2025-10-002 (10 Okt 2025) - Pembayaran Hutang
```
Hutang Supplier TBS    Rp 120,000,000 (Debit)
  Bank Mandiri         Rp 120,000,000 (Credit)
```
*Pelunasan hutang periode sebelumnya*

#### JU-2025-10-003 (12 Okt 2025) - Penjualan CPO
```
Piutang CPO            Rp 555,000,000 (Debit)
  Penjualan CPO        Rp 500,000,000 (Credit)
  PPN Keluaran         Rp  55,000,000 (Credit)
```
*Penjualan CPO 50 ton @ Rp 10,000,000/ton + PPN 11%*

#### JU-2025-10-004 (12 Okt 2025) - HPP CPO
```
HPP CPO                Rp 400,000,000 (Debit)
  Persediaan CPO       Rp 400,000,000 (Credit)
```
*Beban pokok penjualan untuk 50 ton CPO*

#### JU-2025-10-005 (15 Okt 2025) - Penerimaan Pembayaran
```
Bank Mandiri           Rp 555,000,000 (Debit)
  Piutang CPO          Rp 555,000,000 (Credit)
```
*Penerimaan pembayaran dari buyer*

#### JU-2025-10-006 (25 Okt 2025) - Gaji Karyawan
```
Gaji Karyawan          Rp 125,000,000 (Debit)
  Bank BCA             Rp 125,000,000 (Credit)
```
*Pembayaran gaji bulan Oktober*

#### JU-2025-10-007 (26 Okt 2025) - Biaya Listrik
```
Biaya Listrik Produksi Rp  45,000,000 (Debit)
Biaya Listrik Kantor   Rp   8,000,000 (Debit)
  Bank Mandiri         Rp  53,000,000 (Credit)
```
*Pembayaran tagihan listrik*

#### JU-2025-10-008 (18 Okt 2025) - Pembelian Material
```
Persediaan Material    Rp  30,000,000 (Debit)
PPN Masukan            Rp   3,300,000 (Debit)
  Hutang Supplier Mat  Rp  33,300,000 (Credit)
```
*Pembelian spare parts mesin*

#### JU-2025-10-009 (20 Okt 2025) - Pemakaian Material
```
Biaya Material Maint   Rp  12,000,000 (Debit)
  Persediaan Material  Rp  12,000,000 (Credit)
```
*Pemakaian material untuk maintenance (GoodsIssue)*

#### JU-2025-10-010 (22 Okt 2025) - Penjualan Kernel
```
Bank Mandiri           Rp 166,500,000 (Debit)
  Penjualan Kernel     Rp 150,000,000 (Credit)
  PPN Keluaran         Rp  16,500,000 (Credit)
```
*Penjualan Kernel 30 ton @ Rp 5,000,000/ton + PPN 11%*

#### JU-2025-10-011 (22 Okt 2025) - HPP Kernel
```
HPP Kernel             Rp 120,000,000 (Debit)
  Persediaan Kernel    Rp 120,000,000 (Credit)
```
*Beban pokok penjualan untuk 30 ton Kernel*

#### JU-2025-10-012 (28 Okt 2025) - Biaya BPJS
```
BPJS Perusahaan        Rp  15,000,000 (Debit)
  Bank Mandiri         Rp  15,000,000 (Credit)
```
*Pembayaran BPJS karyawan*

## Ringkasan Transaksi Oktober 2025

### Pendapatan
- Penjualan CPO: Rp 500,000,000
- Penjualan Kernel: Rp 150,000,000
- **Total Pendapatan: Rp 650,000,000**

### Beban Pokok Penjualan
- HPP CPO: Rp 400,000,000
- HPP Kernel: Rp 120,000,000
- **Total COGS: Rp 520,000,000**

### Laba Kotor
- **Rp 130,000,000 (20% gross margin)**

### Beban Operasional
- Gaji: Rp 125,000,000
- Listrik: Rp 53,000,000
- Material Maintenance: Rp 12,000,000
- BPJS: Rp 15,000,000
- **Total Operating Expenses: Rp 205,000,000**

### Laba/(Rugi) Operasional
- **(Rp 75,000,000) - Operating Loss**

### Arus Kas
**Kas Masuk:**
- Penerimaan penjualan CPO: Rp 555,000,000
- Penerimaan penjualan Kernel: Rp 166,500,000
- **Total: Rp 721,500,000**

**Kas Keluar:**
- Pembayaran hutang TBS: Rp 120,000,000
- Gaji: Rp 125,000,000
- Listrik: Rp 53,000,000
- BPJS: Rp 15,000,000
- **Total: Rp 313,000,000**

**Net Cash Flow: Rp 408,500,000** (positive)

## Testing Data

### Login Credentials
```
Email: admin@ptpks.com
Password: admin123
Role: PT_PKS_ADMIN
```

### Menu Navigation
1. Login dengan kredensial di atas
2. Navigasi ke: **PT-PKS** → **Keuangan**
3. Pilih salah satu menu:
   - **Jurnal Umum**: Lihat semua 12 transaksi jurnal
   - **Buku Besar**: Pilih akun dan lihat mutasi detail
   - **Neraca**: Lihat posisi keuangan per tanggal
   - **Laba Rugi**: Lihat laporan laba rugi periode

### Expected Results
✅ Jurnal Umum: 12 entries dengan total debit = total credit  
✅ Buku Besar: Running balance untuk setiap akun  
✅ Neraca: Balanced (Assets = Liabilities + Equity)  
✅ Laba Rugi: Menampilkan operating loss Rp 75,000,000

## Notes
- Semua transaksi menggunakan tanggal Oktober 2025
- PPN rate: 11%
- Periode Oktober 2025 masih OPEN untuk input transaksi baru
- Data ini adalah sample untuk testing dan demo purposes
- Untuk production, jalankan seed ini setelah fresh database setup

## Related Files
- **Seed Script**: `prisma/seed-accounting.ts`
- **Services**: `src/server/services/pt-pks/*.service.ts`
- **API Routes**: `src/app/api/pt-pks/jurnal-umum|buku-besar|neraca|laporan-keuangan/route.ts`
- **Components**: `src/components/dashboard/pt-pks/laporan/keuangan/*/*.tsx`
