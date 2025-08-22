import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function AbsensiLaporanPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Laporan Absensi"
        text="Laporan dan analisis kehadiran karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Laporan Kehadiran</h3>
          <p className="text-muted-foreground">
            Halaman untuk melihat laporan dan statistik absensi karyawan akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
