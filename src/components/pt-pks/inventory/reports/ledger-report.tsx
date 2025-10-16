"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Input } from "~/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export function LedgerReport() {
  const [materialFilter, setMaterialFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);

  // Fetch materials for filter
  const { data: materialsData } = useQuery({
    queryKey: ["materials-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/materials?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch materials");
      return res.json();
    },
  });

  // Fetch locations for filter
  const { data: locationsData } = useQuery({
    queryKey: ["locations-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/locations?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["ledger", { materialFilter, locationFilter, dateFrom, dateTo, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "50",
        ...(materialFilter && { materialId: materialFilter }),
        ...(locationFilter && { locationId: locationFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      const res = await fetch(`/api/inventory/ledger?${params}`);
      if (!res.ok) throw new Error("Failed to fetch ledger");
      return res.json();
    },
  });

  const getLedgerTypeBadge = (type: string) => {
    const isIn = type.startsWith("IN_") || type === "COUNT_DIFF_IN";
    return (
      <Badge variant={isIn ? "default" : "destructive"}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kartu Stok (Stock Ledger)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-4 gap-2">
          <Select
            value={materialFilter || "all"}
            onValueChange={(value) => setMaterialFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Material</SelectItem>
              {materialsData?.data?.map((mat: any) => (
                <SelectItem key={mat.id} value={mat.id}>
                  {mat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={locationFilter || "all"}
            onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {locationsData?.data?.map((loc: any) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.warehouse?.name} - {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="Dari Tanggal"
          />

          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Sampai Tanggal"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Saldo Awal</TableHead>
                    <TableHead className="text-right">Saldo Akhir</TableHead>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.items?.map((ledger: any) => (
                    <TableRow key={ledger.id}>
                      <TableCell>{format(new Date(ledger.createdAt), "dd MMM yyyy HH:mm")}</TableCell>
                      <TableCell>{ledger.material?.name}</TableCell>
                      <TableCell>
                        {ledger.location?.warehouse?.name} - {ledger.location?.name}
                      </TableCell>
                      <TableCell>{getLedgerTypeBadge(ledger.ledgerType)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {ledger.ledgerType.startsWith("IN_") || ledger.ledgerType === "COUNT_DIFF_IN" ? "+" : "-"}
                        {Math.abs(ledger.qty)}
                      </TableCell>
                      <TableCell className="text-right">{ledger.beforeQty}</TableCell>
                      <TableCell className="text-right font-medium">{ledger.afterQty}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ledger.refTable && ledger.refId ? `${ledger.refTable}` : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ledger.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {data?.data?.items?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data ledger
              </div>
            )}

            {data?.data?.pagination && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Halaman {data.data.pagination.page} dari {data.data.pagination.totalPages}
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
                    disabled={page >= data.data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

