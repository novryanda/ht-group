import { Suspense } from "react";
import { WarehouseList } from "~/components/pt-pks/inventory/master/warehouse-list";

export default function WarehousesPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <WarehouseList />
      </Suspense>
    </div>
  );
}

