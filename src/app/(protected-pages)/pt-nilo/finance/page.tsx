import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { FinanceMainDashboard } from "~/components/finance/finance-main-dashboard";

export const metadata: Metadata = {
  title: "Finance - PT NILO",
  description: "Manajemen Finance PT NILO - AR/AP, GL, dan Rekonsiliasi",
};

export default function FinancePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Finance - PT NILO"
        text="Kelola AR/AP, GL, jurnal, dan rekonsiliasi bank"
      />
      <FinanceMainDashboard companyId="PT_NILO" />
    </DashboardShell>
  );
}
