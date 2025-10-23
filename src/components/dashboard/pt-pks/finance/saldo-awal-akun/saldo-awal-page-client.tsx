"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { OpeningBalanceTable } from "./opening-balance-table";
import type { FiscalPeriodDTO } from "~/server/types/pt-pks/fiscal-period";
import type { OpeningBalanceEntryDTO } from "~/server/types/pt-pks/opening-balance";

type UserRole =
  | "GROUP_VIEWER"
  | "EXECUTIVE"
  | "PT_MANAGER"
  | "PT_NILO_ADMIN"
  | "PT_ZTA_ADMIN"
  | "PT_TAM_ADMIN"
  | "PT_HTK_ADMIN"
  | "PT_PKS_ADMIN"
  | "UNIT_SUPERVISOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "HR"
  | "FINANCE_AR"
  | "FINANCE_AP"
  | "GL_ACCOUNTANT";

interface Props {
  companyId: string;
  companyName: string;
  userRole: UserRole | null | undefined;
}

export function SaldoAwalPageClient({ companyId, companyName, userRole }: Props) {
  const [periods, setPeriods] = useState<FiscalPeriodDTO[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [entries, setEntries] = useState<OpeningBalanceEntryDTO[]>([]);
  const [search, setSearch] = useState("");
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [saving, setSaving] = useState(false);

  const canManage = userRole === "PT_PKS_ADMIN" || userRole === "GL_ACCOUNTANT";

  const loadPeriods = useCallback(async () => {
    setLoadingPeriods(true);
    try {
      const res = await fetch(`/api/pt-pks/finance/fiscal-periods?companyId=${companyId}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Gagal memuat periode");
      setPeriods(json.data ?? []);
      const first = json.data?.find((period: FiscalPeriodDTO) => !period.isClosed) ?? json.data?.[0];
      if (first) {
        setSelectedPeriodId(first.id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat periode fiskal");
    } finally {
      setLoadingPeriods(false);
    }
  }, [companyId]);

  const loadEntries = useCallback(
    async (periodId: string) => {
      if (!periodId) return;
      setLoadingEntries(true);
      try {
        const res = await fetch(
          `/api/pt-pks/finance/opening-balances?companyId=${companyId}&periodId=${periodId}`,
        );
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? "Gagal memuat saldo awal");

        const sanitized: OpeningBalanceEntryDTO[] = (json.data ?? []).map((item: OpeningBalanceEntryDTO) => ({
          ...item,
          debit: item.debit ?? "0",
          credit: item.credit ?? "0",
        }));
        setEntries(sanitized);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal memuat saldo awal");
        setEntries([]);
      } finally {
        setLoadingEntries(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void loadPeriods();
  }, [loadPeriods]);

  useEffect(() => {
    if (selectedPeriodId) {
      void loadEntries(selectedPeriodId);
    } else {
      setEntries([]);
    }
  }, [selectedPeriodId, loadEntries]);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const term = search.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        entry.accountCode.toLowerCase().includes(term) ||
        entry.accountName.toLowerCase().includes(term),
    );
  }, [entries, search]);

  function handleChange(accountId: string, field: "debit" | "credit", value: string) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.accountId === accountId
          ? {
              ...entry,
              [field]: value,
            }
          : entry,
      ),
    );
  }

  async function handleSave() {
    if (!selectedPeriodId) {
      toast.error("Pilih periode terlebih dahulu");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        companyId,
        periodId: selectedPeriodId,
        entries: entries.map((entry) => ({
          accountId: entry.accountId,
          debit: entry.debit && entry.debit.length > 0 ? entry.debit : "0",
          credit: entry.credit && entry.credit.length > 0 ? entry.credit : "0",
        })),
      };

      const res = await fetch(`/api/pt-pks/finance/opening-balances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal menyimpan saldo awal");
      }
      const updated = (json.data ?? []).map((item: OpeningBalanceEntryDTO) => ({
        ...item,
        debit: item.debit ?? "0",
        credit: item.credit ?? "0",
      }));
      setEntries(updated);
      toast.success("Saldo awal akun tersimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan saldo awal");
    } finally {
      setSaving(false);
    }
  }

  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saldo Awal Akun</CardTitle>
          <CardDescription>
            Atur saldo awal akun posting untuk {companyName}. Pastikan periode fiskal dipilih sebelum menyimpan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[280px,1fr] sm:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Periode Fiskal</label>
              <Select
                value={selectedPeriodId}
                onValueChange={setSelectedPeriodId}
                disabled={loadingPeriods || periods.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode fiskal" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.year}-{period.month.toString().padStart(2, "0")} ·{" "}
                      {format(new Date(period.startDate), "dd MMM yyyy")} -{" "}
                      {format(new Date(period.endDate), "dd MMM yyyy")}{" "}
                      {period.isClosed ? "(Tertutup)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cari Akun</label>
              <Input
                placeholder="Cari berdasarkan kode atau nama akun"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={loadingEntries}
              />
            </div>
          </div>

          {selectedPeriod ? (
            <div className="space-y-4">
              {!selectedPeriod.isClosed ? (
                <OpeningBalanceTable
                  entries={filteredEntries}
                  onChange={handleChange}
                  readOnly={!canManage}
                  isLoading={loadingEntries}
                />
              ) : (
                <OpeningBalanceTable
                  entries={filteredEntries}
                  onChange={() => {}}
                  readOnly
                  isLoading={loadingEntries}
                />
              )}

              {canManage ? (
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving || loadingEntries || selectedPeriod.isClosed}>
                    {saving ? "Menyimpan..." : "Simpan Saldo Awal"}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
              Pilih periode fiskal terlebih dahulu untuk melihat saldo awal.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
