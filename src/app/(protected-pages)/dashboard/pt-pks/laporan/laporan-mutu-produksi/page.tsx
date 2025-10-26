
"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { KpiCard } from "~/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/KpiCard";
import { TrendCard } from "~/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/TrendCard";
import { RowsTable } from "~/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/RowsTable";
import { FiltersBar } from "~/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/FiltersBar";
import { SheetButton } from "~/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/SheetButton";
import { val, aggregateByDate } from "~/components/dashboard/pt-pks/laporan/laporan-mutu-produksi/mutu-utils";
import type { PksMutuProduksiDto } from "~/server/types/pt-pks/mutu-produksi";

// Helper to format date as YYYY-MM-DD
function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function LaporanMutuProduksiPage() {
  const [data, setData] = useState<PksMutuProduksiDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters: last 14 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return formatDateInput(d);
  });
  const [toDate, setToDate] = useState(() => formatDateInput(new Date()));
  const [shift, setShift] = useState("all");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        shift: shift,
      });

      const response = await fetch(`/api/pt-pks/mutu-produksi?${params}`);
      const json = await response.json();

      if (!json.ok) {
        throw new Error(json.error || "Failed to fetch data");
      }

      setData(json.data || []);
    } catch (err) {
      console.error("❌ Error fetching mutu produksi:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, shift]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get latest record for KPIs
  const latestRecord = data.length > 0 ? data[data.length - 1] : null;

  // Extract KPI values
  const kpiData = {
    tbsDiolah: val(latestRecord?.payload, "A_TBS_tbs_diolah_hari"),
    oer: val(latestRecord?.payload, "A_TBS_oer_hari"),
    cpoProduksi: val(latestRecord?.payload, "C_cpo_produksi_hari"),
    ffa: val(latestRecord?.payload, "C_ffa_hari"),
    moisture: val(latestRecord?.payload, "C_moisture_hari"),
    dirt: val(latestRecord?.payload, "C_dirt_hari"),
  };

  // Aggregate data for charts
  const chartData = aggregateByDate(data);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Laporan Mutu Produksi"
        text="Ringkasan mutu harian & tren."
      >
        <SheetButton />
      </DashboardHeader>

      <div className="space-y-6">
        {/* Filters */}
        <FiltersBar
          fromDate={fromDate}
          toDate={toDate}
          shift={shift}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onShiftChange={setShift}
          onRefresh={fetchData}
          isLoading={isLoading}
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <KpiCard
            label="TBS Diolah (Hari Ini)"
            value={kpiData.tbsDiolah}
            suffix=" ton"
            isLoading={isLoading}
          />
          <KpiCard
            label="% OER (Hari Ini)"
            value={kpiData.oer}
            suffix="%"
            isLoading={isLoading}
          />
          <KpiCard
            label="CPO Produksi (Hari Ini)"
            value={kpiData.cpoProduksi}
            suffix=" ton"
            isLoading={isLoading}
          />
          <KpiCard
            label="FFA (Hari Ini)"
            value={kpiData.ffa}
            suffix="%"
            isLoading={isLoading}
          />
          <KpiCard
            label="Moisture (Hari Ini)"
            value={kpiData.moisture}
            suffix="%"
            isLoading={isLoading}
          />
          <KpiCard
            label="Dirt (Hari Ini)"
            value={kpiData.dirt}
            suffix="%"
            isLoading={isLoading}
          />
        </div>

        {/* Trend Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <TrendCard
            title="Tren TBS Diolah (Hari)"
            data={chartData.tbsDiolah}
            color="#3b82f6"
            yAxisLabel="Ton"
            isLoading={isLoading}
          />
          <TrendCard
            title="Tren % OER"
            data={chartData.oer}
            color="#10b981"
            yAxisLabel="%"
            isLoading={isLoading}
          />
        </div>

        {/* Data Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Data Detail</h3>
          <RowsTable data={data} isLoading={isLoading} />
        </div>
      </div>
    </DashboardShell>
  );
}
