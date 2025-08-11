import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { HRMainDashboard } from "~/components/hr/hr-main-dashboard";

export const metadata: Metadata = {
  title: "HR & Payroll - PT ZTA",
  description: "Manajemen HR dan Payroll PT ZTA",
};

export default function HRPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="HR & Payroll - PT ZTA"
        text="Manajemen karyawan, absensi, dan penggajian PT ZTA"
      />
      <HRMainDashboard companyId="PT_ZTA" />
    </DashboardShell>
  );
}
