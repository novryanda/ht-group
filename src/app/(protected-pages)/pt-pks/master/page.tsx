import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function PTPKSMasterPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Master Data PT PKS"
        text="Kelola data master sistem PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Master Data Management</h3>
          <p className="text-muted-foreground">
            Halaman untuk mengelola data master seperti data karyawan, jabatan, departemen, dan konfigurasi sistem PT PKS akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
