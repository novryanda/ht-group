"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TransferFormDialog } from "./transfer-form-dialog";
import type { PaginatedResult, StockTransferDTO } from "~/server/types/inventory";

export function TransferList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["transfers", { search, page }],
    queryFn: async (): Promise<PaginatedResult<StockTransferDTO>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/transfer?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transfers");
      const result = await res.json() as { data?: PaginatedResult<StockTransferDTO> };
      if (!result.data) throw new Error("No data returned");
      return result.data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Transfer (Transfer Antar Lokasi)</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Transfer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transfer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transfer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Dari Lokasi</TableHead>
                  <TableHead>Ke Lokasi</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.transferNo}</TableCell>
                    <TableCell>{format(new Date(transfer.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{transfer.material?.name ?? "-"}</TableCell>
                    <TableCell>{transfer.fromLoc?.name ?? "-"}</TableCell>
                    <TableCell>{transfer.toLoc?.name ?? "-"}</TableCell>
                    <TableCell>{transfer.qty} {transfer.uom?.code ?? ""}</TableCell>
                    <TableCell className="text-muted-foreground">{transfer.note ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data && data.data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data transfer
              </div>
            )}

            {data && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Halaman {data.pagination.page} dari {data.pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <TransferFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}

