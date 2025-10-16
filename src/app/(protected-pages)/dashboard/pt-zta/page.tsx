import type { Metadata } from "next";
import { EmptyPageTemplate } from "~/components/dashboard/empty-page-template";

export const metadata: Metadata = {
  title: "Dashboard - PT ZTA",
  description: "Dashboard overview PT ZTA",
};

export default function PTZTADashboardPage() {
  return (
    <EmptyPageTemplate
      title="PT ZTA Dashboard"
      description="Dashboard operasional PT ZTA - HVAC Rittal & HVAC Split"
      module="PT ZTA"
    />
  );
}
