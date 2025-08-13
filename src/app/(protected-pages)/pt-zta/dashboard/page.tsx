import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { PTDashboard } from "~/components/dashboard/pt-dashboard";

export const metadata: Metadata = {
  title: "Dashboard - PT ZTA",
  description: "Dashboard overview PT ZTA - HVAC Rittal, HVAC Split",
};

export default function PTZtaDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard PT ZTA"
        text="Overview operasional, keuangan, dan performa PT ZTA"
      />
      <PTDashboard 
        companyId="PT_ZTA"
        companyName="PT ZTA"
        companyCode="PT-ZTA"
      />
    </DashboardShell>
  );
}
