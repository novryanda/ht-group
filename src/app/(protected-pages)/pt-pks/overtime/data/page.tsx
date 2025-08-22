import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function OvertimeDataPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Data Overtime"
        text="Kelola dan pantau data lembur karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Data Lembur Karyawan</h3>
          <p className="text-muted-foreground">
            Halaman untuk mengelola data overtime karyawan, input jam lembur, dan perhitungan upah lembur akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
