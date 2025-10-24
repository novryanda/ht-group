"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { 
  History, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";

interface StockLedgerViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  itemName?: string;
}

export function StockLedgerView({
  open,
  onOpenChange,
  itemId,
  itemName,
}: StockLedgerViewProps) {
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["item-stock-ledger", itemId, offset],
    queryFn: async () => {
      if (!itemId) return null;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      const res = await fetch(`/api/pt-pks/material-inventory/items/${itemId}/stock-ledger?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stock ledger");
      return res.json();
    },
    enabled: !!itemId && open,
  });

  const ledgerEntries = data?.data || [];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getTransactionIcon = (referenceType: string) => {
    switch (referenceType) {
      case "IN":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "OUT":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "ADJ":
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (referenceType: string, qtyDelta: number) => {
    if (referenceType === "IN" || qtyDelta > 0) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Masuk</Badge>;
    } else if (referenceType === "OUT" || qtyDelta < 0) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Keluar</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Adjust</Badge>;
    }
  };

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (ledgerEntries.length === limit) {
      setOffset(offset + limit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histori Mutasi Stok - {itemName || "Loading..."}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pagination Controls - Top */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {offset + 1} - {offset + ledgerEntries.length} dari riwayat mutasi
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={ledgerEntries.length < limit}
              >
                Berikutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead className="text-right">Qty Delta</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-red-500">
                      Error loading ledger data
                    </TableCell>
                  </TableRow>
                ) : ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Belum ada riwayat mutasi stok
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerEntries.map((entry: any, index: number) => (
                    <TableRow key={entry.id} className={index === 0 ? "bg-muted/50" : ""}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(entry.ts), "dd MMM yyyy HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(entry.referenceType)}
                          {getTransactionBadge(entry.referenceType, entry.qtyDelta)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.warehouseName}
                      </TableCell>
                      <TableCell>
                        {entry.binName ? (
                          <Badge variant="outline">{entry.binName}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${
                        entry.qtyDelta > 0 
                          ? "text-green-600 font-semibold" 
                          : entry.qtyDelta < 0 
                            ? "text-red-600 font-semibold" 
                            : "text-gray-600"
                      }`}>
                        {entry.qtyDelta > 0 ? "+" : ""}{formatNumber(entry.qtyDelta)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.unitCost ? formatCurrency(entry.unitCost) : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.referenceId}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {entry.note || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls - Bottom */}
          {ledgerEntries.length > 0 && (
            <div className="flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={ledgerEntries.length < limit}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}