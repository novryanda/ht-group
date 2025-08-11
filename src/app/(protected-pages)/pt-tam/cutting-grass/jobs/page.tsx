import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { JobList } from "~/components/jobs/job-list";

export const metadata: Metadata = {
  title: "Job Orders - Cutting Grass - PT TAM",
  description: "Manajemen Job Orders untuk unit Cutting Grass PT TAM",
};

export default function JobOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Job Orders - Cutting Grass"
        text="Kelola project dan job orders untuk unit cutting grass PT TAM"
      />
      <JobList unitType="CUTTING_GRASS" companyId="PT_TAM" />
    </DashboardShell>
  );
}
