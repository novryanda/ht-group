import { IncomeStatementTable } from "~/components/dashboard/pt-pks/laporan/keuangan/laporan-keuangan/income-statement-table";

export default function LaporanKeuanganPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laporan Laba Rugi</h2>
        <p className="text-muted-foreground">
          Laporan kinerja keuangan perusahaan dalam periode tertentu
        </p>
      </div>

      <IncomeStatementTable />
    </div>
  );
}
