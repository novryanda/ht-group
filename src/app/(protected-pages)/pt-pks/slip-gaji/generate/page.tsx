import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function SlipGajiGeneratePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Generate Slip Gaji"
        text="Generate dan cetak slip gaji karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Generate Slip Gaji</h3>
          <p className="text-muted-foreground">
            Halaman untuk generate slip gaji bulanan, perhitungan gaji pokok, tunjangan, potongan, dan lembur akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
