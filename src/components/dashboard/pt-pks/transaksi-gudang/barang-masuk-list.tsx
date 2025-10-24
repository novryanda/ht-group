"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Plus, Search, Eye, Loader2, PackagePlus } from "lucide-react";
import { BarangMasukFormDialog } from "./barang-masuk-form-dialog";
import { BarangMasukNewItemDialog } from "./barang-masuk-new-item-dialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface WarehouseInbound {
  id: string;
  docNumber: string;
  date: string;
  warehouseName: string;
  sourceType: string;
  sourceRef?: string;
  note?: string;
  lines: Array<{
    id: string;
    itemName: string;
    qty: number;
    unitName: string;
  }>;
}

export function BarangMasukList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"return" | "new-item">("return");

  // Fetch data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["warehouse-inbound", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-masuk?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleCreateReturn = () => {
    setSelectedId(null);
    setFormMode("return");
    setShowForm(true);
  };

  const handleCreateNewItem = () => {
    setSelectedId(null);
    setFormMode("new-item");
    setShowForm(true);
  };

  const handleView = (id: string) => {
    setSelectedId(id);
    setFormMode("return"); // View mode
    setShowForm(true);
  };

  const getSourceTypeBadge = (sourceType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      RETURN: "default",
      NEW_ITEM: "secondary",
      PURCHASE: "outline",
      PRODUCTION: "outline",
      OTHER: "outline",
    };
    const labels: Record<string, string> = {
      RETURN: "Pengembalian",
      NEW_ITEM: "Barang Baru",
      PURCHASE: "Pembelian",
      PRODUCTION: "Produksi",
      OTHER: "Lainnya",
    };
    return <Badge variant={variants[sourceType] || "outline"}>{labels[sourceType] || sourceType}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor dokumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateReturn} variant="outline" className="gap-2">
            <PackagePlus className="h-4 w-4" />
            Barang Dikembalikan
          </Button>
          <Button onClick={handleCreateNewItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Barang Baru Masuk
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Gudang</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead>Jumlah Item</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((item: WarehouseInbound) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.docNumber}</TableCell>
                  <TableCell>
                    {format(new Date(item.date), "dd MMM yyyy", { locale: localeId })}
                  </TableCell>
                  <TableCell>{item.warehouseName}</TableCell>
                  <TableCell>{getSourceTypeBadge(item.sourceType)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.sourceRef || "-"}</TableCell>
                  <TableCell>{item.lines.length} item</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(item.id)}
                      className="gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Lihat
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {data.meta.page} dari {data.meta.totalPages} halaman ({data.meta.total}{" "}
            total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialogs */}
      {formMode === "return" && (
        <BarangMasukFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          inboundId={selectedId}
          onSuccess={() => {
            setShowForm(false);
            void refetch();
          }}
        />
      )}

      {formMode === "new-item" && (
        <BarangMasukNewItemDialog
          open={showForm}
          onOpenChange={setShowForm}
          onSuccess={() => {
            setShowForm(false);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
