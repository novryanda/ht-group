"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { FiscalPeriodDTO } from "~/server/types/pt-pks/fiscal-period";
import { FiscalPeriodTable } from "./fiscal-period-table";
import { FiscalPeriodFormDialog } from "./fiscal-period-form-dialog";

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

export function FiscalPeriodPageClient({ companyId, companyName, userRole }: Props) {
  const [periods, setPeriods] = useState<FiscalPeriodDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<FiscalPeriodDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = userRole === "PT_PKS_ADMIN" || userRole === "GL_ACCOUNTANT";

  const fetchPeriods = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/pt-pks/finance/fiscal-periods?companyId=${companyId}`,
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal memuat periode fiskal");
      }
      setPeriods(json.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat periode fiskal");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void fetchPeriods();
  }, [fetchPeriods]);

  async function handleCreate(values: { year: number; month: number; startDate: string; endDate: string }) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pt-pks/finance/fiscal-periods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, companyId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal membuat periode");
      }
      toast.success("Periode fiskal berhasil dibuat");
      setFormOpen(false);
      void fetchPeriods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat periode");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(values: { startDate: string; endDate: string; isClosed?: boolean }) {
    if (!selectedPeriod) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pt-pks/finance/fiscal-periods/${selectedPeriod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal memperbarui periode");
      }
      toast.success("Periode fiskal diperbarui");
      setEditOpen(false);
      setSelectedPeriod(null);
      void fetchPeriods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui periode");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(period: FiscalPeriodDTO) {
    if (!canManage) return;
    try {
      const res = await fetch(`/api/pt-pks/finance/fiscal-periods/${period.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isClosed: !period.isClosed }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal mengubah status periode");
      }
      toast.success(`Periode ${period.isClosed ? "dibuka" : "ditutup"} berhasil`);
      void fetchPeriods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui status");
    }
  }

  async function handleDelete(period: FiscalPeriodDTO) {
    if (!canManage) return;
    if (period.isClosed) {
      toast.error("Periode yang sudah ditutup tidak dapat dihapus");
      return;
    }
    try {
      const res = await fetch(`/api/pt-pks/finance/fiscal-periods/${period.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gagal menghapus periode");
      }
      toast.success("Periode fiskal dihapus");
      void fetchPeriods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus periode");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Periode Fiskal PT PKS</CardTitle>
            <CardDescription>Kelola periode fiskal untuk {companyName}.</CardDescription>
          </div>
          {canManage ? (
            <Button onClick={() => setFormOpen(true)}>Tambah Periode</Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <FiscalPeriodTable
            periods={periods}
            onEdit={(period) => {
              setSelectedPeriod(period);
              setEditOpen(true);
            }}
            onToggleClosed={handleToggle}
            onDelete={handleDelete}
            isLoading={isLoading}
            canManage={canManage}
          />
        </CardContent>
      </Card>

      {canManage ? (
        <>
          <FiscalPeriodFormDialog
            mode="create"
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
          />

          <FiscalPeriodFormDialog
            mode="edit"
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setSelectedPeriod(null);
            }}
            onSubmit={handleUpdate}
            defaultValues={
              selectedPeriod
                ? {
                    startDate: selectedPeriod.startDate,
                    endDate: selectedPeriod.endDate,
                    isClosed: selectedPeriod.isClosed,
                  }
                : undefined
            }
            isSubmitting={isSubmitting}
          />
        </>
      ) : null}
    </div>
  );
}
