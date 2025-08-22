import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function SlipGajiDataPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Data Slip Gaji"
        text="Kelola dan arsip data slip gaji karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Arsip Slip Gaji</h3>
          <p className="text-muted-foreground">
            Halaman untuk melihat, mencari, dan mengelola arsip slip gaji karyawan yang telah digenerate akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
