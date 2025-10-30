"use client";

/**
 * Timbangan Table - Pricing Input Table
 * Phase 2: Input harga, PPh, upah bongkar
 */

import { useState, useEffect } from "react";
import { Save, RefreshCw, Filter, CheckCircle2 } from "lucide-react";
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
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { toast } from "sonner";
import { formatCurrency } from "~/lib/utils";

interface Ticket {
  id: string;
  noSeri: string;
  tanggal: string;
  beratTerima: number;
  status: "DRAFT" | "APPROVED" | "POSTED";
  supplier?: {
    namaPemilik: string;
    bankName: string | null;
    bankAccountNo: string | null;
  };
  item?: {
    name: string;
  };
  vehicle?: {
    plateNo: string;
  };
  // Editable pricing fields
  hargaPerKg: number;
  pphRate: number;
  upahBongkarPerKg: number;
  // Calculated fields
  total: number;
  totalPph: number;
  totalUpahBongkar: number;
  totalPembayaranSupplier: number;
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("DRAFT");

  // Fetch tickets
  useEffect(() => {
    void fetchTickets();
  }, [startDate, endDate, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ companyId });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
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
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Tanggal Mulai</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Tanggal Akhir</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
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
        <Button onClick={fetchTickets} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
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
