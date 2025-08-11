import type { Metadata } from "next";
import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { JobList } from "~/components/jobs/job-list";

export const metadata: Metadata = {
  title: "Job Orders - Fabrikasi - PT NILO",
  description: "Manajemen Job Orders untuk unit Fabrikasi PT NILO",
};

export default function JobOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Job Orders - Fabrikasi"
        text="Kelola project dan job orders untuk unit fabrikasi PT NILO"
      />
      <JobList unitType="FABRICATION" companyId="PT_NILO" />
    </DashboardShell>
  );
}
