"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, RefreshCw } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type {
  AccountDTO,
  SystemAccountMapSetInput,
} from "~/server/types/pt-pks/account";

type SystemAccountKey = SystemAccountMapSetInput["mappings"][number]["key"];

interface SystemMappingFormProps {
  companyId: string;
  disabled?: boolean;
}

const SYSTEM_ACCOUNT_KEYS: Array<{
  key: SystemAccountKey;
  label: string;
  description: string;
}> = [
  { key: "TBS_PURCHASE", label: "Pembelian TBS", description: "Akun pembelian TBS dari pemasok" },
  { key: "INVENTORY_TBS", label: "Persediaan TBS", description: "Persediaan bahan baku TBS" },
  { key: "AP_SUPPLIER_TBS", label: "Hutang Supplier TBS", description: "Kewajiban pembayaran pemasok TBS" },
  { key: "UNLOADING_EXPENSE_SPTI", label: "Biaya Bongkar SPTI", description: "Biaya bongkar SPTI" },
  { key: "UNLOADING_EXPENSE_SPLO", label: "Biaya Bongkar SPLO", description: "Biaya bongkar SPLO" },
  { key: "SALES_CPO", label: "Penjualan CPO", description: "Pendapatan penjualan CPO" },
  { key: "SALES_KERNEL", label: "Penjualan Kernel", description: "Pendapatan penjualan kernel" },
  { key: "INVENTORY_CPO", label: "Persediaan CPO", description: "Persediaan CPO" },
  { key: "INVENTORY_KERNEL", label: "Persediaan Kernel", description: "Persediaan kernel" },
  { key: "COGS_CPO", label: "HPP CPO", description: "Harga pokok penjualan CPO" },
  { key: "COGS_KERNEL", label: "HPP Kernel", description: "Harga pokok penjualan kernel" },
  { key: "CASH_DEFAULT", label: "Kas Default", description: "Akun kas default untuk transaksi" },
  { key: "BANK_DEFAULT", label: "Bank Default", description: "Akun bank default" },
  { key: "PPN_KELUARAN", label: "PPN Keluaran", description: "Akun PPN Keluaran" },
  { key: "PPN_MASUKAN", label: "PPN Masukan", description: "Akun PPN Masukan" },
  { key: "PPH22_DEFAULT", label: "PPh22 Default", description: "Akun pemotongan PPh 22" },
  { key: "PPH23_DEFAULT", label: "PPh23 Default", description: "Akun pemotongan PPh 23" },
];

const EMPTY_ACCOUNT_VALUE = "__EMPTY_MAPPING__";

export function SystemMappingForm({ companyId, disabled }: SystemMappingFormProps) {
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [mappings, setMappings] = useState<Record<SystemAccountKey, string | null>>(() =>
    Object.fromEntries(SYSTEM_ACCOUNT_KEYS.map(({ key }) => [key, null])) as Record<
      SystemAccountKey,
      string | null
    >,
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return accounts;
    const term = search.trim().toLowerCase();
    return accounts.filter(
      (account) =>
        account.code.toLowerCase().includes(term) || account.name.toLowerCase().includes(term),
    );
  }, [accounts, search]);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [mappingRes, accountsRes] = await Promise.all([
          fetch(`/api/pt-pks/daftar-akun/system-accounts?companyId=${companyId}`),
          fetch(`/api/pt-pks/daftar-akun?companyId=${companyId}&page=1&pageSize=500`),
        ]);

        if (!mappingRes.ok) {
          const err = await mappingRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Gagal memuat mapping akun");
        }

        if (!accountsRes.ok) {
          const err = await accountsRes.json().catch(() => ({}));
          throw new Error(err?.error ?? "Gagal memuat daftar akun");
        }

        const mappingJson = await mappingRes.json();
        const accountsJson = await accountsRes.json();

        if (cancelled) return;

        const mapped: Record<SystemAccountKey, string | null> = Object.fromEntries(
          SYSTEM_ACCOUNT_KEYS.map(({ key }) => {
            const existing = (mappingJson.data ?? []).find(
              (item: any) => item.key === key,
            );
            return [key, existing?.accountId ?? null];
          }),
        ) as Record<SystemAccountKey, string | null>;

        const apiAccounts = (accountsJson.items ?? accountsJson.data ?? []) as AccountDTO[];
        const mappingAccounts = ((mappingJson.data ?? [])
          .map((item: any) => item.account)
          .filter(Boolean) ?? []) as AccountDTO[];

        const dedup = new Map<string, AccountDTO>();
        [...apiAccounts, ...mappingAccounts].forEach((account) => {
          if (!account) return;
          dedup.set(account.id, {
            ...account,
            children: account.children ?? [],
          });
        });

        const sortedAccounts = Array.from(dedup.values()).sort((a, b) =>
          a.code.localeCompare(b.code),
        );

        setMappings(mapped);
        setAccounts(sortedAccounts);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Gagal memuat data mapping");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const handleRefreshAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pt-pks/daftar-akun?companyId=${companyId}&page=1&pageSize=500`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Gagal memuat akun");
      }
      const json = await res.json();
      const refreshed = ((json.items ?? json.data) ?? []) as AccountDTO[];
      setAccounts(
        [...refreshed].sort((a, b) => a.code.localeCompare(b.code)),
      );
      toast.success("Daftar akun berhasil diperbarui");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat akun");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const payload: SystemAccountMapSetInput = {
      companyId,
      mappings: Object.entries(mappings)
        .filter(([, accountId]) => !!accountId)
        .map(([key, accountId]) => ({
          key: key as SystemAccountKey,
          accountId: accountId as string,
        })),
    };

    setIsSaving(true);
    try {
      const res = await fetch(`/api/pt-pks/daftar-akun/system-accounts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Gagal menyimpan mapping akun");
      }

      toast.success("Mapping akun berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan mapping akun");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>System Account Mapping</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hubungkan akun bisnis ke key sistem yang digunakan modul lainnya.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshAccounts}
              disabled={isLoading || disabled}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Muat ulang akun
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || disabled || isLoading}
            >
              {isSaving ? "Menyimpan..." : "Simpan Mapping"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari akun berdasarkan kode atau nama..."
            className="border-0 shadow-none focus-visible:ring-0"
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-4">
          {SYSTEM_ACCOUNT_KEYS.map(({ key, label, description }) => {
            const selectedAccount = accounts.find((account) => account.id === mappings[key]);
            return (
              <div
                key={key}
                className="flex flex-col gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  {selectedAccount && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {selectedAccount.code} — {selectedAccount.name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:min-w-[320px]">
                  <Select
                    value={mappings[key] ?? EMPTY_ACCOUNT_VALUE}
                    onValueChange={(value) =>
                      setMappings((prev) => ({
                        ...prev,
                        [key]: value === EMPTY_ACCOUNT_VALUE ? null : value,
                      }))
                    }
                    disabled={isLoading || disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoading ? "Memuat akun..." : "Pilih akun"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EMPTY_ACCOUNT_VALUE}>Kosongkan</SelectItem>
                      {filteredAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <span className="font-mono mr-2 text-xs">{account.code}</span>
                          <span>{account.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
