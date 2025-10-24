"use client";

import { useQuery } from "@tanstack/react-query";
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
import { Package, Warehouse } from "lucide-react";

interface StockBalanceViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  itemName?: string;
}

export function StockBalanceView({
  open,
  onOpenChange,
  itemId,
  itemName,
}: StockBalanceViewProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["item-stock-balances", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      const res = await fetch(`/api/pt-pks/material-inventory/items/${itemId}/stock-balances`);
      if (!res.ok) throw new Error("Failed to fetch stock balances");
      return res.json();
    },
    enabled: !!itemId && open,
  });

  const stockBalances = data?.data || [];

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

  const getTotalStock = () => {
    return stockBalances.reduce((total: number, balance: any) => total + balance.qtyOnHand, 0);
  };

  const getAverageWeightedCost = () => {
    if (stockBalances.length === 0) return 0;
    
    let totalValue = 0;
    let totalQty = 0;
    
    stockBalances.forEach((balance: any) => {
      totalValue += balance.qtyOnHand * balance.avgCost;
      totalQty += balance.qtyOnHand;
    });
    
    return totalQty > 0 ? totalValue / totalQty : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stok Barang - {itemName || "Loading..."}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Stok</span>
              </div>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  formatNumber(getTotalStock())
                )}
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lokasi</span>
              </div>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  stockBalances.length
                )}
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rata-rata Harga</span>
              </div>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatCurrency(getAverageWeightedCost())
                )}
              </div>
            </div>
          </div>

          {/* Stock Balance Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Bin/Lokasi</TableHead>
                  <TableHead className="text-right">Qty On Hand</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">
                      Error loading stock data
                    </TableCell>
                  </TableRow>
                ) : stockBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada data stok
                    </TableCell>
                  </TableRow>
                ) : (
                  stockBalances.map((balance: any) => (
                    <TableRow key={`${balance.warehouseId}-${balance.binId}`}>
                      <TableCell className="font-medium">
                        {balance.warehouseName}
                      </TableCell>
                      <TableCell>
                        {balance.binName ? (
                          <Badge variant="secondary">{balance.binName}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(balance.qtyOnHand)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(balance.avgCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(balance.qtyOnHand * balance.avgCost)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {stockBalances.length > 0 && (
            <div className="flex justify-end border-t pt-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-lg font-bold">
                  {formatCurrency(
                    stockBalances.reduce(
                      (total: number, balance: any) => 
                        total + (balance.qtyOnHand * balance.avgCost), 
                      0
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}