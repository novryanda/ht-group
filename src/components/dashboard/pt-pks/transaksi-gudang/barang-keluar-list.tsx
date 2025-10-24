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
import { Plus, Search, Eye, Pencil, Trash2, Loader2, PackagePlus, FileDown } from "lucide-react";
import { BarangKeluarFormDialog } from "./barang-keluar-form-dialog";
import { BarangMasukFormDialog } from "./barang-masuk-form-dialog";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface WarehouseOutbound {
  id: string;
  docNumber: string;
  date: string;
  warehouseName: string;
  purpose: string;
  targetDept: string;
  note?: string;
  status: string;
  lines: Array<{
    id: string;
    itemName: string;
    qty: number;
    unitName: string;
  }>;
}

export function BarangKeluarList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnOutboundId, setReturnOutboundId] = useState<string>("");

  // Fetch data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["warehouse-outbound", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-keluar?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleCreate = () => {
    setSelectedId(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setShowForm(true);
  };

  const handleReturn = (outbound: WarehouseOutbound) => {
    setReturnOutboundId(outbound.id);
    setShowReturnDialog(true);
  };

  const handleDownloadPDF = async (id: string, docNumber: string) => {
    try {
      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-keluar/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to download PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Barang-Keluar-${docNumber.replace(/\//g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      alert("Gagal mendownload PDF");
    }
  };

  const getPurposeBadge = (purpose: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      LOAN: "default",
      ISSUE: "secondary",
      PROD: "outline",
      SCRAP: "destructive",
    };
    const labels: Record<string, string> = {
      LOAN: "Peminjaman",
      ISSUE: "Pengeluaran",
      PROD: "Produksi",
      SCRAP: "Scrap",
    };
    return <Badge variant={variants[purpose] || "default"}>{labels[purpose] || purpose}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "outline",
      APPROVED: "default",
      RETURNED: "secondary",
      PARTIAL_RETURN: "outline",
      CANCELLED: "destructive",
    };
    const labels: Record<string, string> = {
      DRAFT: "Draft",
      APPROVED: "Disetujui",
      RETURNED: "Dikembalikan",
      PARTIAL_RETURN: "Sebagian Kembali",
      CANCELLED: "Dibatalkan",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor dokumen atau divisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Barang Keluar
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Dokumen</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Gudang</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Divisi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Jumlah Item</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((item: WarehouseOutbound) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.docNumber}</TableCell>
                  <TableCell>
                    {format(new Date(item.date), "dd MMM yyyy", { locale: localeId })}
                  </TableCell>
                  <TableCell>{item.warehouseName}</TableCell>
                  <TableCell>{getPurposeBadge(item.purpose)}</TableCell>
                  <TableCell>{item.targetDept}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.lines.length} item</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Lihat
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(item.id, item.docNumber)}
                        className="gap-1 text-green-600 hover:text-green-700"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      {item.status !== "RETURNED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReturn(item)}
                          className="gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <PackagePlus className="h-3.5 w-3.5" />
                          Kembalikan
                        </Button>
                      )}
                    </div>
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
      <BarangKeluarFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        outboundId={selectedId}
        onSuccess={() => {
          setShowForm(false);
          void refetch();
        }}
      />

      <BarangMasukFormDialog
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
        outboundId={returnOutboundId}
        onSuccess={() => {
          setShowReturnDialog(false);
          void refetch();
        }}
      />
    </div>
  );
}
