import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { FinanceMainDashboard } from "~/components/finance/finance-main-dashboard";

export const metadata: Metadata = {
  title: "Finance - PT TAM",
  description: "Manajemen keuangan PT TAM",
};

export default function FinancePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Finance Dashboard - PT TAM"
        text="Manajemen keuangan, AR, AP, dan General Ledger PT TAM"
      />
      <FinanceMainDashboard companyId="PT_TAM" />
    </DashboardShell>
  );
}
