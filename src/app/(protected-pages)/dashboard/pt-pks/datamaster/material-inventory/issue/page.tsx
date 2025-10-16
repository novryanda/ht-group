import { Suspense } from "react";
import { IssueList } from "~/components/pt-pks/inventory/transactions/issue-list";

export default function IssuePage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <IssueList />
      </Suspense>
    </div>
  );
}

