import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { HRMainDashboard } from "~/components/hr/hr-main-dashboard";

export const metadata: Metadata = {
  title: "HR & Payroll - PT TAM",
  description: "Manajemen HR dan Payroll PT TAM",
};

export default function HRPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="HR & Payroll - PT TAM"
        text="Manajemen karyawan, absensi, dan penggajian PT TAM"
      />
      <HRMainDashboard companyId="PT_TAM" />
    </DashboardShell>
  );
}
