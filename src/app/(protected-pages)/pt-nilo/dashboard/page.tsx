import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { PTDashboard } from "~/components/dashboard/pt-dashboard";

export const metadata: Metadata = {
  title: "Dashboard - PT NILO",
  description: "Dashboard overview PT NILO - HVAC Rittal, HVAC Split, Fabrikasi, Efluen",
};

export default function PTNiloDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard PT NILO"
        text="Overview operasional, keuangan, dan performa PT NILO"
      />
      <PTDashboard 
        companyId="PT_NILO"
        companyName="PT NILO"
        companyCode="PT-NILO"
      />
    </DashboardShell>
  );
}
