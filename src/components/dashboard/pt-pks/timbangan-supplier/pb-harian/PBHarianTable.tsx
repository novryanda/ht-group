"use client";

/**
 * PB Harian Table - Inline Editable Table with List View
 * Phase 1: Weighbridge data entry
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, RefreshCw, CalendarIcon, Eye, Download } from "lucide-react";
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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

interface RowData {
  id: string;
  noSeri: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  vehicleId: string;
  supplierId: string;
  itemId: string;
  timbang1: string;
  timbang2: string;
  netto1: string;
  potPercent: string;
  potKg: string;
  beratTerima: string;
  lokasiKebun: string;
  penimbang: string;
}

// Sesuaikan dengan WeighbridgeTicketDTO
interface SavedTicket {
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

interface Vehicle {
  id: string;
  plateNo: string;
  type: string;
}

interface Supplier {
  id: string;
  namaPemilik: string;
  alamatRampPeron: string | null;
}

interface Item {
  id: string;
  name: string;
  sku: string;
}

export function PBHarianTable({ companyId }: { companyId: string }) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    void fetchLookups();
    void fetchSavedTickets();
  }, []);

  useEffect(() => {
    void fetchSavedTickets();
  }, [startDate, endDate]);

  const fetchLookups = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, suppliersRes, itemsRes] = await Promise.all([
        fetch("/api/pt-pks/timbangan/lookups?type=vehicles"),
        fetch("/api/pt-pks/timbangan/lookups?type=suppliers"),
        fetch("/api/pt-pks/timbangan/lookups?type=items"),
      ]);

      const vehiclesData = (await vehiclesRes.json()) as { data: Vehicle[] };
      const suppliersData = (await suppliersRes.json()) as { data: Supplier[] };
      const itemsData = (await itemsRes.json()) as { data: Item[] };

      setVehicles(vehiclesData.data ?? []);
      setSuppliers(suppliersData.data ?? []);
      setItems(itemsData.data ?? []);
    } catch (error) {
      toast.error("Gagal memuat data dropdown");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedTickets = async () => {
    try {
      const params = new URLSearchParams({ companyId });
      if (startDate) params.set("startDate", format(startDate, "yyyy-MM-dd"));
      if (endDate) params.set("endDate", format(endDate, "yyyy-MM-dd"));

      const res = await fetch(`/api/pt-pks/pb-harian?${params.toString()}`);
      const data = (await res.json()) as { success: boolean; data: SavedTicket[] };

      if (data.success && data.data) {
        setSavedTickets(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data tersimpan:", error);
    }
  };

  const addRow = async () => {
    // Gunakan startDate filter jika ada, jika tidak pakai hari ini
  const tanggalBaru = startDate ? format(startDate, "yyyy-MM-dd") : new Date().toISOString().split("T")[0] || "";
    const now = new Date().toISOString().slice(0, 16);
    let autoNoSeri = "";
    try {
      toast.loading("Mengambil nomor seri...");
      const res = await fetch(`/api/pt-pks/timbangan/lookups?type=noSeri&companyId=${companyId}&tanggal=${tanggalBaru}`);
      const data = await res.json();
      if (data.success && data.data?.noSeri) {
        autoNoSeri = data.data.noSeri;
      } else {
        throw new Error(data.error || "Gagal generate nomor seri");
      }
    } catch (err) {
      toast.error("Gagal mengambil nomor seri: " + (err instanceof Error ? err.message : String(err)));
      return;
    } finally {
      toast.dismiss();
    }

    const newRow: RowData = {
      id: `temp-${Date.now()}`,
      noSeri: autoNoSeri,
      tanggal: tanggalBaru,
      jamMasuk: now,
      jamKeluar: "",
      vehicleId: "",
      supplierId: "",
      itemId: "",
      timbang1: "",
      timbang2: "",
      netto1: "0",
      potPercent: "0",
      potKg: "0",
      beratTerima: "0",
      lokasiKebun: "",
      penimbang: "",
    };

    setRows([...rows, newRow]);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        if (field === "supplierId") {
          const supplier = suppliers.find((s) => s.id === value);
          if (supplier) {
            updated.lokasiKebun = supplier.alamatRampPeron ?? "";
          }
        }

        if (field === "timbang1" || field === "timbang2" || field === "potPercent") {
          const t1 = parseFloat(updated.timbang1) || 0;
          const t2 = parseFloat(updated.timbang2) || 0;
          const potPct = parseFloat(updated.potPercent) || 0;

          const netto1 = Math.abs(t1 - t2);
          updated.netto1 = netto1.toFixed(2);

          const potKg = netto1 * potPct;
          updated.potKg = potKg.toFixed(2);

          const beratTerima = netto1 - potKg;
          updated.beratTerima = beratTerima.toFixed(2);
        }

        return updated;
      })
    );
  };

  const validateRow = (row: RowData): string[] => {
    const errors: string[] = [];

    if (!row.noSeri) errors.push("No. Seri wajib diisi");
    if (!row.tanggal) errors.push("Tanggal wajib diisi");
    if (!row.jamMasuk) errors.push("Jam Masuk wajib diisi");
    if (!row.vehicleId) errors.push("Kendaraan wajib dipilih");
    if (!row.supplierId) errors.push("Supplier wajib dipilih");
    if (!row.itemId) errors.push("Produk wajib dipilih");
    if (!row.timbang1 || parseFloat(row.timbang1) <= 0)
      errors.push("Timbang 1 harus > 0");
    if (!row.timbang2 || parseFloat(row.timbang2) <= 0)
      errors.push("Timbang 2 harus > 0");

    return errors;
  };

  const saveAll = async () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk disimpan");
      return;
    }

    const allErrors: string[] = [];
    rows.forEach((row, idx) => {
      const errors = validateRow(row);
      if (errors.length > 0) {
        allErrors.push(`Baris ${idx + 1}: ${errors.join(", ")}`);
      }
    });

    if (allErrors.length > 0) {
      toast.error("Validasi gagal", {
        description: allErrors.join(" | "),
      });
      return;
    }

    setSaving(true);
    try {
      const tickets = rows.map((row) => ({
        companyId,
        noSeri: row.noSeri,
        vehicleId: row.vehicleId,
        supplierId: row.supplierId,
        itemId: row.itemId,
        tanggal: row.tanggal,
        jamMasuk: row.jamMasuk,
        jamKeluar: row.jamKeluar || null,
        timbang1: parseFloat(row.timbang1),
        timbang2: parseFloat(row.timbang2),
        netto1: parseFloat(row.netto1),
        potPercent: parseFloat(row.potPercent),
        potKg: parseFloat(row.potKg),
        beratTerima: parseFloat(row.beratTerima),
        lokasiKebun: row.lokasiKebun || null,
        penimbang: row.penimbang || null,
      }));

      const res = await fetch("/api/pt-pks/pb-harian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets }),
      });

      const result = (await res.json()) as {
        success: boolean;
        data?: { success: number; failed: number };
        message?: string;
      };

      if (result.success) {
        toast.success(result.message ?? "Berhasil menyimpan");
        setRows([]);
        setShowForm(false);
        await fetchSavedTickets();
      } else {
        toast.error("Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Error saat menyimpan");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = () => {
    if (savedTickets.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    // Prepare data for export - ALL columns from database except pricing
    const exportData = savedTickets.map((ticket) => ({
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
      "Status": ticket.status,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PB Harian");

    // Auto-size columns
    const maxWidth = Object.keys(exportData[0] ?? {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key as keyof typeof row] ?? "").length)
      );
      return { wch: Math.min(maxLen + 2, 20) };
    });
    worksheet["!cols"] = maxWidth;

    // Generate filename with date
    const today = new Date().toISOString().split("T")[0];
    const filename = `pb-harian-${today}.xlsx`;

    XLSX.writeFile(workbook, filename);
    toast.success(`Data berhasil diexport! (${savedTickets.length} rows)`);
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
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? <Eye className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Lihat Data" : "Input Baru"}
          </Button>
          <Button
            onClick={exportToExcel}
            size="sm"
            variant="outline"
            disabled={savedTickets.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          {showForm && (
            <Button
              onClick={saveAll}
              disabled={rows.length === 0 || saving}
              size="sm"
              variant="default"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Menyimpan..." : `Simpan Semua (${rows.length})`}
            </Button>
          )}
          </div>
        
        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Dari Tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Sampai Tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={fetchSavedTickets} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Form or List View */}
      {showForm ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Form Input</h3>
            <Button onClick={addRow} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Baris
          </Button>
        </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                  <TableHead className="w-[150px]">No. Seri</TableHead>
                  <TableHead className="w-[140px]">Tanggal</TableHead>
                  <TableHead className="w-[150px]">Jam Masuk</TableHead>
                  <TableHead className="w-[150px]">Jam Keluar</TableHead>
                  <TableHead className="w-[180px]">Kendaraan</TableHead>
                  <TableHead className="w-[200px]">Supplier</TableHead>
                  <TableHead className="w-[180px]">Produk</TableHead>
                  <TableHead className="w-[120px]">Timbang 1</TableHead>
                  <TableHead className="w-[120px]">Timbang 2</TableHead>
                  <TableHead className="w-[120px]">Netto 1</TableHead>
                  <TableHead className="w-[100px]">Pot %</TableHead>
                  <TableHead className="w-[120px]">Pot Kg</TableHead>
                  <TableHead className="w-[140px]">Berat Terima</TableHead>
                  <TableHead className="w-[180px]">Lokasi Kebun</TableHead>
                  <TableHead className="w-[150px]">Penimbang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center text-muted-foreground">
                      Klik "Tambah Baris" untuk mulai input.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Button
                          onClick={() => deleteRow(row.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.noSeri}
                          onChange={(e) => updateRow(row.id, "noSeri", e.target.value)}
                          placeholder="YYYYMMDD-###"
                        />
                      </TableCell>
                      <TableCell>
            <Input
              type="date"
                          value={row.tanggal}
                          onChange={(e) => updateRow(row.id, "tanggal", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="datetime-local"
                          value={row.jamMasuk}
                          onChange={(e) => updateRow(row.id, "jamMasuk", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
              <Input
                          type="datetime-local"
                          value={row.jamKeluar}
                          onChange={(e) => updateRow(row.id, "jamKeluar", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.vehicleId}
                          onValueChange={(val) => updateRow(row.id, "vehicleId", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kendaraan" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.plateNo} ({v.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.supplierId}
                          onValueChange={(val) => updateRow(row.id, "supplierId", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.namaPemilik}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
            <Select
                          value={row.itemId}
                          onValueChange={(val) => updateRow(row.id, "itemId", val)}
            >
              <SelectTrigger>
                            <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                            {items.map((i) => (
                              <SelectItem key={i.id} value={i.id}>
                                {i.name}
                              </SelectItem>
                            ))}
              </SelectContent>
            </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.timbang1}
                          onChange={(e) => updateRow(row.id, "timbang1", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.timbang2}
                          onChange={(e) => updateRow(row.id, "timbang2", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={row.netto1} readOnly className="bg-muted" />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={row.potPercent}
                          onChange={(e) => updateRow(row.id, "potPercent", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={row.potKg} readOnly className="bg-muted" />
                      </TableCell>
                      <TableCell>
                        <Input value={row.beratTerima} readOnly className="bg-muted font-semibold" />
                      </TableCell>
                      <TableCell>
                        <Input value={row.lokasiKebun} readOnly className="bg-muted" />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.penimbang}
                          onChange={(e) => updateRow(row.id, "penimbang", e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold">Data Tersimpan</h3>
          <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>No. Seri</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Berat Terima (kg)</TableHead>
                  <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {savedTickets.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Belum ada data. Klik "Input Baru" untuk membuat tiket.
                      </TableCell>
                    </TableRow>
                  ) : (
                  savedTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono">{ticket.noSeri}</TableCell>
                      <TableCell>{ticket.tanggal}</TableCell>
                      <TableCell>{new Date(ticket.jamMasuk).toLocaleString("id-ID")}</TableCell>
                      <TableCell>{ticket.vehicle?.plateNo ?? "-"}</TableCell>
                      <TableCell>{ticket.supplier?.namaPemilik ?? "-"}</TableCell>
                      <TableCell>{ticket.item?.name ?? "-"}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {ticket.beratTerima.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === "DRAFT" ? "outline" : "default"}>
                          {ticket.status}
                        </Badge>
                          </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
        </>
      )}
    </div>
  );
}
