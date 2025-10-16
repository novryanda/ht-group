import { Suspense } from "react";
import { StockCountList } from "~/components/pt-pks/inventory/transactions/stock-count-list";

export default function StockCountPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <StockCountList />
      </Suspense>
    </div>
  );
}

