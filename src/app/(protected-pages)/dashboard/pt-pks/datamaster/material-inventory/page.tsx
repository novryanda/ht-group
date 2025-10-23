import type { Metadata } from "next";
import { MaterialInventoryDashboard } from "~/components/dashboard/pt-pks/datamaster-pks/material-inventory/material-inventory-dashboard";

export const metadata: Metadata = {
  title: "Material & Inventory - PT PKS",
  description: "Data master material dan inventory PT PKS",
};

export default function MaterialInventoryPage() {
  return <MaterialInventoryDashboard />;
}
