import { DashboardShell } from "~/components/dashboard/dashboard-shell";
import { DashboardHeader } from "~/components/dashboard/dashboard-header";
import { DashboardCards } from "~/components/dashboard/dashboard-cards";
import { RecentActivity } from "~/components/dashboard/recent-activity";
import { OverviewCharts } from "~/components/dashboard/overview-charts";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard HT Group"
        text="Ringkasan operasional seluruh PT dan unit bisnis"
        showBreadcrumb={false}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <OverviewCharts />
        </div>
        <div className="col-span-3">
          <RecentActivity />
        </div>
      </div>
    </DashboardShell>
  );
}
