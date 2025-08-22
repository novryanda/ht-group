import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Calendar, Plus, Search, Filter, Clock } from "lucide-react";

export default function CutiPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cuti</h1>
          <p className="text-muted-foreground">
            Kelola pengajuan cuti dan saldo cuti karyawan
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajukan Cuti
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengajuan Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Menunggu approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Cuti</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Karyawan cuti hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuti Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Total hari cuti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Rata-rata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9.5</div>
            <p className="text-xs text-muted-foreground">
              Hari per karyawan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Pengajuan
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pengajuan Cuti Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Ahmad Suryanto</h4>
                  <p className="text-sm text-muted-foreground">Cuti Tahunan</p>
                  <p className="text-xs text-muted-foreground">25-29 Aug 2025 (5 hari)</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Siti Nurhaliza</h4>
                  <p className="text-sm text-muted-foreground">Cuti Sakit</p>
                  <p className="text-xs text-muted-foreground">22-23 Aug 2025 (2 hari)</p>
                </div>
                <Badge variant="default">Approved</Badge>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Budi Santoso</h4>
                  <p className="text-sm text-muted-foreground">Cuti Pribadi</p>
                  <p className="text-xs text-muted-foreground">30 Aug 2025 (1 hari)</p>
                </div>
                <Badge variant="destructive">Rejected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saldo Cuti Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Ahmad Suryanto</h4>
                  <p className="text-xs text-muted-foreground">PKS-001</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">8 hari</p>
                  <p className="text-xs text-muted-foreground">Sisa saldo</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Siti Nurhaliza</h4>
                  <p className="text-xs text-muted-foreground">PKS-002</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">12 hari</p>
                  <p className="text-xs text-muted-foreground">Sisa saldo</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Budi Santoso</h4>
                  <p className="text-xs text-muted-foreground">PKS-003</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">15 hari</p>
                  <p className="text-xs text-muted-foreground">Sisa saldo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
