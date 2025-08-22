import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Truck, Plus, Search, Filter, Download, Scale, ClipboardCheck } from "lucide-react";

export default function PenerimaanBahanBakuPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Penerimaan Bahan Baku</h1>
          <p className="text-muted-foreground">
            Kelola penerimaan dan inspeksi bahan baku dari supplier
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
            <CardTitle className="text-sm font-medium">Penerimaan Hari Ini</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Kendaraan masuk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tonase</CardTitle>
            <Scale className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.5 Ton</div>
            <p className="text-xs text-muted-foreground">
              Bahan baku diterima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Inspection</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Menunggu QC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-muted-foreground">
              Tingkat kualitas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Penerimaan
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Supplier
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Laporan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Penerimaan Bahan Baku Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-001-220825</h3>
                <p className="text-sm text-muted-foreground">PT Sawit Makmur | TBS Grade A</p>
                <p className="text-xs text-muted-foreground">Truck: B 1234 ABC | Driver: Ahmad</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Approved</Badge>
                <p className="text-sm font-semibold mt-1">15.5 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: 95%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-002-220825</h3>
                <p className="text-sm text-muted-foreground">CV Bumi Hijau | TBS Grade A</p>
                <p className="text-xs text-muted-foreground">Truck: B 5678 DEF | Driver: Budi</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">Inspection</Badge>
                <p className="text-sm font-semibold mt-1">22.3 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: Pending</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-003-220825</h3>
                <p className="text-sm text-muted-foreground">PT Kelapa Sawit | TBS Grade B</p>
                <p className="text-xs text-muted-foreground">Truck: B 9012 GHI | Driver: Sari</p>
              </div>
              <div className="text-right">
                <Badge variant="destructive">Rejected</Badge>
                <p className="text-sm font-semibold mt-1">18.7 Ton</p>
                <p className="text-xs text-muted-foreground">Quality: 78%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-004-220825</h3>
                <p className="text-sm text-muted-foreground">UD Sumber Rejeki | Spare Part</p>
                <p className="text-xs text-muted-foreground">Truck: B 3456 JKL | Driver: Andi</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Approved</Badge>
                <p className="text-sm font-semibold mt-1">250 Items</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
