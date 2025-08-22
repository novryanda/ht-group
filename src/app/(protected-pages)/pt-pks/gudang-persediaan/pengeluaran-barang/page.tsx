import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Search, Filter, Download } from "lucide-react";

export default function PengeluaranBarangPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengeluaran Barang</h1>
          <p className="text-muted-foreground">
            Kelola pengeluaran barang dari gudang
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat Pengeluaran
        </Button>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Dokumen
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Status
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengeluaran Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-PKS-001</h3>
                <p className="text-sm text-muted-foreground">Pengiriman ke Customer A</p>
                <p className="text-xs text-muted-foreground">Tanggal: 22 Aug 2025</p>
              </div>
              <div className="text-right">
                <Badge variant="default">Completed</Badge>
                <p className="text-sm font-semibold mt-1">45.5 Ton</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-PKS-002</h3>
                <p className="text-sm text-muted-foreground">Transfer ke PT TAM</p>
                <p className="text-xs text-muted-foreground">Tanggal: 21 Aug 2025</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">In Progress</Badge>
                <p className="text-sm font-semibold mt-1">20.3 Ton</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">DO-PKS-003</h3>
                <p className="text-sm text-muted-foreground">Pengeluaran untuk maintenance</p>
                <p className="text-xs text-muted-foreground">Tanggal: 20 Aug 2025</p>
              </div>
              <div className="text-right">
                <Badge variant="outline">Pending</Badge>
                <p className="text-sm font-semibold mt-1">5 Items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
