import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { PTDashboard } from "~/components/dashboard/pt-dashboard";

export const metadata: Metadata = {
  title: "Dashboard - PT TAM",
  description: "Dashboard overview PT TAM - Fabrikasi",
};

export default function PTTamDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard PT TAM"
        text="Overview operasional, keuangan, dan performa PT TAM"
      />
      <PTDashboard 
        companyId="PT_TAM"
        companyName="PT TAM"
        companyCode="PT-TAM"
      />
    </DashboardShell>
  );
}
