import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { JobList } from "~/components/jobs/job-list";

export const metadata: Metadata = {
  title: "Job Orders - Efluen - PT NILO",
  description: "Manajemen Job Orders untuk unit Efluen PT NILO",
};

export default function JobOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Job Orders - Efluen"
        text="Kelola project dan job orders untuk unit efluen treatment PT NILO"
      />
      <JobList unitType="EFFLUENT_TREATMENT" companyId="PT_NILO" />
    </DashboardShell>
  );
}
