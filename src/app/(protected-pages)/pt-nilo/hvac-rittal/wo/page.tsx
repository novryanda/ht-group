import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { WorkOrderList } from "~/components/work-orders/work-order-list";

export const metadata: Metadata = {
  title: "Work Orders - HVAC Rittal - PT NILO",
  description: "Manajemen Work Orders untuk unit HVAC Rittal PT NILO",
};

export default function WorkOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Work Orders - HVAC Rittal"
        text="Kelola work orders untuk maintenance dan perbaikan AC Rittal"
      />
      <WorkOrderList unitType="HVAC_RITTAL" companyId="PT_NILO" />
    </DashboardShell>
  );
}
