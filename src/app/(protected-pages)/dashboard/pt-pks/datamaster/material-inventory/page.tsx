import Link from "next/link";
import {
  Package,
  Warehouse,
  MapPin,
  Ruler,
  FolderTree,
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  Settings,
  ClipboardList,
  BarChart3,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function PKSMaterialInventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Material & Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistem manajemen material dan persediaan gudang PT PKS
        </p>
      </div>

      {/* Master Data Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Data Master</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/pt-pks/datamaster/material-inventory/uom">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Unit of Measure (UoM)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kelola satuan ukuran material (kg, liter, pcs, dll)
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/categories">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Kategori Material</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kelola kategori dan klasifikasi material
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/materials">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Material</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kelola data master material dan barang
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/warehouses">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Gudang</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kelola data gudang dan tempat penyimpanan
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/locations">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Lokasi Penyimpanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Kelola lokasi detail dalam gudang (zone, rack, bin)
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Transaksi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/pt-pks/datamaster/material-inventory/opening-balance">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">Saldo Awal</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Input saldo awal stok material
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/grn">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Goods Receipt Note (GRN)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Penerimaan barang masuk gudang
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/issue">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PackageMinus className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base">Goods Issue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pengeluaran barang dari gudang
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/transfer">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base">Stock Transfer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Transfer stok antar lokasi
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/adjustment">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-base">Stock Adjustment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Penyesuaian stok (koreksi)
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/stock-count">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-base">Stock Count (Opname)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stock opname dan perhitungan fisik
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Reports Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/pt-pks/datamaster/material-inventory/stock">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Laporan Stok</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Lihat posisi stok per material dan lokasi
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/pt-pks/datamaster/material-inventory/ledger">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Kartu Stok</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Lihat mutasi dan riwayat pergerakan stok
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
