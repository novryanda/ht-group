import type { Metadata } from "next";
import { EmptyPageTemplate } from "~/components/dashboard/empty-page-template";

export const metadata: Metadata = {
  title: "Dashboard - PT PKS",
  description: "Dashboard overview PT PKS",
};

export default function PTPKSDashboardPage() {
  return (
    <EmptyPageTemplate
      title="PT PKS Dashboard"
      description="Dashboard operasional PT PKS - Pabrik Kelapa Sawit"
      module="PT PKS"
    />
  );
}
