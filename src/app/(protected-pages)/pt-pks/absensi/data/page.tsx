import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function AbsensiDataPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Data Absensi"
        text="Kelola dan pantau data kehadiran karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Data Absensi Karyawan</h3>
          <p className="text-muted-foreground">
            Halaman untuk mengelola data absensi karyawan akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
