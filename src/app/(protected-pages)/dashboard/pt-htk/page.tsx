import type { Metadata } from "next";
import { EmptyPageTemplate } from "~/components/dashboard/empty-page-template";

export const metadata: Metadata = {
  title: "Dashboard - PT HTK",
  description: "Dashboard overview PT HTK",
};

export default function PTHTKDashboardPage() {
  return (
    <EmptyPageTemplate
      title="PT HTK Dashboard"
      description="Dashboard operasional PT HTK - Cutting Grass, Heavy Equipment, Hauling Container"
      module="PT HTK"
    />
  );
}
