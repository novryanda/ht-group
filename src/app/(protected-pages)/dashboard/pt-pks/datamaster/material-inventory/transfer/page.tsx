import { Suspense } from "react";
import { TransferList } from "~/components/pt-pks/inventory/transactions/transfer-list";

export default function TransferPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <TransferList />
      </Suspense>
    </div>
  );
}

