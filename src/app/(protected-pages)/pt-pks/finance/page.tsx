import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function PTPKSFinancePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Finance PT PKS"
        text="Manajemen keuangan dan akuntansi PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Manajemen Keuangan</h3>
          <p className="text-muted-foreground">
            Halaman untuk mengelola laporan keuangan, budget, cash flow, dan analisis finansial PT PKS akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
