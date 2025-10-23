"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { FileUp, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface ImportDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FieldDefinition = {
  key: FieldKey;
  label: string;
  required?: boolean;
  description?: string;
};

const FIELD_DEFINITIONS: FieldDefinition[] = [
  { key: "code", label: "Kode Akun", required: true },
  { key: "name", label: "Nama Akun", required: true },
  { key: "class", label: "Klasifikasi", required: true, description: "Asset, Liability, Equity, Revenue, COGS, Expense, Other Income, Other Expense" },
  { key: "normalSide", label: "Normal Side", required: true, description: "Debit atau Credit" },
  { key: "isPosting", label: "Posting", required: true, description: "TRUE/FALSE atau Posting/Header" },
  { key: "isCashBank", label: "Cash/Bank", description: "TRUE/FALSE" },
  { key: "taxCode", label: "Kode Pajak", description: "NON_TAX, PPN_MASUKAN, PPN_KELUARAN, PPH21, PPH22, PPH23" },
  { key: "parentCode", label: "Kode Parent", description: "Kode akun parent (optional)" },
  { key: "currency", label: "Mata Uang", description: "Contoh: IDR" },
  { key: "description", label: "Deskripsi" },
  { key: "status", label: "Status", description: "AKTIF atau NONAKTIF" },
];

type FieldKey = "code" | "name" | "class" | "normalSide" | "isPosting" | "isCashBank" | "taxCode" | "parentCode" | "currency" | "description" | "status";

type ColumnMapping = Record<FieldKey, string | null>;

type ParsedRow = {
  code: string;
  name: string;
  class: string;
  normalSide: string;
  isPosting: boolean;
  isCashBank: boolean;
  taxCode: string;
  currency: string | null;
  description: string | null;
  status: string;
  parentCode: string | null;
};

type RawRow = Record<string, unknown>;

const CLASS_MAP: Record<string, string> = {
  asset: "ASSET",
  assets: "ASSET",
  liabilities: "LIABILITY",
  liability: "LIABILITY",
  hutang: "LIABILITY",
  equity: "EQUITY",
  modal: "EQUITY",
  revenue: "REVENUE",
  pendapatan: "REVENUE",
  cogs: "COGS",
  hpp: "COGS",
  expense: "EXPENSE",
  expenses: "EXPENSE",
  beban: "EXPENSE",
  "other income": "OTHER_INCOME",
  "lainnya income": "OTHER_INCOME",
  "other expense": "OTHER_EXPENSE",
  "lainnya expense": "OTHER_EXPENSE",
};

const TAX_CODE_MAP: Record<string, string> = {
  "non tax": "NON_TAX",
  nontax: "NON_TAX",
  non_tax: "NON_TAX",
  "ppn masukan": "PPN_MASUKAN",
  ppn_masukan: "PPN_MASUKAN",
  ppnmasukan: "PPN_MASUKAN",
  "ppn keluaran": "PPN_KELUARAN",
  ppn_keluar: "PPN_KELUARAN",
  ppnkeluaran: "PPN_KELUARAN",
  pph21: "PPH21",
  "pph 21": "PPH21",
  pph22: "PPH22",
  "pph 22": "PPH22",
  pph23: "PPH23",
  "pph 23": "PPH23",
};

const STATUS_MAP: Record<string, string> = {
  aktif: "AKTIF",
  active: "AKTIF",
  nonaktif: "NONAKTIF",
  inactive: "NONAKTIF",
  "non aktif": "NONAKTIF",
};

const BOOLEAN_TRUE = new Set(["true", "ya", "yes", "y", "1", "posting"]);
const BOOLEAN_FALSE = new Set(["false", "tidak", "no", "n", "0", "header", "non posting"]);

export function ImportDialog({ companyId, open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>(() =>
    Object.fromEntries(FIELD_DEFINITIONS.map(({ key }) => [key, null])) as ColumnMapping,
  );
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [importRows, setImportRows] = useState<ParsedRow[]>([]);
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [fileMeta, setFileMeta] = useState<{ name: string; sheet: string } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const resetState = useCallback(() => {
    setColumnNames([]);
    setRawRows([]);
    setMapping(Object.fromEntries(FIELD_DEFINITIONS.map(({ key }) => [key, null])) as ColumnMapping);
    setPreviewRows([]);
    setImportRows([]);
    setRowErrors([]);
    setFileMeta(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const [file] = acceptedFiles;
      if (!file) return;
      setIsParsing(true);
      try {
        const ExcelJS = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          throw new Error("File tidak memiliki worksheet");
        }

        const headerRow = worksheet.getRow(1);
        const headers: string[] = [];
        headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const header = String(cell.value ?? "").trim();
          if (!header) return;
          headers.push(header);
          worksheet.getColumn(colNumber).key = header;
        });

        if (!headers.length) {
          throw new Error("Header sheet tidak ditemukan di baris pertama");
        }

        const parsedRows: RawRow[] = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return;
          const record: RawRow = {};
          headers.forEach((header) => {
            const cell = row.getCell(header);
            record[header] = cell?.value ?? null;
          });
          const hasContent = headers.some((header) => {
            const value = record[header];
            return value !== undefined && value !== null && String(value).trim() !== "";
          });
          if (hasContent) {
            parsedRows.push(record);
          }
        });

        if (!parsedRows.length) {
          throw new Error("Tidak ada data baris ditemukan pada worksheet");
        }

        setColumnNames(headers);
        setRawRows(parsedRows);
        setFileMeta({ name: file.name, sheet: worksheet.name });
        setMapping((prev) => applyAutoMapping(headers, prev));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal membaca file Excel");
        resetState();
      } finally {
        setIsParsing(false);
      }
    },
    [resetState],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
    onDrop,
  });

  useEffect(() => {
    if (!rawRows.length) {
      setPreviewRows([]);
      setImportRows([]);
      setRowErrors([]);
      return;
    }

    const missingRequired = FIELD_DEFINITIONS.filter((field) => field.required && !mapping[field.key]);
    if (missingRequired.length) {
      setPreviewRows([]);
      setImportRows([]);
      setRowErrors([
        `Lengkapi mapping untuk field wajib: ${missingRequired.map((f) => f.label).join(", ")}`,
      ]);
      return;
    }

    const result = transformRows(rawRows, mapping);
    setPreviewRows(result.rows.slice(0, 20));
    setImportRows(result.rows);
    setRowErrors(result.errors);
  }, [rawRows, mapping]);

  const handleMappingChange = (field: FieldKey, column: string | null) => {
    setMapping((prev) => ({ ...prev, [field]: column }));
  };

  const handleImport = async () => {
    if (!importRows.length) {
      toast.error("Tidak ada data yang dapat diimport. Periksa mapping dan data sumber.");
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch(`/api/pt-pks/daftar-akun/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, rows: importRows }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? "Import akun gagal");
      }

      const result = await res.json();
      toast.success(`Import berhasil. ${result.imported ?? importRows.length} akun diproses.`);
      onOpenChange(false);
      onSuccess?.();
      resetState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import akun gagal");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportSample = async () => {
    try {
      const sampleData: ParsedRow[] = [
        {
          code: "1-1101",
          name: "Kas Kecil",
          class: "ASSET",
          normalSide: "DEBIT",
          isPosting: true,
          isCashBank: true,
          taxCode: "NON_TAX",
          currency: "IDR",
          description: "Kas kecil kantor",
          status: "AKTIF",
          parentCode: null,
        },
        {
          code: "1-1201",
          name: "Piutang Usaha",
          class: "ASSET",
          normalSide: "DEBIT",
          isPosting: true,
          isCashBank: false,
          taxCode: "NON_TAX",
          currency: "IDR",
          description: "Piutang usaha pelanggan",
          status: "AKTIF",
          parentCode: null,
        },
      ];

      const res = await fetch(`/api/pt-pks/daftar-akun/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, rows: sampleData }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? "Import sample gagal");
      }

      toast.success("Import sample akun berhasil");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import sample gagal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Daftar Akun</DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) yang berisi daftar akun PT PKS. Pastikan mapping kolom sudah sesuai.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/50 hover:border-primary",
            )}
          >
            <input {...getInputProps()} />
            <FileUp className="mb-2 h-8 w-8 text-primary" />
            <p className="font-medium">
              {isDragActive ? "Lepaskan file di sini" : "Tarik & lepaskan file .xlsx atau klik untuk memilih"}
            </p>
            <p className="text-sm text-muted-foreground">
              Gunakan template dengan baris pertama sebagai header kolom.
            </p>
          </div>

          {fileMeta && (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-2 text-sm">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{fileMeta.name}</p>
                  <p className="text-muted-foreground">Worksheet: {fileMeta.sheet}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetState}>
                Ganti File
              </Button>
            </div>
          )}

          {columnNames.length > 0 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Mapping Kolom</h4>
                <p className="text-sm text-muted-foreground">
                  Cocokkan kolom Excel dengan field sistem.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {FIELD_DEFINITIONS.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{field.label}</span>
                      {field.required && <Badge variant="outline">Wajib</Badge>}
                    </div>
                    {field.description && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                    <Select
                      value={mapping[field.key] ?? ""}
                      onValueChange={(value) => handleMappingChange(field.key, value || null)}
                      disabled={isParsing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kolom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Tidak digunakan --</SelectItem>
                        {columnNames.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rowErrors.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Perlu perhatian</span>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
                {rowErrors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {rowErrors.length > 5 && (
                  <li>Dan {rowErrors.length - 5} error lainnya...</li>
                )}
              </ul>
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Preview Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {previewRows.length} baris pertama dari {importRows.length} baris valid.
                  </p>
                </div>
                <Badge variant={rowErrors.length ? "secondary" : "outline"} className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Siap diimport: {importRows.length} baris
                </Badge>
              </div>
              <div className="h-64 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Klasifikasi</TableHead>
                      <TableHead>Normal</TableHead>
                      <TableHead>Posting</TableHead>
                      <TableHead>Cash/Bank</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Parent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, index) => (
                      <TableRow key={`${row.code}-${index}`}>
                        <TableCell className="font-mono">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.class}</TableCell>
                        <TableCell>{row.normalSide}</TableCell>
                        <TableCell>{row.isPosting ? "Posting" : "Header"}</TableCell>
                        <TableCell>{row.isCashBank ? "Ya" : "-"}</TableCell>
                        <TableCell>{row.taxCode}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.parentCode ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total baris valid: {importRows.length}</span>
            {rowErrors.length > 0 && (
              <span className="text-destructive">Baris bermasalah: {rowErrors.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleImportSample} disabled={isParsing || isImporting}>
              Import Sample
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetState}
              disabled={isParsing || isImporting}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isParsing || isImporting || !importRows.length || rowErrors.length > 0}
            >
              {isImporting ? "Mengimport..." : "Import"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function applyAutoMapping(headers: string[], current: ColumnMapping): ColumnMapping {
  const autoMap: Record<FieldKey, string[]> = {
    code: ["code", "kode", "kode akun", "account code"],
    name: ["name", "nama", "nama akun", "account name"],
    class: ["class", "kategori", "category", "type"],
    normalSide: ["normal", "side", "sisi", "debit/credit"],
    isPosting: ["posting", "is posting", "header", "tipe akun"],
    isCashBank: ["cash", "bank", "cashbank", "cash/bank"],
    taxCode: ["tax", "tax code", "kode pajak"],
    parentCode: ["parent", "parent code", "kode parent", "parent akun"],
    currency: ["currency", "mata uang", "curr"],
    description: ["description", "deskripsi", "keterangan"],
    status: ["status", "aktif"],
  };

  const normalizedHeaders = headers.map((header) => header.toLowerCase().trim());
  const nextMapping = { ...current };

  for (const field of FIELD_DEFINITIONS) {
    if (nextMapping[field.key]) continue;
    const candidates = autoMap[field.key];
    if (!candidates) continue;

    const index = normalizedHeaders.findIndex((header) => candidates.includes(header));
    if (index >= 0) {
      const headerMatch = headers[index];
      if (headerMatch) {
        nextMapping[field.key] = headerMatch;
      }
    }
  }

  return nextMapping;
}

function transformRows(rows: RawRow[], mapping: ColumnMapping) {
  const parsed: ParsedRow[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // header on row 1
    try {
      const getValue = (key: FieldKey, required?: boolean) => {
        const column = mapping[key];
        if (!column) {
          if (required) {
            throw new Error(`Kolom untuk field ${key} belum dipetakan`);
          }
          return undefined;
        }
        return row[column];
      };

      const code = normalizeString(getValue("code", true), "Kode akun", true);
      const name = normalizeString(getValue("name", true), "Nama akun", true);
      const accountClass = normalizeClass(getValue("class", true));
      const normalSide = normalizeNormalSide(getValue("normalSide", true));

      const isPosting = normalizeBoolean(getValue("isPosting", true), true);
      const isCashBank = normalizeBoolean(getValue("isCashBank"), false);

      const taxCode = normalizeTaxCode(getValue("taxCode"));
      const currency = normalizeCurrency(getValue("currency"));
      const description = normalizeOptionalString(getValue("description"));
      const status = normalizeStatus(getValue("status"));
      const parentCode = normalizeOptionalString(getValue("parentCode"));

      parsed.push({
        code,
        name,
        class: accountClass,
        normalSide,
        isPosting,
        isCashBank,
        taxCode,
        currency,
        description,
        status,
        parentCode,
      });
    } catch (error) {
      errors.push(`Baris ${rowNumber}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return { rows: parsed, errors };
}

function normalizeString(value: unknown, label: string, required = false): string {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${label} wajib diisi`);
    return "";
  }
  const text = String(value).trim();
  if (!text && required) {
    throw new Error(`${label} tidak boleh kosong`);
  }
  return text;
}

function normalizeClass(value: unknown): string {
  const text = normalizeString(value, "Klasifikasi akun", true).toLowerCase();
  if (CLASS_MAP[text]) return CLASS_MAP[text];
  const normalized = text.replace(/\s+/g, "_").toUpperCase();
  const valid = [
    "ASSET",
    "LIABILITY",
    "EQUITY",
    "REVENUE",
    "COGS",
    "EXPENSE",
    "OTHER_INCOME",
    "OTHER_EXPENSE",
  ];
  if (!valid.includes(normalized)) {
    throw new Error(`Klasifikasi "${value}" tidak dikenali`);
  }
  return normalized;
}

function normalizeNormalSide(value: unknown): string {
  const text = normalizeString(value, "Normal side", true).toLowerCase();
  if (["debit", "db", "d"].includes(text)) return "DEBIT";
  if (["credit", "cr", "c", "kredit", "kr"].includes(text)) return "CREDIT";
  throw new Error(`Normal side "${value}" tidak valid (gunakan Debit atau Credit)`);
}

function normalizeBoolean(value: unknown, defaultValue = false): boolean {
  if (value === undefined || value === null || String(value).trim() === "") {
    return defaultValue;
  }
  const text = String(value).trim().toLowerCase();
  if (BOOLEAN_TRUE.has(text)) return true;
  if (BOOLEAN_FALSE.has(text)) return false;
  throw new Error(`Nilai boolean "${value}" tidak valid`);
}

function normalizeTaxCode(value: unknown): string {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "NON_TAX";
  }
  const text = String(value).trim().toLowerCase();
  if (TAX_CODE_MAP[text]) return TAX_CODE_MAP[text];

  const normalized = text.replace(/\s+/g, "_").toUpperCase();
  const valid = ["NON_TAX", "PPN_MASUKAN", "PPN_KELUARAN", "PPH21", "PPH22", "PPH23"];
  if (!valid.includes(normalized)) {
    throw new Error(`Kode pajak "${value}" tidak dikenali`);
  }
  return normalized;
}

function normalizeCurrency(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim().toUpperCase();
  return text || null;
}

function normalizeOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function normalizeStatus(value: unknown): string {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "AKTIF";
  }
  const text = String(value).trim().toLowerCase();
  if (STATUS_MAP[text]) return STATUS_MAP[text];
  const normalized = text.replace(/\s+/g, "").toUpperCase();
  const valid = ["AKTIF", "NONAKTIF"];
  if (!valid.includes(normalized)) {
    throw new Error(`Status "${value}" tidak valid (gunakan AKTIF atau NONAKTIF)`);
  }
  return normalized;
}
