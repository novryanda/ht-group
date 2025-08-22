import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Calculator, DollarSign, Search, Filter, Download } from "lucide-react";

export default function PenggajianLemburPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Penggajian & Lembur</h1>
        <p className="text-muted-foreground">
          Kelola penggajian karyawan dan perhitungan lembur
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 285M</div>
            <p className="text-xs text-muted-foreground">
              Bulan Agustus 2025
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lembur</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342 Jam</div>
            <p className="text-xs text-muted-foreground">
              Rp 25.2M nilai lembur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slip Gaji Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Menunggu approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">122</div>
            <p className="text-xs text-muted-foreground">
              96% karyawan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Karyawan
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Periode
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Payroll
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Slip Gaji Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Ahmad Suryanto</h4>
                  <p className="text-xs text-muted-foreground">PKS-001 | Supervisor</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Paid</Badge>
                  <p className="text-sm font-semibold">Rp 4.5M</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Siti Nurhaliza</h4>
                  <p className="text-xs text-muted-foreground">PKS-002 | Admin</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Paid</Badge>
                  <p className="text-sm font-semibold">Rp 3.2M</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Budi Santoso</h4>
                  <p className="text-xs text-muted-foreground">PKS-003 | Operator</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Pending</Badge>
                  <p className="text-sm font-semibold">Rp 2.8M</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rekap Lembur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Lembur Weekday</h4>
                <p className="text-sm text-muted-foreground">245 jam @ Rp 65,000</p>
                <p className="text-sm font-semibold">Rp 15.9M</p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Lembur Weekend</h4>
                <p className="text-sm text-muted-foreground">97 jam @ Rp 95,000</p>
                <p className="text-sm font-semibold">Rp 9.2M</p>
              </div>

              <div className="p-3 border rounded-lg bg-muted">
                <h4 className="font-semibold">Total Lembur</h4>
                <p className="text-sm text-muted-foreground">342 jam</p>
                <p className="text-lg font-bold">Rp 25.1M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
