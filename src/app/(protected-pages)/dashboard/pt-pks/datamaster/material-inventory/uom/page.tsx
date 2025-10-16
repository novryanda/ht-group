import { Suspense } from "react";
import { UomList } from "~/components/pt-pks/inventory/master/uom-list";

export default function UomPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <UomList />
      </Suspense>
    </div>
  );
}

