"use client";

import { Loader2, Trash2 } from "lucide-react";
import { type CellContext, type ColumnDef } from "@tanstack/react-table";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import type { WeighbridgeTicketDTO } from "~/server/types/pt-pks/weighbridge";

const numberFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const weightFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  if (digits === 0) {
    return weightFormatter.format(value);
  }
  return numberFormatter.format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${numberFormatter.format(value * 100)}%`;
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return currencyFormatter.format(value);
}

const toDateInput = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

const toTimeInput = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "HH:mm");
};

type ColumnMeta = {
  editable?: boolean;
  inputType?: "text" | "number" | "date" | "time";
  step?: number;
  min?: number;
  max?: number;
  align?: "left" | "center" | "right";
  placeholder?: string;
  formatter?: (value: unknown, row: WeighbridgeTicketDTO) => ReactNode;
  toInputValue?: (value: unknown, row: WeighbridgeTicketDTO) => string;
  fromInputValue?: (value: string, row: WeighbridgeTicketDTO) => unknown;
};

type TableMeta = {
  onCommit: (
    row: WeighbridgeTicketDTO,
    columnId: string,
    value: unknown
  ) => void;
  isPending: (id: string) => boolean;
  getError?: (id: string) => string | undefined;
};

function EditableCell(cellCtx: CellContext<WeighbridgeTicketDTO, unknown>) {
  const { cell, row } = cellCtx;
  const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
  const tableMeta = cellCtx.table?.options?.meta as TableMeta | undefined;
  const pending = tableMeta?.isPending?.(row.original.id) ?? false;
  const errorMessage = tableMeta?.getError?.(row.original.id);

  const rawValue = cell.getValue<unknown>();
  const fallbackDisplay: ReactNode =
    rawValue === null || rawValue === undefined ? "-" : (rawValue as ReactNode);
  const displayValue: ReactNode =
    meta?.formatter?.(rawValue, row.original) ?? fallbackDisplay;

  if (!meta?.editable) {
    const renderedValue =
      displayValue === null || displayValue === undefined || displayValue === ""
        ? "-"
        : displayValue;

    return (
      <span
        className={cn(
          meta?.align === "right" && "text-right",
          meta?.align === "center" && "text-center"
        )}
      >
        {renderedValue}
      </span>
    );
  }

  const inputValue = meta.toInputValue
    ? meta.toInputValue(rawValue, row.original)
    : rawValue != null
      ? String(rawValue)
      : "";

  const [value, setValue] = useState<string>(inputValue ?? "");

  useEffect(() => {
    const nextValue = meta.toInputValue
      ? meta.toInputValue(rawValue, row.original)
      : rawValue != null
        ? String(rawValue)
        : "";
    setValue(nextValue ?? "");
  }, [rawValue, row.original, meta]);

  const commit = () => {
    const converted = meta.fromInputValue
      ? meta.fromInputValue(value, row.original)
      : value;

    const current = meta.fromInputValue
      ? meta.fromInputValue(inputValue ?? "", row.original)
      : rawValue;

    const bothNumbers =
      typeof converted === "number" && typeof current === "number";

    if (
      (bothNumbers && Math.abs(converted - current) < 1e-6) ||
      (!bothNumbers && converted === current)
    ) {
      return;
    }

    if (!tableMeta?.onCommit) {
      return;
    }

    tableMeta.onCommit(row.original, cell.column.id, converted);
  };

  const handleBlur = () => commit();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
    if (event.key === "Escape") {
      setValue(inputValue ?? "");
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          type={meta.inputType ?? "text"}
          step={meta.step}
          min={meta.min}
          max={meta.max}
          placeholder={meta.placeholder}
          disabled={pending}
          className={cn(
            meta.align === "right" && "text-right",
            meta.align === "center" && "text-center",
            pending && "pr-8",
            errorMessage &&
              "border-destructive focus-visible:ring-destructive/40"
          )}
        />
        {pending && (
          <Loader2 className="absolute right-2 top-1.5 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {errorMessage && (
        <Badge
          variant="destructive"
          className="w-fit text-[10px] uppercase"
          title={errorMessage}
        >
          Error
        </Badge>
      )}
    </div>
  );
}

export interface TimbanganColumnOptions {
  onDelete?: (row: WeighbridgeTicketDTO) => void;
  onView?: (row: WeighbridgeTicketDTO) => void;
}

export function useTimbanganColumns(options: TimbanganColumnOptions) {
  return useMemo<ColumnDef<WeighbridgeTicketDTO>[]>(
    () => [
      {
        header: "No. Seri",
        accessorKey: "noSeri",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "No. Polisi",
        accessorKey: "plateNo",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "Nama Relasi",
        accessorKey: "relasiNama",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "Produk",
        accessorKey: "produk",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "Berat Timbang 1",
        accessorKey: "timbang1",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "number",
          step: 1,
          min: 0,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
          fromInputValue: (value: string) => Number(value),
        },
      },
      {
        header: "Berat Timbang 2",
        accessorKey: "timbang2",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "number",
          step: 1,
          min: 0,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
          fromInputValue: (value: string) => Number(value),
        },
      },
      {
        header: "Netto 1",
        accessorKey: "netto1",
        cell: EditableCell,
        meta: {
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Berat Pot (%)",
        accessorKey: "potPercent",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "number",
          step: 0.01,
          min: 0,
          align: "right",
          formatter: (value: unknown) => formatPercent(value as number),
          toInputValue: (value: unknown) =>
            value != null ? String(Number(value) * 100) : "",
          fromInputValue: (value: string) => Number(value) / 100,
        },
      },
      {
        header: "Berat Pot (kg)",
        accessorKey: "potKg",
        cell: EditableCell,
        meta: {
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Berat Terima",
        accessorKey: "beratTerima",
        cell: EditableCell,
        meta: {
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Tanggal",
        accessorKey: "tanggal",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "date",
          formatter: (value: unknown) => {
            if (!value) return "-";
            const date = new Date(value as string);
            if (Number.isNaN(date.getTime())) return "-";
            return format(date, "dd/MM/yyyy");
          },
          toInputValue: (value: unknown) => toDateInput(value as string),
          fromInputValue: (value: string) =>
            value ? new Date(`${value}T00:00:00`).toISOString() : undefined,
        },
      },
      {
        header: "Jam Masuk",
        accessorKey: "jamMasuk",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "time",
          formatter: (value: unknown) => {
            if (!value) return "-";
            const date = new Date(value as string);
            if (Number.isNaN(date.getTime())) return "-";
            return format(date, "HH:mm");
          },
          toInputValue: (value: unknown) => toTimeInput(value as string),
          fromInputValue: (value: string, row: WeighbridgeTicketDTO) => {
            if (!value) return null;
            const [hoursString, minutesString] = value.split(":");
            if (hoursString == null || minutesString == null) return null;
            const hours = Number(hoursString);
            const minutes = Number(minutesString);
            const base = row.jamMasuk
              ? new Date(row.jamMasuk)
              : new Date(row.tanggal);
            if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
            base.setHours(hours, minutes, 0, 0);
            return base.toISOString();
          },
        },
      },
      {
        header: "Jam Keluar",
        accessorKey: "jamKeluar",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "time",
          formatter: (value: unknown) => {
            if (!value) return "-";
            const date = value ? new Date(value as string) : null;
            if (!date || Number.isNaN(date.getTime())) return "-";
            return format(date, "HH:mm");
          },
          toInputValue: (value: unknown) => toTimeInput(value as string),
          fromInputValue: (value: string, row: WeighbridgeTicketDTO) => {
            if (!value) return null;
            const [hoursString, minutesString] = value.split(":");
            if (hoursString == null || minutesString == null) return null;
            const hours = Number(hoursString);
            const minutes = Number(minutesString);
            const base = row.jamKeluar
              ? new Date(row.jamKeluar)
              : new Date(row.tanggal);
            if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
            base.setHours(hours, minutes, 0, 0);
            return base.toISOString();
          },
        },
      },
      {
        header: "Lokasi Kebun",
        accessorKey: "lokasiKebun",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "NAMA",
        accessorKey: "beneficiaryNm",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "BANK",
        accessorKey: "bankName",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "NO. REKENING",
        accessorKey: "bankAccountNo",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "Penimbang",
        accessorKey: "penimbang",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "text",
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <Badge variant={value === "POSTED" ? "default" : "secondary"}>
              {value}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-center">
            {options.onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => options.onView?.(row.original)}
              >
                Detail
              </Button>
            )}
            {options.onDelete && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => options.onDelete?.(row.original)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [options.onDelete, options.onView]
  );
}

export interface PBColumnOptions {
  onView?: (row: WeighbridgeTicketDTO) => void;
}

export function usePBColumns(options: PBColumnOptions) {
  return useMemo<ColumnDef<WeighbridgeTicketDTO>[]>(
    () => [
      {
        header: "No. Seri",
        accessorKey: "noSeri",
        cell: EditableCell,
        meta: { editable: false },
      },
      {
        header: "No. Polisi",
        accessorKey: "plateNo",
        cell: EditableCell,
        meta: { editable: false },
      },
      {
        header: "Nama Relasi",
        accessorKey: "relasiNama",
        cell: EditableCell,
        meta: { editable: false },
      },
      {
        header: "Produk",
        accessorKey: "produk",
        cell: EditableCell,
        meta: { editable: false },
      },
      {
        header: "Berat Timbang 1",
        accessorKey: "timbang1",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Berat Timbang 2",
        accessorKey: "timbang2",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Netto 1",
        accessorKey: "netto1",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Berat Pot (%)",
        accessorKey: "potPercent",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatPercent(value as number),
        },
      },
      {
        header: "Berat Pot (kg)",
        accessorKey: "potKg",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Berat Terima",
        accessorKey: "beratTerima",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatNumber(value as number, 0),
        },
      },
      {
        header: "Harga",
        accessorKey: "hargaPerKg",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "number",
          align: "right",
          step: 1,
          min: 0,
          placeholder: "0",
          toInputValue: (value: unknown) =>
            value === null || value === undefined || Number.isNaN(value)
              ? ""
              : String(value),
          fromInputValue: (value: string) => {
            const parsed = Number(value ?? "");
            return Number.isFinite(parsed) ? parsed : undefined;
          },
          formatter: (value: unknown) => formatCurrency(value as number),
        },
      },
      {
        header: "Total",
        accessorKey: "total",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatCurrency(value as number),
        },
      },
      {
        header: "PPH (rate %)",
        accessorKey: "pphRate",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "number",
          align: "right",
          step: 0.01,
          min: 0,
          formatter: (value: unknown) => formatPercent(value as number),
          toInputValue: (value: unknown) =>
            value === null || value === undefined || Number.isNaN(value)
              ? ""
              : String(Number(value) * 100),
          fromInputValue: (value: string) => {
            const parsed = Number(value ?? "");
            return Number.isFinite(parsed) ? parsed / 100 : undefined;
          },
        },
      },
      {
        header: "Total PPH",
        accessorKey: "totalPph",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatCurrency(value as number),
        },
      },
      {
        header: "Total Pembayaran ke Supplier",
        accessorKey: "totalPembayaranSupplier",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatCurrency(value as number),
        },
      },
      {
        header: "Tanggal",
        accessorKey: "tanggal",
        cell: EditableCell,
        meta: {
          editable: false,
          formatter: (value: unknown) => {
            if (!value) return "-";
            const date = new Date(value as string);
            if (Number.isNaN(date.getTime())) return "-";
            return format(date, "dd/MM/yyyy");
          },
        },
      },
      {
        header: "Jam Masuk",
        accessorKey: "jamMasuk",
        cell: EditableCell,
        meta: {
          editable: false,
          formatter: (value: unknown) => {
            if (!value) return "-";
            const date = new Date(value as string);
            if (Number.isNaN(date.getTime())) return "-";
            return format(date, "HH:mm");
          },
        },
      },
      {
        header: "Jam Keluar",
        accessorKey: "jamKeluar",
        cell: EditableCell,
        meta: {
          editable: false,
          formatter: (value: unknown) => {
            if (!value) return "-";
            const date = new Date(value as string);
            if (Number.isNaN(date.getTime())) return "-";
            return format(date, "HH:mm");
          },
        },
      },
      {
        header: "Upah Bongkar (Rp/kg)",
        accessorKey: "upahBongkarPerKg",
        cell: EditableCell,
        meta: {
          editable: true,
          inputType: "number",
          align: "right",
          step: 1,
          min: 0,
          formatter: (value: unknown) => formatCurrency(value as number),
          toInputValue: (value: unknown) =>
            value === null || value === undefined || Number.isNaN(value)
              ? ""
              : String(value),
          fromInputValue: (value: string) => {
            const parsed = Number(value ?? "");
            return Number.isFinite(parsed) ? parsed : undefined;
          },
        },
      },
      {
        header: "Total Upah Bongkar",
        accessorKey: "totalUpahBongkar",
        cell: EditableCell,
        meta: {
          editable: false,
          align: "right",
          formatter: (value: unknown) => formatCurrency(value as number),
        },
      },
      {
        header: "Penimbang",
        accessorKey: "penimbang",
        cell: EditableCell,
        meta: { editable: false },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <Badge variant={value === "POSTED" ? "default" : "secondary"}>
              {value}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {options.onView && (
              <Button size="sm" variant="outline" onClick={() => options.onView?.(row.original)}>
                Detail
              </Button>
            )}
          </div>
        ),
        enableSorting: false,
      },
    ],
    [options.onView]
  );
}

export type { ColumnMeta, TableMeta };
