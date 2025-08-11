import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { HRMainDashboard } from "~/components/hr/hr-main-dashboard";

export const metadata: Metadata = {
  title: "HR & Payroll - PT NILO",
  description: "Manajemen HR dan Payroll PT NILO",
};

export default function HRPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="HR & Payroll - PT NILO"
        text="Kelola karyawan, absensi, dan payroll"
      />
      <HRMainDashboard companyId="PT_NILO" />
    </DashboardShell>
  );
}
