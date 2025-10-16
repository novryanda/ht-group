"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, AlertTriangle } from "lucide-react";
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
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

interface Stock {
  id: string;
  material: {
    id: string;
    code: string;
    name: string;
    category: {
      name: string;
    };
    baseUom: {
      code: string;
    };
    minStock?: number;
    maxStock?: number;
  };
  location: {
    id: string;
    code: string;
    name: string;
    warehouse: {
      code: string;
      name: string;
    };
  };
  qtyOnHand: number;
}

interface StockListResponse {
  success: boolean;
  data: Stock[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function StockReport() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<StockListResponse>({
    queryKey: ["stock-report", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "50",
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/stock?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stock");
      return res.json();
    },
  });

  const getStockStatus = (stock: Stock) => {
    const { qtyOnHand } = stock;
    const { minStock, maxStock } = stock.material;

    if (minStock !== null && minStock !== undefined && qtyOnHand < minStock) {
      return { label: "Low Stock", variant: "destructive" as const };
    }
    if (maxStock !== null && maxStock !== undefined && qtyOnHand > maxStock) {
      return { label: "Overstock", variant: "secondary" as const };
    }
    return { label: "Normal", variant: "default" as const };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base">Posisi Stok</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari material atau lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
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
                      <TableHead>Material</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Gudang</TableHead>
                      <TableHead className="text-right">Qty On Hand</TableHead>
                      <TableHead className="text-right">Min/Max</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((stock) => {
                        const status = getStockStatus(stock);
                        return (
                          <TableRow key={stock.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{stock.material.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {stock.material.code}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {stock.material.category.name}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{stock.location.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {stock.location.code}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {stock.location.warehouse.name}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {stock.qtyOnHand.toLocaleString()} {stock.material.baseUom.code}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {stock.material.minStock !== null &&
                              stock.material.maxStock !== null ? (
                                <span>
                                  {stock.material.minStock} / {stock.material.maxStock}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>
                                {status.label === "Low Stock" && (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {status.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Tidak ada data stok
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
    </div>
  );
}

