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

interface FinancialAccount {
  code: string;
  name: string;
  amount: number;
}

interface IncomeStatement {
  companyName: string;
  periodStart: string;
  periodEnd: string;
  revenue: {
    accounts: FinancialAccount[];
    total: number;
  };
  cogs: {
    accounts: FinancialAccount[];
    total: number;
  };
  grossProfit: number;
  operatingExpenses: {
    accounts: FinancialAccount[];
    total: number;
  };
  operatingIncome: number;
  otherIncome: {
    accounts: FinancialAccount[];
    total: number;
  };
  otherExpenses: {
    accounts: FinancialAccount[];
    total: number;
  };
  netIncome: number;
}

export function IncomeStatementTable() {
  const now = new Date();
  const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["income-statement", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/pt-pks/laporan-keuangan?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const incomeStatement: IncomeStatement | null = data?.data || null;

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
          <CardDescription>Pilih periode untuk melihat laporan laba rugi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
      ) : !incomeStatement ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data laporan keuangan
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{incomeStatement.companyName}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Laporan Laba Rugi
                </CardDescription>
                <CardDescription>
                  Periode {format(new Date(incomeStatement.periodStart), "dd MMM yyyy")} -{" "}
                  {format(new Date(incomeStatement.periodEnd), "dd MMM yyyy")}
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* PENDAPATAN */}
              <div>
                <div className="bg-primary/10 p-3 rounded-lg mb-3">
                  <h3 className="font-bold">PENDAPATAN</h3>
                </div>
                <Table>
                  <TableBody>
                    {incomeStatement.revenue.accounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="font-mono text-sm w-32">
                          {account.code}
                        </TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell className="text-right font-mono w-48">
                          {formatCurrency(account.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={2}>Total Pendapatan</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(incomeStatement.revenue.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* BEBAN POKOK PENJUALAN */}
              {incomeStatement.cogs.accounts.length > 0 && (
                <div>
                  <div className="bg-primary/10 p-3 rounded-lg mb-3">
                    <h3 className="font-bold">BEBAN POKOK PENJUALAN</h3>
                  </div>
                  <Table>
                    <TableBody>
                      {incomeStatement.cogs.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono text-sm w-32">
                            {account.code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono w-48">
                            {formatCurrency(account.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total Beban Pokok Penjualan</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(incomeStatement.cogs.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* LABA KOTOR */}
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">LABA KOTOR</span>
                  <span className="font-bold text-lg font-mono">
                    {formatCurrency(incomeStatement.grossProfit)}
                  </span>
                </div>
              </div>

              {/* BIAYA OPERASIONAL */}
              {incomeStatement.operatingExpenses.accounts.length > 0 && (
                <div>
                  <div className="bg-primary/10 p-3 rounded-lg mb-3">
                    <h3 className="font-bold">BIAYA OPERASIONAL</h3>
                  </div>
                  <Table>
                    <TableBody>
                      {incomeStatement.operatingExpenses.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono text-sm w-32">
                            {account.code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono w-48">
                            {formatCurrency(account.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total Biaya Operasional</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(incomeStatement.operatingExpenses.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* LABA OPERASIONAL */}
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">LABA OPERASIONAL</span>
                  <span className="font-bold text-lg font-mono">
                    {formatCurrency(incomeStatement.operatingIncome)}
                  </span>
                </div>
              </div>

              {/* PENDAPATAN LAIN-LAIN */}
              {incomeStatement.otherIncome.accounts.length > 0 && (
                <div>
                  <div className="bg-primary/10 p-3 rounded-lg mb-3">
                    <h3 className="font-bold">PENDAPATAN LAIN-LAIN</h3>
                  </div>
                  <Table>
                    <TableBody>
                      {incomeStatement.otherIncome.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono text-sm w-32">
                            {account.code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono w-48">
                            {formatCurrency(account.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell colSpan={2}>Total Pendapatan Lain-Lain</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(incomeStatement.otherIncome.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* BIAYA LAIN-LAIN */}
              {incomeStatement.otherExpenses.accounts.length > 0 && (
                <div>
                  <div className="bg-primary/10 p-3 rounded-lg mb-3">
                    <h3 className="font-bold">BIAYA LAIN-LAIN</h3>
                  </div>
                  <Table>
                    <TableBody>
                      {incomeStatement.otherExpenses.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="font-mono text-sm w-32">
                            {account.code}
                          </TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell className="text-right font-mono w-48">
                            {formatCurrency(account.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell colSpan={2}>Total Biaya Lain-Lain</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(incomeStatement.otherExpenses.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* LABA BERSIH */}
              <div
                className={`p-4 rounded-lg ${
                  incomeStatement.netIncome >= 0
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xl">
                    {incomeStatement.netIncome >= 0 ? "LABA BERSIH" : "RUGI BERSIH"}
                  </span>
                  <span className="font-bold text-xl font-mono">
                    {formatCurrency(incomeStatement.netIncome)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
