import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function PTPKSHRPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="HR & Payroll PT PKS"
        text="Manajemen sumber daya manusia dan penggajian PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Human Resources & Payroll</h3>
          <p className="text-muted-foreground">
            Halaman untuk mengelola data karyawan, struktur organisasi, dan sistem penggajian PT PKS akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
