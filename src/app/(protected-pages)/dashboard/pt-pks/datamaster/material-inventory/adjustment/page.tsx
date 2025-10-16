import { Suspense } from "react";
import { AdjustmentList } from "~/components/pt-pks/inventory/transactions/adjustment-list";

export default function AdjustmentPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <AdjustmentList />
      </Suspense>
    </div>
  );
}

