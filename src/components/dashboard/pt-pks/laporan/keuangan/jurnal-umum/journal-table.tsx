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
import { Badge } from "~/components/ui/badge";
import { Calendar, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  sourceType: string;
  memo?: string;
  status: string;
  lines: Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    description?: string;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export function JournalTable() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["journal-entries", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("limit", "100");

      const res = await fetch(`/api/pt-pks/jurnal-umum?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const entries: JournalEntry[] = data?.data?.entries || [];

  // Filter by search term
  const filteredEntries = entries.filter((entry) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.entryNumber.toLowerCase().includes(searchLower) ||
      entry.sourceType.toLowerCase().includes(searchLower) ||
      entry.memo?.toLowerCase().includes(searchLower) ||
      entry.lines.some(
        (line) =>
          line.accountCode.toLowerCase().includes(searchLower) ||
          line.accountName.toLowerCase().includes(searchLower)
      )
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "POSTED":
        return <Badge variant="default">Posted</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "VOID":
        return <Badge variant="destructive">Void</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Filter jurnal berdasarkan tanggal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="No. jurnal, akun..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => refetch()}>
              <Calendar className="mr-2 h-4 w-4" />
              Terapkan Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jurnal Umum</CardTitle>
          <CardDescription>
            Daftar transaksi jurnal {filteredEntries.length} dari {entries.length} entri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data jurnal
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold">{entry.entryNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.date), "dd MMM yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline">{entry.sourceType}</Badge>
                      {getStatusBadge(entry.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Total: {formatCurrency(entry.totalDebit)}
                      </p>
                    </div>
                  </div>

                  {entry.memo && (
                    <p className="text-sm text-muted-foreground italic">{entry.memo}</p>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Akun</TableHead>
                        <TableHead>Nama Akun</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.lines.map((line, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">
                            {line.accountCode}
                          </TableCell>
                          <TableCell>{line.accountName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {line.debit > 0 ? formatCurrency(line.debit) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {line.credit > 0 ? formatCurrency(line.credit) : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-muted/50">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(entry.totalDebit)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(entry.totalCredit)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
