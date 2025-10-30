"use client";

/**
 * Timbangan Table - Pricing Input Table
 * Phase 2: Input harga, PPh, upah bongkar
 */

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle2, CalendarIcon, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import * as XLSX from "xlsx";
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
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency, cn } from "~/lib/utils";

// Sesuaikan dengan WeighbridgeTicketDTO
interface Ticket {
  id: string;
  companyId: string;
  noSeri: string;
  vehicleId: string;
  supplierId: string;
  itemId: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string | null;
  timbang1: number;
  timbang2: number;
  netto1: number;
  potPercent: number;
  potKg: number;
  beratTerima: number;
  lokasiKebun: string | null;
  penimbang: string | null;
  hargaPerKg: number;
  pphRate: number;
  upahBongkarPerKg: number;
  total: number;
  totalPph: number;
  totalUpahBongkar: number;
  totalPembayaranSupplier: number;
  status: "DRAFT" | "APPROVED" | "POSTED";
  purchaseJeId: string | null;
  unloadJeId: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  vehicle?: {
    id: string;
    plateNo: string;
    type: string;
    capacityTons: number | null;
  };
  supplier?: {
    id: string;
    namaPemilik: string;
    namaPerusahaan: string | null;
    alamatRampPeron: string | null;
    lokasiKebun: string | null;
    bankName: string | null;
    bankAccountNo: string | null;
    bankAccountName: string | null;
  };
  item?: {
    id: string;
    sku: string;
    name: string;
  };
}

interface EditState {
  [ticketId: string]: {
    hargaPerKg: string;
    pphRate: string;
    upahBongkarPerKg: string;
    total: string;
    totalPph: string;
    totalUpahBongkar: string;
    totalPembayaranSupplier: string;
  };
}

export function TimbanganTable({ companyId }: { companyId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [editState, setEditState] = useState<EditState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("DRAFT");

  // Fetch tickets
  useEffect(() => {
    void fetchTickets();
  }, [startDate, endDate, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ companyId });
      if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
      if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/pt-pks/timbangan?${params.toString()}`);
      const data = (await res.json()) as { success: boolean; data: Ticket[] };

      if (data.success && data.data) {
        setTickets(data.data);
        
        // Initialize edit state
        const initialEditState: EditState = {};
        data.data.forEach((ticket) => {
          initialEditState[ticket.id] = {
            hargaPerKg: ticket.hargaPerKg.toString(),
            pphRate: (ticket.pphRate * 100).toString(), // Convert to percentage
            upahBongkarPerKg: ticket.upahBongkarPerKg.toString(),
            total: ticket.total.toString(),
            totalPph: ticket.totalPph.toString(),
            totalUpahBongkar: ticket.totalUpahBongkar.toString(),
            totalPembayaranSupplier: ticket.totalPembayaranSupplier.toString(),
          };
        });
        setEditState(initialEditState);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update pricing field and recalculate
  const updatePricing = (ticketId: string, field: string, value: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const currentState = editState[ticketId];
    if (!currentState) return;

    const updated = { ...currentState, [field]: value };

    // Parse values
    const beratTerima = ticket.beratTerima;
    const hargaPerKg = parseFloat(updated.hargaPerKg) || 0;
    const upahBongkarPerKg = parseFloat(updated.upahBongkarPerKg) || 0;
    const pphRateDecimal = (parseFloat(updated.pphRate) || 0) / 100; // Convert % to decimal

    // Calculate totals
    const total = beratTerima * hargaPerKg;
    const totalUpahBongkar = beratTerima * upahBongkarPerKg;
    const totalPph = total * pphRateDecimal;
    const totalPembayaranSupplier = total - totalPph;

    updated.total = total.toFixed(2);
    updated.totalPph = totalPph.toFixed(2);
    updated.totalUpahBongkar = totalUpahBongkar.toFixed(2);
    updated.totalPembayaranSupplier = totalPembayaranSupplier.toFixed(2);

    setEditState({
      ...editState,
      [ticketId]: updated,
    });
  };

  // Save pricing for a single ticket
  const savePricing = async (ticketId: string) => {
    const state = editState[ticketId];
    if (!state) return;

    setSaving(ticketId);
    try {
      const payload = {
        id: ticketId,
        hargaPerKg: parseFloat(state.hargaPerKg),
        pphRate: parseFloat(state.pphRate) / 100, // Convert % back to decimal
        upahBongkarPerKg: parseFloat(state.upahBongkarPerKg),
      };

      const res = await fetch("/api/pt-pks/timbangan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json()) as {
        success: boolean;
        message?: string;
      };

      if (result.success) {
        toast.success("Harga berhasil disimpan");
        await fetchTickets(); // Refresh data
      } else {
        toast.error("Gagal menyimpan harga");
      }
    } catch (error) {
      toast.error("Error saat menyimpan");
      console.error(error);
    } finally {
      setSaving(null);
    }
  };

  const exportToExcel = () => {
    if (tickets.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    // Prepare data for export - ALL columns from database
    const exportData = tickets.map((ticket) => {
      const state = editState[ticket.id];
      return {
        "No. Seri": ticket.noSeri,
        "Plat Nomor": ticket.vehicle?.plateNo ?? "-",
        "Nama Relasi": ticket.supplier?.namaPemilik ?? "-",
        "Produk": ticket.item?.name ?? "-",
        "Berat Timbang": ticket.timbang1 ?? 0,
        "Berat Timbang 2": ticket.timbang2 ?? 0,
        "Netto1": ticket.netto1 ?? 0,
        "Berat Pot (%)": ticket.potPercent ?? 0,
        "Berat Pot (kg)": ticket.potKg ?? 0,
        "Berat Terima": ticket.beratTerima ?? 0,
        "Tanggal": ticket.tanggal,
        "Jam Masuk": new Date(ticket.jamMasuk).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
        "Jam Keluar": ticket.jamKeluar ? new Date(ticket.jamKeluar).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-",
        "LOKASI KEBUN": ticket.lokasiKebun ?? "-",
        "NAMA": ticket.supplier?.namaPemilik ?? "-",
        "BANK": ticket.supplier?.bankName ?? "-",
        "NO. REKENING": ticket.supplier?.bankAccountNo ?? "-",
        "Penimbang": ticket.penimbang ?? "-",
        "Harga Per Kg": state ? parseFloat(state.hargaPerKg) : 0,
        "PPh %": state ? parseFloat(state.pphRate) : 0,
        "Upah Bongkar Per Kg": state ? parseFloat(state.upahBongkarPerKg) : 0,
        "Total": state ? parseFloat(state.total) : 0,
        "Total PPh": state ? parseFloat(state.totalPph) : 0,
        "Total Upah Bongkar": state ? parseFloat(state.totalUpahBongkar) : 0,
        "Pembayaran Supplier": state ? parseFloat(state.totalPembayaranSupplier) : 0,
        "Status": ticket.status,
      };
    });

    // Calculate totals
    const totals = {
      "No. Seri": "TOTAL",
      "Plat Nomor": "",
      "Nama Relasi": "",
      "Produk": "",
      "Berat Timbang": exportData.reduce((sum, row) => sum + (Number(row["Berat Timbang"]) || 0), 0),
      "Berat Timbang 2": exportData.reduce((sum, row) => sum + (Number(row["Berat Timbang 2"]) || 0), 0),
      "Netto1": exportData.reduce((sum, row) => sum + (Number(row["Netto1"]) || 0), 0),
      "Berat Pot (%)": "",
      "Berat Pot (kg)": exportData.reduce((sum, row) => sum + (Number(row["Berat Pot (kg)"]) || 0), 0),
      "Berat Terima": exportData.reduce((sum, row) => sum + (Number(row["Berat Terima"]) || 0), 0),
      "Tanggal": "",
      "Jam Masuk": "",
      "Jam Keluar": "",
      "LOKASI KEBUN": "",
      "NAMA": "",
      "BANK": "",
      "NO. REKENING": "",
      "Penimbang": "",
      "Harga Per Kg": "",
      "PPh %": "",
      "Upah Bongkar Per Kg": "",
      "Total": exportData.reduce((sum, row) => sum + (Number(row["Total"]) || 0), 0),
      "Total PPh": exportData.reduce((sum, row) => sum + (Number(row["Total PPh"]) || 0), 0),
      "Total Upah Bongkar": exportData.reduce((sum, row) => sum + (Number(row["Total Upah Bongkar"]) || 0), 0),
      "Pembayaran Supplier": exportData.reduce((sum, row) => sum + (Number(row["Pembayaran Supplier"]) || 0), 0),
      "Status": "",
    };

    // Add totals row
    const dataWithTotals = [...exportData, totals];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataWithTotals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timbangan");

    // Auto-size columns
    const maxWidth = Object.keys(exportData[0] ?? {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...dataWithTotals.map((row) => String(row[key as keyof typeof row] ?? "").length)
      );
      return { wch: Math.min(maxLen + 2, 20) };
    });
    worksheet["!cols"] = maxWidth;

    // Style the total row (last row) - make it bold
    const lastRowIndex = exportData.length + 1; // +1 for header
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
    
    // Generate filename with date and status filter
    const today = new Date().toISOString().split("T")[0];
    const statusSuffix = statusFilter !== "ALL" ? `-${statusFilter.toLowerCase()}` : "";
    const filename = `timbangan${statusSuffix}-${today}.xlsx`;

    XLSX.writeFile(workbook, filename);
    toast.success(`Data berhasil diexport! (${tickets.length} rows + Total)`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "APPROVED":
        return <Badge variant="secondary">Approved</Badge>;
      case "POSTED":
        return <Badge variant="default">Posted</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Alert>
        <AlertDescription>Memuat data...</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal Mulai</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Pilih tanggal"}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal Akhir</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
            </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="POSTED">Posted</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="space-y-2">
          <label className="text-sm font-medium opacity-0">Action</label>
          <div className="flex gap-2">
            <Button onClick={fetchTickets} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={exportToExcel} 
              variant="outline"
              disabled={tickets.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>
              </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">No. Seri</TableHead>
              <TableHead className="w-[110px]">Tanggal</TableHead>
              <TableHead className="w-[100px]">Plat No</TableHead>
              <TableHead className="w-[180px]">Supplier</TableHead>
              <TableHead className="w-[150px]">Produk</TableHead>
              <TableHead className="w-[120px] text-right">Berat Terima</TableHead>
              <TableHead className="w-[130px]">Harga/Kg</TableHead>
              <TableHead className="w-[130px]">Upah Bongkar/Kg</TableHead>
              <TableHead className="w-[100px]">PPh %</TableHead>
              <TableHead className="w-[140px] text-right">Total</TableHead>
              <TableHead className="w-[140px] text-right">Total PPh</TableHead>
              <TableHead className="w-[140px] text-right">Total Upah</TableHead>
              <TableHead className="w-[160px] text-right">Pembayaran Supplier</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
            {tickets.length === 0 ? (
                    <TableRow>
                <TableCell colSpan={15} className="text-center text-muted-foreground">
                  Tidak ada data tiket. Buat tiket di menu PB Harian terlebih dahulu.
                      </TableCell>
                    </TableRow>
                  ) : (
              tickets.map((ticket) => {
                const state = editState[ticket.id];
                if (!state) return null;

                const isEditable = ticket.status === "DRAFT";
                const isSaving = saving === ticket.id;

                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.noSeri}
                    </TableCell>
                    <TableCell>{ticket.tanggal}</TableCell>
                    <TableCell>{ticket.vehicle?.plateNo ?? "-"}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {ticket.supplier?.namaPemilik ?? "-"}
                        </div>
                        {ticket.supplier?.bankName && (
                          <div className="text-xs text-muted-foreground">
                            {ticket.supplier.bankName} - {ticket.supplier.bankAccountNo}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.item?.name ?? "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {ticket.beratTerima.toLocaleString()} kg
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={state.hargaPerKg}
                        onChange={(e) =>
                          updatePricing(ticket.id, "hargaPerKg", e.target.value)
                        }
                        disabled={!isEditable}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={state.upahBongkarPerKg}
                        onChange={(e) =>
                          updatePricing(
                            ticket.id,
                            "upahBongkarPerKg",
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={state.pphRate}
                        onChange={(e) =>
                          updatePricing(ticket.id, "pphRate", e.target.value)
                        }
                        disabled={!isEditable}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(parseFloat(state.total))}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(parseFloat(state.totalPph))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(parseFloat(state.totalUpahBongkar))}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(parseFloat(state.totalPembayaranSupplier))}
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {isEditable && (
                        <Button
                          onClick={() => void savePricing(ticket.id)}
                          disabled={isSaving}
                          size="sm"
                        >
                          {isSaving ? (
                            "..."
                          ) : (
                            <>
                              <Save className="mr-1 h-3 w-3" />
                              Simpan
                            </>
                          )}
                        </Button>
                      )}
                      {ticket.status === "POSTED" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                          </TableCell>
                      </TableRow>
                );
              })
                  )}
                </TableBody>
              </Table>
            </div>

      {/* Summary */}
      {tickets.length > 0 && (
        <div className="flex justify-end">
          <div className="w-96 space-y-2 rounded-lg border bg-muted/50 p-4">
            <div className="flex justify-between text-sm">
              <span>Total Tiket:</span>
              <span className="font-semibold">{tickets.length}</span>
                </div>
            <div className="flex justify-between text-sm">
              <span>Total Berat:</span>
              <span className="font-semibold">
                {tickets.reduce((sum, t) => sum + t.beratTerima, 0).toLocaleString()} kg
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total Pembayaran:</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(
                  tickets.reduce(
                    (sum, t) => sum + t.totalPembayaranSupplier,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
