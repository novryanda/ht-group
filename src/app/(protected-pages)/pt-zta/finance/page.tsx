import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { FinanceMainDashboard } from "~/components/finance/finance-main-dashboard";

export const metadata: Metadata = {
  title: "Finance - PT ZTA",
  description: "Manajemen keuangan PT ZTA",
};

export default function FinancePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Finance Dashboard - PT ZTA"
        text="Manajemen keuangan, AR, AP, dan General Ledger PT ZTA"
      />
      <FinanceMainDashboard companyId="PT_ZTA" />
    </DashboardShell>
  );
}
