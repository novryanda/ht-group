import { Suspense } from "react";
import { OpeningBalanceForm } from "~/components/pt-pks/inventory/transactions/opening-balance-form";

export default function OpeningBalancePage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <OpeningBalanceForm />
      </Suspense>
    </div>
  );
}

