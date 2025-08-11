import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { FinanceMainDashboard } from "~/components/finance/finance-main-dashboard";

export const metadata: Metadata = {
  title: "Finance - PT HTK",
  description: "Manajemen keuangan PT HTK",
};

export default function FinancePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Finance Dashboard - PT HTK"
        text="Manajemen keuangan, AR, AP, dan General Ledger PT HTK"
      />
      <FinanceMainDashboard companyId="PT_HTK" />
    </DashboardShell>
  );
}
