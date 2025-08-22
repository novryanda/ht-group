import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function PKSDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard PT PKS</h1>
        <p className="text-muted-foreground">
          Sistem Informasi Manajemen PT PKS - Palm Kernel Shell
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Badge variant="secondary">Gudang</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234 Ton</div>
            <p className="text-xs text-muted-foreground">
              +20.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Badge variant="secondary">HRD</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +2 karyawan baru
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
            <Badge variant="secondary">Supplier</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +3 supplier terverifikasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBS Hari Ini</CardTitle>
            <Badge variant="secondary">Produksi</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.6 Ton</div>
            <p className="text-xs text-muted-foreground">
              +12.5% dari kemarin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Gudang</Badge>
                <span className="text-sm">Permintaan barang baru - SR001234</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">HRD</Badge>
                <span className="text-sm">Karyawan baru terdaftar - ID-PKS-001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Produksi</Badge>
                <span className="text-sm">Penerimaan TBS - 12.5 Ton</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Gudang & Persediaan</span>
                <Badge variant="default">Aktif</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">HRD & Payroll</span>
                <Badge variant="default">Aktif</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Supplier & Pembelian</span>
                <Badge variant="default">Aktif</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Produksi TBS</span>
                <Badge variant="default">Aktif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
