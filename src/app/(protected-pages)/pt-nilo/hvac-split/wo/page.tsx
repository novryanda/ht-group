import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { WorkOrderList } from "~/components/work-orders/work-order-list";

export const metadata: Metadata = {
  title: "Work Orders - HVAC Split - PT NILO",
  description: "Manajemen Work Orders untuk unit HVAC Split PT NILO",
};

export default function WorkOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Work Orders - HVAC Split"
        text="Kelola work orders untuk maintenance dan perbaikan AC Split PT NILO"
      />
      <WorkOrderList unitType="HVAC_SPLIT" companyId="PT_NILO" />
    </DashboardShell>
  );
}
