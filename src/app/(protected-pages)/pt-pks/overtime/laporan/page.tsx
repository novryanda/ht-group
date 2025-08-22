import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function OvertimeLaporanPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Laporan Overtime"
        text="Laporan dan analisis data lembur karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Laporan Lembur</h3>
          <p className="text-muted-foreground">
            Halaman untuk melihat laporan overtime bulanan, analisis biaya lembur, dan statistik produktivitas akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
