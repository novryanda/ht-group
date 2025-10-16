"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { StockCountFormDialog } from "./stock-count-form-dialog";
import type { PaginatedResult, StockCountDTO } from "~/server/types/inventory";

export function StockCountList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stock-counts", { search, page }],
    queryFn: async (): Promise<PaginatedResult<StockCountDTO>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/stock-count?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch stock counts");
      const result = await res.json() as { data?: PaginatedResult<StockCountDTO> };
      if (!result.data) throw new Error("No data returned");
      return result.data;
    },
  });

  const postMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/stock-count/${id}/post`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json() as { error?: string };
        throw new Error(error.error ?? "Failed to post stock count");
      }
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stock-counts"] });
      void queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast({
        title: "Success",
        description: "Stock count posted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePost = (id: string) => {
    if (confirm("Are you sure you want to post this stock count? This will create adjustment ledgers.")) {
      postMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Stock Count (Opname Stok)</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Stock Count
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari stock count..."
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
                  <TableHead>No. Count</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Jumlah Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((count) => (
                  <TableRow key={count.id}>
                    <TableCell className="font-medium">{count.countNo}</TableCell>
                    <TableCell>{format(new Date(count.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{count.warehouse?.name ?? "-"}</TableCell>
                    <TableCell>{count.lines?.length ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={count.status === "POSTED" ? "default" : "secondary"}>
                        {count.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{count.areaNote ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      {count.status === "OPEN" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handlePost(count.id)}
                          disabled={postMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Post
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data && data.data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data stock count
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

      <StockCountFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}

