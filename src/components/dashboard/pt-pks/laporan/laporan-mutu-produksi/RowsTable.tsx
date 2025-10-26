"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Eye } from "lucide-react";
import { val, getSyncStatusVariant, formatValue } from "./mutu-utils";
import { PayloadDrawer } from "./PayloadDrawer";
import type { PksMutuProduksiDto } from "~/server/types/pt-pks/mutu-produksi";

interface RowsTableProps {
  data: PksMutuProduksiDto[];
  isLoading?: boolean;
}

export function RowsTable({ data, isLoading }: RowsTableProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<{
    payload: Record<string, unknown>;
    tanggal: string;
    shift: string;
  } | null>(null);

  const handleDetailClick = (item: PksMutuProduksiDto) => {
    setSelectedPayload({
      payload: item.payload,
      tanggal: item.tanggal,
      shift: item.shift,
    });
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>TBS (Hari)</TableHead>
              <TableHead>%OER (Hari)</TableHead>
              <TableHead>CPO (Hari)</TableHead>
              <TableHead>FFA</TableHead>
              <TableHead>Moist</TableHead>
              <TableHead>Dirt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Belum ada data.
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead className="text-right">TBS (Hari)</TableHead>
              <TableHead className="text-right">%OER (Hari)</TableHead>
              <TableHead className="text-right">CPO (Hari)</TableHead>
              <TableHead className="text-right">FFA</TableHead>
              <TableHead className="text-right">Moist</TableHead>
              <TableHead className="text-right">Dirt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const tbs = val(item.payload, "A_TBS_tbs_diolah_hari");
              const oer = val(item.payload, "A_TBS_oer_hari");
              const cpo = val(item.payload, "C_cpo_produksi_hari");
              const ffa = val(item.payload, "C_ffa_hari");
              const moisture = val(item.payload, "C_moisture_hari");
              const dirt = val(item.payload, "C_dirt_hari");

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.tanggal}</TableCell>
                  <TableCell>{item.shift}</TableCell>
                  <TableCell className="text-right">{formatValue(tbs, " ton")}</TableCell>
                  <TableCell className="text-right">{formatValue(oer, "%")}</TableCell>
                  <TableCell className="text-right">{formatValue(cpo, " ton")}</TableCell>
                  <TableCell className="text-right">{formatValue(ffa, "%")}</TableCell>
                  <TableCell className="text-right">{formatValue(moisture, "%")}</TableCell>
                  <TableCell className="text-right">{formatValue(dirt, "%")}</TableCell>
                  <TableCell>
                    <Badge variant={getSyncStatusVariant(item.syncStatus)}>
                      {item.syncStatus || "DRAFT"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDetailClick(item)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PayloadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        payload={selectedPayload?.payload ?? null}
        tanggal={selectedPayload?.tanggal}
        shift={selectedPayload?.shift}
      />
    </>
  );
}
