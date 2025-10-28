"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Loader2, Calendar, Download } from "lucide-react";
import { format } from "date-fns";

interface BalanceSheetAccount {
  code: string;
  name: string;
  amount: number;
}

interface BalanceSheet {
  companyName: string;
  reportDate: string;
  assets: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  liabilities: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  equity: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export function BalanceSheetTable() {
  const today = new Date().toISOString().split("T")[0];
  const [asOfDate, setAsOfDate] = useState(today);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["balance-sheet", asOfDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (asOfDate) params.set("asOfDate", asOfDate);

      const res = await fetch(`/api/pt-pks/neraca?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const balanceSheet: BalanceSheet | null = data?.data || null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Laporan</CardTitle>
          <CardDescription>Pilih tanggal untuk melihat neraca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="asOfDate">Per Tanggal</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <Button onClick={() => refetch()}>
              <Calendar className="mr-2 h-4 w-4" />
              Tampilkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      ) : !balanceSheet ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data neraca
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{balanceSheet.companyName}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Neraca Per {format(new Date(balanceSheet.reportDate), "dd MMMM yyyy")}
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* AKTIVA */}
              <div className="space-y-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <h3 className="font-bold text-lg">AKTIVA</h3>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Akun</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceSheet.assets.accounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="font-mono text-sm">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(account.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={2}>Total Aktiva</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(balanceSheet.assets.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* PASIVA */}
              <div className="space-y-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <h3 className="font-bold text-lg">PASIVA</h3>
                </div>

                {/* KEWAJIBAN */}
                <div>
                  <h4 className="font-semibold mb-2">Kewajiban</h4>
                  <Table>
                    <TableBody>
                      {balanceSheet.liabilities.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono text-sm w-24">
                            {account.code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono w-40">
                            {formatCurrency(account.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell colSpan={2}>Total Kewajiban</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(balanceSheet.liabilities.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* EKUITAS */}
                <div>
                  <h4 className="font-semibold mb-2">Ekuitas</h4>
                  <Table>
                    <TableBody>
                      {balanceSheet.equity.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono text-sm w-24">
                            {account.code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono w-40">
                            {formatCurrency(account.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell colSpan={2}>Total Ekuitas</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(balanceSheet.equity.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* TOTAL PASIVA */}
                <Table>
                  <TableBody>
                    <TableRow className="font-bold bg-primary/10">
                      <TableCell colSpan={2}>Total Pasiva</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(
                          balanceSheet.liabilities.total + balanceSheet.equity.total
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Balance Check */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Validasi Balance:</span>
                <span
                  className={`font-bold ${
                    Math.abs(
                      balanceSheet.totalAssets -
                        (balanceSheet.totalLiabilities + balanceSheet.totalEquity)
                    ) < 0.01
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(
                    balanceSheet.totalAssets -
                      (balanceSheet.totalLiabilities + balanceSheet.totalEquity)
                  ) < 0.01
                    ? "✓ Balance"
                    : "✗ Tidak Balance"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
