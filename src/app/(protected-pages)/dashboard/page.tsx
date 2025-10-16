import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { DashboardCards } from "~/components/dashboard/dashboard-cards";
import { RecentActivity } from "~/components/dashboard/recent-activity";
import { OverviewCharts } from "~/components/dashboard/overview-charts";

import { EmptyPageTemplate } from "~/components/dashboard/empty-page-template";

export default function DashboardPage() {
  return (
    <EmptyPageTemplate
      title="HT Group Dashboard"
      description="Dashboard konsolidasi untuk seluruh perusahaan HT Group"
      module="Group Dashboard"
    />
  );
}
