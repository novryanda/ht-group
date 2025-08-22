import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Filter, Plus, Search, Download, Eye, CheckCircle, XCircle } from "lucide-react";

export default function SortasiPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sortasi</h1>
          <p className="text-muted-foreground">
            Proses sortasi dan grading TBS berdasarkan kualitas
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Input Sortasi
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBS Grade A</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.1 Ton</div>
            <p className="text-xs text-muted-foreground">
              70% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBS Grade B</CardTitle>
            <Filter className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11.2 Ton</div>
            <p className="text-xs text-muted-foreground">
              25% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TBS Reject</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 Ton</div>
            <p className="text-xs text-muted-foreground">
              5% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Tingkat efisiensi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Batch
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Grade
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Hasil
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hasil Sortasi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Batch-001-220825</h4>
                  <p className="text-sm text-muted-foreground">PT Sawit Makmur</p>
                  <p className="text-xs text-muted-foreground">Waktu: 08:15</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Grade A</Badge>
                  <p className="text-sm font-semibold mt-1">8.5 Ton</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Batch-002-220825</h4>
                  <p className="text-sm text-muted-foreground">CV Bumi Hijau</p>
                  <p className="text-xs text-muted-foreground">Waktu: 09:30</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Grade A</Badge>
                  <p className="text-sm font-semibold mt-1">12.3 Ton</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Batch-003-220825</h4>
                  <p className="text-sm text-muted-foreground">PT Kelapa Sawit</p>
                  <p className="text-xs text-muted-foreground">Waktu: 10:45</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Grade B</Badge>
                  <p className="text-sm font-semibold mt-1">6.8 Ton</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kriteria Sortasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800">Grade A</h4>
                <p className="text-sm text-green-700">Matang sempurna, tidak busuk</p>
                <p className="text-sm text-green-700">Kadar air ≤ 25%</p>
                <p className="text-sm text-green-700">Bebas kotoran</p>
              </div>

              <div className="p-3 border rounded-lg bg-orange-50">
                <h4 className="font-semibold text-orange-800">Grade B</h4>
                <p className="text-sm text-orange-700">Matang sedang, sedikit busuk</p>
                <p className="text-sm text-orange-700">Kadar air 25-30%</p>
                <p className="text-sm text-orange-700">Kotoran minimal</p>
              </div>

              <div className="p-3 border rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-800">Reject</h4>
                <p className="text-sm text-red-700">Mentah/busuk parah</p>
                <p className="text-sm text-red-700">Kadar air &gt; 30%</p>
                <p className="text-sm text-red-700">Banyak kotoran</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
