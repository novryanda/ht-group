"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface PeminjamanBarangDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string | null;
}

export function PeminjamanBarangDetailDialog({
  open,
  onOpenChange,
  loanId,
}: PeminjamanBarangDetailDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["loan-issue-detail", loanId],
    queryFn: async () => {
      const response = await fetch(`/api/pt-pks/peminjaman-barang/${loanId}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      return result.data;
    },
    enabled: !!loanId && open,
  });

  const loan = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Peminjaman Barang</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : loan ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">No. Dokumen</p>
                <p className="font-semibold">{loan.docNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={loan.status === "RETURNED" ? "default" : "secondary"}>
                  {loan.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Peminjaman</p>
                <p className="font-medium">
                  {loan.date ? format(new Date(loan.date), "dd MMMM yyyy", { locale: id }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Jatuh Tempo</p>
                <p className="font-medium">
                  {loan.expectedReturnAt
                    ? format(new Date(loan.expectedReturnAt), "dd MMMM yyyy", { locale: id })
                    : "-"}
                </p>
              </div>
              {loan.returnedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Pengembalian</p>
                  <p className="font-medium">
                    {format(new Date(loan.returnedAt), "dd MMMM yyyy", { locale: id })}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Loan Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Lokasi Gudang</p>
                <p className="font-medium">
                  {loan.warehouse?.code} - {loan.warehouse?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nama Peminjam</p>
                <p className="font-medium">{loan.loanReceiver}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dept/Unit</p>
                <p className="font-medium">{loan.targetDept}</p>
              </div>
              {loan.pickerName && (
                <div>
                  <p className="text-sm text-muted-foreground">Nama Pengambil</p>
                  <p className="font-medium">{loan.pickerName}</p>
                </div>
              )}
            </div>

            {(loan.loanNotes || loan.note) && (
              <>
                <Separator />
                <div className="space-y-2">
                  {loan.loanNotes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Catatan Peminjaman</p>
                      <p className="text-sm">{loan.loanNotes}</p>
                    </div>
                  )}
                  {loan.note && (
                    <div>
                      <p className="text-sm text-muted-foreground">Catatan Umum</p>
                      <p className="text-sm">{loan.note}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-4">Daftar Barang yang Dipinjam</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">No</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Nama Barang</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Jumlah</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Satuan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loan.lines?.map((line: any, index: number) => (
                      <tr key={line.id}>
                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                        <td className="px-4 py-3 text-sm">{line.item?.sku}</td>
                        <td className="px-4 py-3 text-sm">{line.item?.name}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {Number(line.qty).toLocaleString("id-ID", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm">{line.unit?.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {line.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Info */}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>Dibuat oleh: {loan.createdBy?.name || "-"}</p>
                <p>
                  Pada: {loan.createdAt ? format(new Date(loan.createdAt), "dd/MM/yyyy HH:mm") : "-"}
                </p>
              </div>
              {loan.updatedAt && (
                <div>
                  <p>Diperbarui oleh: {loan.updatedBy?.name || "-"}</p>
                  <p>Pada: {format(new Date(loan.updatedAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Data tidak ditemukan</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
