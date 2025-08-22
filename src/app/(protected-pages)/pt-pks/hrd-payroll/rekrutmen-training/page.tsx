import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Users, BookOpen, Plus, Search, Filter, Calendar } from "lucide-react";

export default function RekrutmenTrainingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rekrutmen & Training</h1>
          <p className="text-muted-foreground">
            Kelola proses rekrutmen dan program pelatihan karyawan
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Buka Lowongan
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Buat Training
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowongan Aktif</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              3 posisi berbeda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelamar Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Minggu ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Program berjalan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sertifikat Dikeluarkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lowongan Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Operator Mesin</h4>
                  <p className="text-sm text-muted-foreground">Produksi | 2 posisi</p>
                  <p className="text-xs text-muted-foreground">Dibuka: 15 Aug 2025</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Aktif</Badge>
                  <p className="text-xs text-muted-foreground">12 pelamar</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Admin Gudang</h4>
                  <p className="text-sm text-muted-foreground">Gudang | 1 posisi</p>
                  <p className="text-xs text-muted-foreground">Dibuka: 18 Aug 2025</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Aktif</Badge>
                  <p className="text-xs text-muted-foreground">8 pelamar</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Quality Control</h4>
                  <p className="text-sm text-muted-foreground">QC | 1 posisi</p>
                  <p className="text-xs text-muted-foreground">Dibuka: 20 Aug 2025</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Review</Badge>
                  <p className="text-xs text-muted-foreground">3 pelamar</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Safety Training</h4>
                <p className="text-sm text-muted-foreground">Keselamatan Kerja</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">25-27 Aug 2025</p>
                  <Badge variant="default">Berlangsung</Badge>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Machine Operation</h4>
                <p className="text-sm text-muted-foreground">Operasional Mesin</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">28-30 Aug 2025</p>
                  <Badge variant="secondary">Terdaftar</Badge>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Quality Management</h4>
                <p className="text-sm text-muted-foreground">Manajemen Kualitas</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">1-3 Sep 2025</p>
                  <Badge variant="outline">Planned</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
