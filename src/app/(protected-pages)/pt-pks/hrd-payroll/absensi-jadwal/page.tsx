import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Calendar, Clock, Search, Filter, Download } from "lucide-react";

export default function AbsensiJadwalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Absensi & Jadwal Kerja</h1>
        <p className="text-muted-foreground">
          Monitor absensi karyawan dan atur jadwal kerja
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">118</div>
            <p className="text-xs text-muted-foreground">
              93% dari total karyawan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              4% dari karyawan hadir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              3 sakit, 1 izin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shift Aktif</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Pagi, Siang, Malam
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
          Export Laporan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Ahmad Suryanto</h4>
                  <p className="text-xs text-muted-foreground">PKS-001 | Shift Pagi</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Hadir</Badge>
                  <p className="text-xs text-muted-foreground">07:45</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Siti Nurhaliza</h4>
                  <p className="text-xs text-muted-foreground">PKS-002 | Shift Pagi</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Terlambat</Badge>
                  <p className="text-xs text-muted-foreground">08:15</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Budi Santoso</h4>
                  <p className="text-xs text-muted-foreground">PKS-003 | Shift Pagi</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">Tidak Hadir</Badge>
                  <p className="text-xs text-muted-foreground">Sakit</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jadwal Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Shift Pagi</h4>
                <p className="text-sm text-muted-foreground">07:00 - 15:00</p>
                <p className="text-xs text-muted-foreground">65 karyawan</p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Shift Siang</h4>
                <p className="text-sm text-muted-foreground">15:00 - 23:00</p>
                <p className="text-xs text-muted-foreground">40 karyawan</p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Shift Malam</h4>
                <p className="text-sm text-muted-foreground">23:00 - 07:00</p>
                <p className="text-xs text-muted-foreground">22 karyawan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
