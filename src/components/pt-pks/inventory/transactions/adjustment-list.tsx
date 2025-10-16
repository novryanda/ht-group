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
import { AdjustmentFormDialog } from "./adjustment-form-dialog";

export function AdjustmentList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["adjustments", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/adjustment?${params}`);
      if (!res.ok) throw new Error("Failed to fetch adjustments");
      return res.json();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Adjustment (Penyesuaian Stok)</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Adjustment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari adjustment..."
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
                  <TableHead>No. Adjustment</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Jumlah Item</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((adj: any) => (
                  <TableRow key={adj.id}>
                    <TableCell className="font-medium">{adj.adjustmentNo}</TableCell>
                    <TableCell>{format(new Date(adj.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{adj.warehouse?.name}</TableCell>
                    <TableCell>{adj.reason}</TableCell>
                    <TableCell>{adj.items?.length || 0}</TableCell>
                    <TableCell className="text-muted-foreground">{adj.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data adjustment
              </div>
            )}

            {data?.pagination && (
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

      <AdjustmentFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}

