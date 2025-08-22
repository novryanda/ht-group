import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { FileText, Plus, Search, Filter, Download, Eye, Edit } from "lucide-react";

export default function SuratPengantarBuahPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Surat Pengantar Buah</h1>
          <p className="text-muted-foreground">
            Kelola surat pengantar buah dari supplier TBS
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat SPB
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SPB Hari Ini</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Surat terbit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SPB Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Menunggu approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tonase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.6 Ton</div>
            <p className="text-xs text-muted-foreground">
              Hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SPB Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">485</div>
            <p className="text-xs text-muted-foreground">
              Total dokumen
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari SPB
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Status
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export SPB
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Surat Pengantar Buah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">SPB-PKS-001-220825</h3>
                <p className="text-sm text-muted-foreground">PT Sawit Makmur → PT PKS</p>
                <p className="text-xs text-muted-foreground">Tanggal: 22 Aug 2025 | Driver: Ahmad Suryanto</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="default">Approved</Badge>
                  <p className="text-sm font-semibold mt-1">8.5 Ton</p>
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
                <h3 className="font-semibold">SPB-PKS-002-220825</h3>
                <p className="text-sm text-muted-foreground">CV Bumi Hijau → PT PKS</p>
                <p className="text-xs text-muted-foreground">Tanggal: 22 Aug 2025 | Driver: Budi Santoso</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="secondary">Pending</Badge>
                  <p className="text-sm font-semibold mt-1">12.3 Ton</p>
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
                <h3 className="font-semibold">SPB-PKS-003-220825</h3>
                <p className="text-sm text-muted-foreground">PT Kelapa Sawit → PT PKS</p>
                <p className="text-xs text-muted-foreground">Tanggal: 22 Aug 2025 | Driver: Sari Indah</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="default">Approved</Badge>
                  <p className="text-sm font-semibold mt-1">6.8 Ton</p>
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
                <h3 className="font-semibold">SPB-PKS-004-220825</h3>
                <p className="text-sm text-muted-foreground">Koperasi Tani Sejahtera → PT PKS</p>
                <p className="text-xs text-muted-foreground">Tanggal: 22 Aug 2025 | Driver: Andi Pratama</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <Badge variant="default">Approved</Badge>
                  <p className="text-sm font-semibold mt-1">18.0 Ton</p>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
