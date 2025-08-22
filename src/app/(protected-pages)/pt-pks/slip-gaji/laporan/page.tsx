import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function SlipGajiLaporanPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Laporan Payroll"
        text="Laporan dan analisis payroll karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Laporan Payroll</h3>
          <p className="text-muted-foreground">
            Halaman untuk melihat laporan payroll bulanan, analisis biaya gaji, dan ringkasan pembayaran akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
