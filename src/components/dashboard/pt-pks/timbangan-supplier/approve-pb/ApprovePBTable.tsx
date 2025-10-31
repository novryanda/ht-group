"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { RefreshCw, CalendarIcon, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";

type Ticket = {
  id: string;
  noSeri: string;
  tanggal: string;
  supplier?: { namaPemilik: string | null };
  item?: { name: string | null };
  beratTerima: number;
  hargaPerKg: number;
  totalPembayaranSupplier: number;
  status: "DRAFT" | "POSTED" | "APPROVED";
};

type Warehouse = {
  id: string;
  name: string;
  code: string;
};

type Supplier = {
  id: string;
  namaPemilik: string;
};

export function ApprovePBTable({ companyId }: { companyId: string }) {
  const [rows, setRows] = useState<Ticket[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [warehouseSelections, setWarehouseSelections] = useState<Record<string, string>>({});
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  
  // Filters
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [supplierFilter, setSupplierFilter] = useState<string>("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ companyId });
      if (selectedDate) {
        params.set("startDate", format(selectedDate, "yyyy-MM-dd"));
        params.set("endDate", format(selectedDate, "yyyy-MM-dd"));
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (supplierFilter && supplierFilter !== "ALL") {
        params.set("supplierId", supplierFilter);
      }
      const res = await fetch(`/api/pt-pks/approve-pb?${params.toString()}`);
      const data = (await res.json()) as { success: boolean; data: Ticket[] };
      if (data.success) setRows(data.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const res = await fetch("/api/pt-pks/material-inventory/warehouses/active");
      const data = (await res.json()) as { success: boolean; data: Warehouse[] };
      if (data.success) setWarehouses(data.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat daftar gudang");
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await fetch("/api/pt-pks/timbangan/lookups?type=suppliers");
      const data = (await res.json()) as { data: Supplier[] };
      if (data.data) setSuppliers(data.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat daftar supplier");
    }
  };

  useEffect(() => {
    void loadWarehouses();
    void loadSuppliers();
  }, []);

  useEffect(() => {
    void load();
  }, [selectedDate, statusFilter, supplierFilter, companyId]);

  const act = async (ticketId: string, approved: boolean) => {
    if (approved) {
      const warehouseId = warehouseSelections[ticketId];
      if (!warehouseId) {
        toast.error("Pilih gudang terlebih dahulu sebelum approve");
        return;
      }
    }

    setActing(ticketId);
    try {
      const res = await fetch(`/api/pt-pks/approve-pb`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ticketId, 
          approved,
          warehouseId: approved ? warehouseSelections[ticketId] : undefined,
        }),
      });
      const result = (await res.json()) as { success: boolean; message?: string };
      if (result.success) {
        toast.success(result.message ?? (approved ? "Disetujui" : "Dikembalikan"));
        // Clear warehouse selection for this ticket
        if (approved) {
          setWarehouseSelections((prev) => {
            const next = { ...prev };
            delete next[ticketId];
            return next;
          });
        }
        await load();
      } else {
        toast.error(result.message ?? "Gagal memproses");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saat memproses");
    } finally {
      setActing(null);
    }
  };

  const bulkApproveTickets = async () => {
    const selectedIds = Array.from(selectedTickets).filter((id) => {
      const ticket = rows.find((r) => r.id === id);
      return ticket?.status === "POSTED" && warehouseSelections[id];
    });

    if (selectedIds.length === 0) {
      toast.error("Pilih tiket POSTED yang sudah dipilih gudangnya untuk approve");
      return;
    }

    setBulkApproving(true);
    try {
      const res = await fetch(`/api/pt-pks/approve-pb/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketIds: selectedIds.map((id) => ({
            ticketId: id,
            warehouseId: warehouseSelections[id],
          })),
        }),
      });
      const result = (await res.json()) as { success: boolean; message?: string; data?: { success: number; failed: number } };
      if (result.success) {
        const { success, failed } = result.data ?? { success: 0, failed: 0 };
        toast.success(`${success} tiket berhasil di-approve${failed > 0 ? `, ${failed} gagal` : ""}`);
        // Clear selections
        setSelectedTickets(new Set());
        setWarehouseSelections({});
        await load();
      } else {
        toast.error(result.message ?? "Gagal bulk approve");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saat bulk approve");
    } finally {
      setBulkApproving(false);
    }
  };

  const toggleTicketSelection = (ticketId: string) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const toggleSelectAll = () => {
    const postedTickets = rows.filter((r) => r.status === "POSTED");
    if (selectedTickets.size === postedTickets.length && postedTickets.every((t) => selectedTickets.has(t.id))) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(postedTickets.map((t) => t.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
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
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Supplier</label>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Supplier</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.namaPemilik}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium opacity-0">Action</label>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button 
              onClick={bulkApproveTickets} 
              disabled={selectedTickets.size === 0 || bulkApproving}
            >
              {bulkApproving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Bulk Approve ({selectedTickets.size})
            </Button>
          </div>
        </div>
      </div>

      {rows.length === 0 && !loading && (
        <Alert>
          <AlertDescription>Tidak ada data untuk di-approve.</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedTickets.size > 0 && rows.filter((r) => r.status === "POSTED").every((r) => selectedTickets.has(r.id))}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[140px]">No. Seri</TableHead>
              <TableHead className="w-[120px]">Tanggal</TableHead>
              <TableHead className="w-[200px]">Supplier</TableHead>
              <TableHead className="w-[160px]">Produk</TableHead>
              <TableHead className="w-[140px] text-right">Berat</TableHead>
              <TableHead className="w-[140px] text-right">Harga/Kg</TableHead>
              <TableHead className="w-[180px] text-right">Pembayaran</TableHead>
              <TableHead className="w-[180px]">Gudang</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[220px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.status === "POSTED" && (
                    <Checkbox
                      checked={selectedTickets.has(r.id)}
                      onCheckedChange={() => toggleTicketSelection(r.id)}
                    />
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">{r.noSeri}</TableCell>
                <TableCell>{r.tanggal}</TableCell>
                <TableCell>{r.supplier?.namaPemilik ?? "-"}</TableCell>
                <TableCell>{r.item?.name ?? "-"}</TableCell>
                <TableCell className="text-right">{r.beratTerima.toLocaleString()} kg</TableCell>
                <TableCell className="text-right">{formatCurrency(r.hargaPerKg)}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">{formatCurrency(r.totalPembayaranSupplier)}</TableCell>
                <TableCell>
                  {r.status === "POSTED" ? (
                    <Select
                      value={warehouseSelections[r.id] ?? ""}
                      onValueChange={(value) => {
                        setWarehouseSelections((prev) => ({ ...prev, [r.id]: value }));
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Pilih gudang" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.code} - {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : r.status === "APPROVED" ? (
                    <span className="text-sm text-green-600 font-medium">✓ Approved</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === "POSTED" ? "default" : r.status === "APPROVED" ? "secondary" : "outline"}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {r.status === "POSTED" && (
                      <Button 
                        size="sm" 
                        onClick={() => void act(r.id, true)} 
                        disabled={acting === r.id || !warehouseSelections[r.id]}
                      >
                        Approve
                      </Button>
                    )}
                    {r.status === "POSTED" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => void act(r.id, false)} 
                        disabled={acting === r.id}
                      >
                        Kembalikan
                      </Button>
                    )}
                    {r.status === "APPROVED" && (
                      <span className="text-sm text-muted-foreground">Sudah disetujui</span>
                    )}
                    {r.status === "DRAFT" && (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


