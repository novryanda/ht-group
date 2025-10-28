"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountClass: string;
  balance: number;
}

interface LedgerTransaction {
  date: string;
  entryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerAccount {
  accountCode: string;
  accountName: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
  transactions: LedgerTransaction[];
}

export function LedgerTable() {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get all accounts
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["account-balances"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/buku-besar");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const accounts: AccountBalance[] = accountsData?.data || [];

  // Get ledger for selected account
  const { data: ledgerData, isLoading: isLoadingLedger } = useQuery({
    queryKey: ["ledger", selectedAccountId, startDate, endDate],
    queryFn: async () => {
      if (!selectedAccountId) return null;
      
      const params = new URLSearchParams();
      params.set("accountId", selectedAccountId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/pt-pks/buku-besar?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!selectedAccountId,
  });

  const ledger: LedgerAccount | null = ledgerData?.data || null;

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
          <CardTitle>Pilih Akun</CardTitle>
          <CardDescription>Pilih akun untuk melihat buku besar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Akun</Label>
              {isLoadingAccounts ? (
                <div className="flex items-center justify-center h-10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih akun" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId}>
                        {account.accountCode} - {account.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle>Buku Besar</CardTitle>
            {ledger && (
              <CardDescription>
                {ledger.accountCode} - {ledger.accountName}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingLedger ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !ledger ? (
              <div className="text-center py-8 text-muted-foreground">
                Pilih akun untuk melihat buku besar
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Awal</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(ledger.openingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Debit</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(ledger.totalDebit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Kredit</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(ledger.totalCredit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Akhir</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(ledger.endingBalance)}
                    </p>
                  </div>
                </div>

                {ledger.transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada transaksi dalam periode ini</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>No. Jurnal</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledger.transactions.map((trx, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(trx.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {trx.entryNumber}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {trx.description}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {trx.debit > 0 ? formatCurrency(trx.debit) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {trx.credit > 0 ? formatCurrency(trx.credit) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(trx.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
