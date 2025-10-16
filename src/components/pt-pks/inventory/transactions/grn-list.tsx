"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { GrnFormDialog } from "./grn-form-dialog";

interface GoodsReceipt {
  id: string;
  receiptNo: string;
  date: string;
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
  note?: string;
  items: Array<{
    id: string;
    material: {
      code: string;
      name: string;
    };
    location: {
      code: string;
      name: string;
    };
    qty: number;
    uom: {
      code: string;
    };
  }>;
  createdAt: string;
}

interface GrnListResponse {
  success: boolean;
  data: GoodsReceipt[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function GrnList() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery<GrnListResponse>({
    queryKey: ["grn-list", page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
      });
      const res = await fetch(`/api/inventory/grn?${params}`);
      if (!res.ok) throw new Error("Failed to fetch GRN");
      return res.json();
    },
  });

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    void refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base">Daftar GRN</CardTitle>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Buat GRN
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. GRN</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Gudang</TableHead>
                      <TableHead>Jumlah Item</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((grn) => (
                        <TableRow key={grn.id}>
                          <TableCell className="font-medium">{grn.receiptNo}</TableCell>
                          <TableCell>
                            {format(new Date(grn.date), "dd MMM yyyy", { locale: idLocale })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{grn.warehouse.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {grn.warehouse.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{grn.items.length} item</TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {grn.note ?? "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Belum ada data GRN
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Halaman {data.pagination.page} dari {data.pagination.totalPages} (
                    {data.pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pagination.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <GrnFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} onSuccess={handleSuccess} />
    </div>
  );
}

