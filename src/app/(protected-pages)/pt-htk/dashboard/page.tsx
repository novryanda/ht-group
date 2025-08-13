import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { PTDashboard } from "~/components/dashboard/pt-dashboard";

export const metadata: Metadata = {
  title: "Dashboard - PT HTK",
  description: "Dashboard overview PT HTK - Cutting Grass",
};

export default function PTHtkDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard PT HTK"
        text="Overview operasional, keuangan, dan performa PT HTK"
      />
      <PTDashboard 
        companyId="PT_HTK"
        companyName="PT HTK"
        companyCode="PT-HTK"
      />
    </DashboardShell>
  );
}
