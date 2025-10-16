import type { Metadata } from "next";
import { EmptyPageTemplate } from "~/components/dashboard/empty-page-template";

export const metadata: Metadata = {
  title: "Dashboard - PT NILO",
  description: "Dashboard overview PT NILO - HVAC Rittal, HVAC Split, Fabrikasi, Efluen",
};

export default function PTNiloDashboardPage() {
  return (
    <EmptyPageTemplate
      title="PT NILO Dashboard"
      description="Dashboard operasional PT NILO - HVAC Rittal, HVAC Split, Fabrikasi, Efluen"
      module="PT NILO"
    />
  );
}
