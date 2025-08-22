import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Scale, Plus, Search, Filter, Download, Eye, Edit, Printer } from "lucide-react";

export default function SlipTimbanganPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Slip Timbangan</h1>
          <p className="text-muted-foreground">
            Kelola slip timbangan untuk penimbangan TBS masuk dan keluar
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat Slip Baru
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slip Hari Ini</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36</div>
            <p className="text-xs text-muted-foreground">
              18 masuk, 18 keluar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berat Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.5 Ton</div>
            <p className="text-xs text-muted-foreground">
              Total hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berat Netto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.6 Ton</div>
            <p className="text-xs text-muted-foreground">
              Setelah tara
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akurasi Timbangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              Tingkat akurasi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Slip
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Jenis
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slip Timbangan Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">ST-IN-001-220825</h3>
                <p className="text-sm text-muted-foreground">PT Sawit Makmur | B 1234 ABC</p>
                <p className="text-xs text-muted-foreground">Masuk: 07:15 | Keluar: 07:45</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="default">Completed</Badge>
                  <p className="text-sm font-semibold">Bruto: 15.2 Ton</p>
                  <p className="text-sm font-semibold">Netto: 8.5 Ton</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">ST-IN-002-220825</h3>
                <p className="text-sm text-muted-foreground">CV Bumi Hijau | B 5678 DEF</p>
                <p className="text-xs text-muted-foreground">Masuk: 08:30 | Keluar: 09:15</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="default">Completed</Badge>
                  <p className="text-sm font-semibold">Bruto: 18.8 Ton</p>
                  <p className="text-sm font-semibold">Netto: 12.3 Ton</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">ST-IN-003-220825</h3>
                <p className="text-sm text-muted-foreground">PT Kelapa Sawit | B 9012 GHI</p>
                <p className="text-xs text-muted-foreground">Masuk: 09:45 | Keluar: -</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="secondary">In Progress</Badge>
                  <p className="text-sm font-semibold">Bruto: 13.3 Ton</p>
                  <p className="text-sm font-semibold">Netto: -</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">ST-IN-004-220825</h3>
                <p className="text-sm text-muted-foreground">Koperasi Tani Sejahtera | B 3456 JKL</p>
                <p className="text-xs text-muted-foreground">Masuk: 10:20 | Keluar: 11:05</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="default">Completed</Badge>
                  <p className="text-sm font-semibold">Bruto: 24.7 Ton</p>
                  <p className="text-sm font-semibold">Netto: 18.0 Ton</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
