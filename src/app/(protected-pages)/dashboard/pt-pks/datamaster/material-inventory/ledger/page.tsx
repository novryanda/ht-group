import { Suspense } from "react";
import { LedgerReport } from "~/components/pt-pks/inventory/reports/ledger-report";

export default function LedgerPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <LedgerReport />
      </Suspense>
    </div>
  );
}

