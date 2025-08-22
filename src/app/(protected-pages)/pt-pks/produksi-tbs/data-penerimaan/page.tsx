import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Database, Plus, Search, Filter, Download, TrendingUp, Scale } from "lucide-react";

export default function DataPenerimaanPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Penerimaan TBS</h1>
          <p className="text-muted-foreground">
            Kelola data penerimaan Tandan Buah Segar (TBS) dari supplier
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Input Penerimaan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBS Hari Ini</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.6 Ton</div>
            <p className="text-xs text-muted-foreground">
              12 supplier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBS Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234 Ton</div>
            <p className="text-xs text-muted-foreground">
              +15% vs bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Kualitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.5%</div>
            <p className="text-xs text-muted-foreground">
              Grade A & B
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Kendaraan masuk
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Data
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Periode
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Penerimaan TBS Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">TBS-001-220825</h3>
                <p className="text-sm text-muted-foreground">PT Sawit Makmur | Kebun Blok A</p>
                <p className="text-xs text-muted-foreground">Waktu: 07:15 | No. Pol: B 1234 ABC</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Grade A</Badge>
                <p className="text-sm font-semibold mt-1">8.5 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: 95%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">TBS-002-220825</h3>
                <p className="text-sm text-muted-foreground">CV Bumi Hijau | Kebun Blok C</p>
                <p className="text-xs text-muted-foreground">Waktu: 08:30 | No. Pol: B 5678 DEF</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Grade A</Badge>
                <p className="text-sm font-semibold mt-1">12.3 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: 92%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">TBS-003-220825</h3>
                <p className="text-sm text-muted-foreground">PT Kelapa Sawit | Kebun Blok B</p>
                <p className="text-xs text-muted-foreground">Waktu: 09:45 | No. Pol: B 9012 GHI</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Grade B</Badge>
                <p className="text-sm font-semibold mt-1">6.8 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: 87%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">TBS-004-220825</h3>
                <p className="text-sm text-muted-foreground">Koperasi Tani Sejahtera | Kebun Rakyat</p>
                <p className="text-xs text-muted-foreground">Waktu: 10:20 | No. Pol: B 3456 JKL</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Grade A</Badge>
                <p className="text-sm font-semibold mt-1">18.0 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: 94%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
