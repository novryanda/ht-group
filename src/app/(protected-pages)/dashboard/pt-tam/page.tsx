import type { Metadata } from "next";
import { EmptyPageTemplate } from "~/components/dashboard/empty-page-template";

export const metadata: Metadata = {
  title: "Dashboard - PT TAM",
  description: "Dashboard overview PT TAM",
};

export default function PTTAMDashboardPage() {
  return (
    <EmptyPageTemplate
      title="PT TAM Dashboard"
      description="Dashboard operasional PT TAM - Manpower Fabrikasi"
      module="PT TAM"
    />
  );
}
