"use client";

import type { ChangeEvent } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import type { OpeningBalanceEntryDTO } from "~/server/types/pt-pks/opening-balance";
import { Badge } from "~/components/ui/badge";

interface Props {
  entries: OpeningBalanceEntryDTO[];
  onChange: (accountId: string, field: "debit" | "credit", value: string) => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

export function OpeningBalanceTable({ entries, onChange, readOnly, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed p-10 text-muted-foreground">
        Memuat saldo awal akun...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed p-10 text-muted-foreground">
        Tidak ada akun posting untuk diisikan saldo awal.
      </div>
    );
  }

  const handleChange = (accountId: string, field: "debit" | "credit") => (event: ChangeEvent<HTMLInputElement>) => {
    onChange(accountId, field, event.target.value);
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Kode</TableHead>
            <TableHead>Nama Akun</TableHead>
            <TableHead className="w-[110px] text-center">Normal</TableHead>
            <TableHead className="w-[160px] text-right">Saldo Debit</TableHead>
            <TableHead className="w-[160px] text-right">Saldo Kredit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.accountId}>
              <TableCell className="font-mono text-sm">{entry.accountCode}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{entry.accountName}</span>
                  <span className="text-xs text-muted-foreground">{entry.class.replace("_", " ")}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={entry.normalSide === "DEBIT" ? "success" : "secondary"} className="text-xs">
                  {entry.normalSide}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Input
                  value={entry.debit}
                  onChange={handleChange(entry.accountId, "debit")}
                  inputMode="decimal"
                  className="text-right"
                  disabled={readOnly}
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  value={entry.credit}
                  onChange={handleChange(entry.accountId, "credit")}
                  inputMode="decimal"
                  className="text-right"
                  disabled={readOnly}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
