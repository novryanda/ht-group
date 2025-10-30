"use client";

/**
 * PB Harian Table - Inline Editable Table
 * Phase 1: Weighbridge data entry
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { toast } from "sonner";

interface RowData {
  id: string; // temp ID for UI only
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

interface Vehicle {
  id: string;
  plateNo: string;
  type: string;
}

interface Supplier {
  id: string;
  namaPemilik: string;
  lokasiKebun: string | null;
  bankName: string | null;
  bankAccountNo: string | null;
}

interface Item {
  id: string;
  name: string;
  sku: string;
}

export function PBHarianTable({ companyId }: { companyId: string }) {
  const [rows, setRows] = useState<RowData[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch lookup data
  useEffect(() => {
    void fetchLookups();
  }, []);

  const fetchLookups = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, suppliersRes, itemsRes] = await Promise.all([
        fetch("/api/pt-pks/timbangan/lookups?type=vehicles"),
        fetch("/api/pt-pks/timbangan/lookups?type=suppliers"),
        fetch("/api/pt-pks/timbangan/lookups?type=items"),
      ]);

      const vehiclesData = (await vehiclesRes.json()) as {
        data: Vehicle[];
      };
      const suppliersData = (await suppliersRes.json()) as {
        data: Supplier[];
      };
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

  // Add new empty row
  const addRow = () => {
    const today = new Date().toISOString().split("T")?.[0] ?? "";
    const now = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

    const newRow: RowData = {
      id: `temp-${Date.now()}`,
      noSeri: "",
      tanggal: today,
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

  // Delete row
  const deleteRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  // Update row field
  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        // Auto-fill lokasi kebun when supplier selected
        if (field === "supplierId") {
          const supplier = suppliers.find((s) => s.id === value);
          if (supplier) {
            updated.lokasiKebun = supplier.lokasiKebun ?? "";
          }
        }

        // Auto-calculate when weighing fields change
        if (
          field === "timbang1" ||
          field === "timbang2" ||
          field === "potPercent"
        ) {
          const t1 = parseFloat(updated.timbang1) || 0;
          const t2 = parseFloat(updated.timbang2) || 0;
          const potPct = parseFloat(updated.potPercent) || 0;

          // Calculate netto1 = |timbang1 - timbang2|
          const netto1 = Math.abs(t1 - t2);
          updated.netto1 = netto1.toFixed(2);

          // Calculate potKg = netto1 * potPercent
          const potKg = netto1 * potPct;
          updated.potKg = potKg.toFixed(2);

          // Calculate beratTerima = netto1 - potKg
          const beratTerima = netto1 - potKg;
          updated.beratTerima = beratTerima.toFixed(2);
        }

        return updated;
      })
    );
  };

  // Generate noSeri for a row
  const generateNoSeri = async (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row?.tanggal) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }

    try {
      const res = await fetch(
        `/api/pt-pks/timbangan/lookups?type=noSeri&tanggal=${row.tanggal}&companyId=${companyId}`
      );
      const data = (await res.json()) as { data: { noSeri: string } };
      if (data.data?.noSeri) {
        updateRow(rowId, "noSeri", data.data.noSeri);
      }
    } catch (error) {
      console.error(error);
      // Fallback: generate locally
      const dateStr = row.tanggal.replace(/-/g, "");
      const seq = rows.length + 1;
      updateRow(rowId, "noSeri", `${dateStr}-${seq.toString().padStart(3, "0")}`);
    }
  };

  // Validate row
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

  // Save all rows
  const saveAll = async () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk disimpan");
      return;
    }

    // Validate all rows
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
        data?: { success: number; failed: number; errors: string[] };
        message?: string;
      };

      if (result.success) {
        toast.success(result.message ?? "Berhasil menyimpan semua tiket");
        setRows([]); // Clear rows
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
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={addRow} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Baris
          </Button>
          <Button
            onClick={saveAll}
            disabled={rows.length === 0 || saving}
            size="sm"
            variant="default"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Menyimpan..." : `Simpan Semua (${rows.length})`}
          </Button>
        </div>
        <Button onClick={fetchLookups} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Table */}
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
                  Belum ada data. Klik "Tambah Baris" untuk mulai input.
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
                    <div className="flex gap-1">
                      <Input
                        value={row.noSeri}
                        onChange={(e) =>
                          updateRow(row.id, "noSeri", e.target.value)
                        }
                        placeholder="YYYYMMDD-###"
                        className="w-full"
                      />
                      <Button
                        onClick={() => void generateNoSeri(row.id)}
                        size="icon"
                        variant="outline"
                        title="Generate"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={row.tanggal}
                      onChange={(e) =>
                        updateRow(row.id, "tanggal", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="datetime-local"
                      value={row.jamMasuk}
                      onChange={(e) =>
                        updateRow(row.id, "jamMasuk", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="datetime-local"
                      value={row.jamKeluar}
                      onChange={(e) =>
                        updateRow(row.id, "jamKeluar", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.vehicleId}
                      onValueChange={(val) =>
                        updateRow(row.id, "vehicleId", val)
                      }
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
                      onValueChange={(val) =>
                        updateRow(row.id, "supplierId", val)
                      }
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
                      onChange={(e) =>
                        updateRow(row.id, "timbang1", e.target.value)
                      }
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.timbang2}
                      onChange={(e) =>
                        updateRow(row.id, "timbang2", e.target.value)
                      }
                      placeholder="0"
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
                      onChange={(e) =>
                        updateRow(row.id, "potPercent", e.target.value)
                      }
                      placeholder="0.05"
                    />
                  </TableCell>
                  <TableCell>
                    <Input value={row.potKg} readOnly className="bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.beratTerima}
                      readOnly
                      className="bg-muted font-semibold"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.lokasiKebun}
                      readOnly
                      className="bg-muted"
                      placeholder="Auto dari supplier"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.penimbang}
                      onChange={(e) =>
                        updateRow(row.id, "penimbang", e.target.value)
                      }
                      placeholder="Nama penimbang"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
