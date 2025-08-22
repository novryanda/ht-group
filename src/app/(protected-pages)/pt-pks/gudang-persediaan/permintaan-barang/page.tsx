import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Search, Filter } from "lucide-react";

export default function PermintaanBarangPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permintaan Barang (SR/PR)</h1>
          <p className="text-muted-foreground">
            Kelola permintaan barang dan purchase request
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Buat Permintaan Baru
        </Button>
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

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Permintaan Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">SR-PKS-001</h3>
                  <p className="text-sm text-muted-foreground">Permintaan alat produksi</p>
                  <p className="text-xs text-muted-foreground">Dibuat: 20 Aug 2025</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">Pending</Badge>
                  <p className="text-sm font-semibold mt-1">5 Items</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">PR-PKS-002</h3>
                  <p className="text-sm text-muted-foreground">Purchase request bahan baku</p>
                  <p className="text-xs text-muted-foreground">Dibuat: 19 Aug 2025</p>
                </div>
                <div className="text-right">
                  <Badge variant="default">Approved</Badge>
                  <p className="text-sm font-semibold mt-1">12 Items</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">SR-PKS-003</h3>
                  <p className="text-sm text-muted-foreground">Permintaan spare part mesin</p>
                  <p className="text-xs text-muted-foreground">Dibuat: 18 Aug 2025</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">Rejected</Badge>
                  <p className="text-sm font-semibold mt-1">3 Items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
