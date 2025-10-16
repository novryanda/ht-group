"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, TrendingUp, Package, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { MonthlyReportResponse } from "~/server/types/reports";

export function MonthlyReportCard() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  });
  const [includeBreakdown, setIncludeBreakdown] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["monthly-report", month, includeBreakdown],
    queryFn: async () => {
      const params = new URLSearchParams({
        month,
        includeBreakdown: includeBreakdown.toString(),
      });
      const res = await fetch(`/api/reports/monthly?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error ?? "Failed to fetch report");
      }
      const result = await res.json() as { data?: MonthlyReportResponse };
      return result.data;
    },
    enabled: !!month,
  });

  const handleExportCSV = () => {
    if (!data) return;

    const csvRows: string[] = [];
    csvRows.push("Laporan Bulanan - " + month);
    csvRows.push("");
    csvRows.push("=== PB IMPORT SUMMARY ===");
    csvRows.push(`Total Transaksi,${data.pbSummary.count}`);
    csvRows.push(`Total Terima (kg),${data.pbSummary.totalTerimaKg.toFixed(2)}`);
    csvRows.push(`Total Potongan (kg),${data.pbSummary.totalPotKg.toFixed(2)}`);
    csvRows.push(`Total Netto (kg),${data.pbSummary.totalNettoKg.toFixed(2)}`);
    csvRows.push(`Harga Rata-rata,${data.pbSummary.avgPrice.toFixed(2)}`);
    csvRows.push(`Total Pembayaran,${data.pbSummary.totalPayment.toFixed(2)}`);
    csvRows.push(`Total PPh,${data.pbSummary.totalPph.toFixed(2)}`);
    csvRows.push("");
    csvRows.push("=== INVENTORY SUMMARY ===");
    csvRows.push(`GRN,${data.inventorySummary.grn}`);
    csvRows.push(`Issue,${data.inventorySummary.issue}`);
    csvRows.push(`Transfer,${data.inventorySummary.transfer}`);
    csvRows.push(`Adjustment,${data.inventorySummary.adjustment}`);
    csvRows.push(`Stock Count,${data.inventorySummary.count}`);

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-bulanan-${month}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Laporan Total Bulanan
          </CardTitle>
          <CardDescription>
            Ringkasan agregat PB Import & Inventory per bulan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="month">Bulan</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="breakdown"
                checked={includeBreakdown}
                onChange={(e) => setIncludeBreakdown(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="breakdown" className="cursor-pointer">
                Tampilkan Detail Breakdown
              </Label>
            </div>
            <Button onClick={handleExportCSV} disabled={!data} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading report...
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            Error: {error instanceof Error ? error.message : "Failed to load report"}
          </CardContent>
        </Card>
      )}

      {/* Report Data */}
      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* PB Import Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  PB Import Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Transaksi:</span>
                  <span className="font-semibold">{data.pbSummary.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Terima:</span>
                  <span className="font-semibold">{data.pbSummary.totalTerimaKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Potongan:</span>
                  <span className="font-semibold">{data.pbSummary.totalPotKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Netto:</span>
                  <span className="font-semibold">{data.pbSummary.totalNettoKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Rata-rata:</span>
                  <span className="font-semibold">Rp {data.pbSummary.avgPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total Pembayaran:</span>
                  <span className="font-bold text-green-600">
                    Rp {data.pbSummary.totalPayment.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total PPh:</span>
                  <span className="font-semibold">Rp {data.pbSummary.totalPph.toLocaleString("id-ID")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Inventory Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goods Receipt (GRN):</span>
                  <span className="font-semibold">{data.inventorySummary.grn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goods Issue:</span>
                  <span className="font-semibold">{data.inventorySummary.issue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Transfer:</span>
                  <span className="font-semibold">{data.inventorySummary.transfer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Adjustment:</span>
                  <span className="font-semibold">{data.inventorySummary.adjustment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Count:</span>
                  <span className="font-semibold">{data.inventorySummary.count}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Total Dokumen:</span>
                  <span className="font-bold text-blue-600">
                    {data.inventorySummary.grn +
                      data.inventorySummary.issue +
                      data.inventorySummary.transfer +
                      data.inventorySummary.adjustment +
                      data.inventorySummary.count}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdowns */}
          {includeBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detail Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pb-daily">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pb-daily">PB Harian</TabsTrigger>
                    <TabsTrigger value="pb-supplier">PB per Supplier</TabsTrigger>
                    <TabsTrigger value="inv-daily">Inventory Harian</TabsTrigger>
                    <TabsTrigger value="inv-material">Material Movement</TabsTrigger>
                  </TabsList>

                  {/* PB Daily Breakdown */}
                  <TabsContent value="pb-daily" className="mt-4">
                    {data.pbDailyBreakdown && data.pbDailyBreakdown.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Transaksi</TableHead>
                            <TableHead className="text-right">Terima (kg)</TableHead>
                            <TableHead className="text-right">Netto (kg)</TableHead>
                            <TableHead className="text-right">Pembayaran</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.pbDailyBreakdown.map((row) => (
                            <TableRow key={row.date}>
                              <TableCell>{format(new Date(row.date), "dd MMM yyyy")}</TableCell>
                              <TableCell className="text-right">{row.count}</TableCell>
                              <TableCell className="text-right">{row.totalTerimaKg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{row.totalNettoKg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                Rp {row.totalPayment.toLocaleString("id-ID")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">Tidak ada data</p>
                    )}
                  </TabsContent>

                  {/* PB Supplier Breakdown */}
                  <TabsContent value="pb-supplier" className="mt-4">
                    {data.pbSupplierBreakdown && data.pbSupplierBreakdown.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Transaksi</TableHead>
                            <TableHead className="text-right">Terima (kg)</TableHead>
                            <TableHead className="text-right">Netto (kg)</TableHead>
                            <TableHead className="text-right">Pembayaran</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.pbSupplierBreakdown.map((row) => (
                            <TableRow key={row.supplierId}>
                              <TableCell>{row.supplierName}</TableCell>
                              <TableCell className="text-right">{row.count}</TableCell>
                              <TableCell className="text-right">{row.totalTerimaKg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{row.totalNettoKg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                Rp {row.totalPayment.toLocaleString("id-ID")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">Tidak ada data</p>
                    )}
                  </TabsContent>

                  {/* Inventory Daily Breakdown - Placeholder */}
                  <TabsContent value="inv-daily" className="mt-4">
                    <p className="text-center py-4 text-muted-foreground">
                      Inventory daily breakdown akan ditampilkan di sini
                    </p>
                  </TabsContent>

                  {/* Material Movement - Placeholder */}
                  <TabsContent value="inv-material" className="mt-4">
                    <p className="text-center py-4 text-muted-foreground">
                      Material movement breakdown akan ditampilkan di sini
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

