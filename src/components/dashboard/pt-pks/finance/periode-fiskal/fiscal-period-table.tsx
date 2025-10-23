"use client";

import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { MoreVertical } from "lucide-react";
import type { FiscalPeriodDTO } from "~/server/types/pt-pks/fiscal-period";

interface FiscalPeriodTableProps {
  periods: FiscalPeriodDTO[];
  onEdit: (period: FiscalPeriodDTO) => void;
  onToggleClosed: (period: FiscalPeriodDTO) => void;
  onDelete: (period: FiscalPeriodDTO) => void;
  isLoading?: boolean;
  canManage?: boolean;
}

export function FiscalPeriodTable({
  periods,
  onEdit,
  onToggleClosed,
  onDelete,
  isLoading,
  canManage,
}: FiscalPeriodTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Memuat periode fiskal...
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-10 text-center text-muted-foreground">
        <span className="font-medium">Belum ada periode fiskal.</span>
        <span className="text-sm">Tambahkan periode baru untuk mulai mencatat saldo awal dan transaksi.</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">Tahun</TableHead>
            <TableHead className="w-[80px]">Bulan</TableHead>
            <TableHead>Rentang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="font-medium">{period.year}</TableCell>
              <TableCell>{period.month.toString().padStart(2, "0")}</TableCell>
              <TableCell>
                {format(new Date(period.startDate), "dd MMM yyyy")} -{" "}
                {format(new Date(period.endDate), "dd MMM yyyy")}
              </TableCell>
              <TableCell>
                <Badge variant={period.isClosed ? "secondary" : "success"}>
                  {period.isClosed ? "Tertutup" : "Terbuka"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(period)}>Ubah Tanggal</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleClosed(period)}>
                        {period.isClosed ? "Buka Periode" : "Tutup Periode"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(period)}
                        className="text-destructive focus:text-destructive"
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
