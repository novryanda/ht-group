import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Search, Filter, Edit, Eye } from "lucide-react";

export default function MaterialKodeBarangPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Material & Kode Barang</h1>
          <p className="text-muted-foreground">
            Kelola master data material dan kode barang
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Material
        </Button>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Cari Material
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Kategori
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Material</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">MT-PKS-001</h3>
                  <p className="text-sm text-muted-foreground">Palm Kernel Shell Grade A</p>
                  <p className="text-xs text-muted-foreground">Kategori: Bahan Baku</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Aktif</Badge>
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
                  <h3 className="font-semibold">MT-PKS-002</h3>
                  <p className="text-sm text-muted-foreground">Palm Kernel Shell Grade B</p>
                  <p className="text-xs text-muted-foreground">Kategori: Bahan Baku</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Aktif</Badge>
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
                  <h3 className="font-semibold">MT-PKS-003</h3>
                  <p className="text-sm text-muted-foreground">Spare Part Mesin Crusher</p>
                  <p className="text-xs text-muted-foreground">Kategori: Spare Part</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Inactive</Badge>
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
    </div>
  );
}
