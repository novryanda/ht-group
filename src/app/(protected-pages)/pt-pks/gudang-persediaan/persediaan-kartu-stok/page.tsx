import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Search, Filter, TrendingUp, TrendingDown } from "lucide-react";

export default function PersediaanKartuStokPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Persediaan & Kartu Stok</h1>
        <p className="text-muted-foreground">
          Monitor persediaan real-time dan riwayat kartu stok
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234.5 Ton</div>
            <p className="text-xs text-muted-foreground">
              +15% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Minimum</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Items</div>
            <p className="text-xs text-muted-foreground">
              Perlu restock segera
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mutasi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Transaksi masuk/keluar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 2.5M</div>
            <p className="text-xs text-muted-foreground">
              Total nilai persediaan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Barang
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kartu Stok Real-time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Palm Kernel Shell Grade A</h3>
                <p className="text-sm text-muted-foreground">MT-PKS-001</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">850.2 Ton</p>
                <Badge variant="default">Normal</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Palm Kernel Shell Grade B</h3>
                <p className="text-sm text-muted-foreground">MT-PKS-002</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">384.3 Ton</p>
                <Badge variant="secondary">Low Stock</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Spare Part Crusher</h3>
                <p className="text-sm text-muted-foreground">MT-PKS-003</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">12 Unit</p>
                <Badge variant="destructive">Critical</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
