import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";

export default function OvertimeApprovalPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Approval Overtime"
        text="Approval dan validasi permohonan lembur karyawan PT PKS"
      />
      <div className="grid gap-4">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Persetujuan Lembur</h3>
          <p className="text-muted-foreground">
            Halaman untuk supervisor dan manager melakukan approval terhadap permohonan lembur karyawan akan dikembangkan di sini.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
