import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function AbsensiSettingPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Setting Absensi"
        text="Konfigurasi pengaturan sistem absensi PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Pengaturan Sistem Absensi</h3>
          <p className="text-muted-foreground">
            Halaman untuk mengatur konfigurasi sistem absensi seperti jam kerja, hari libur, dan pengaturan lainnya akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
