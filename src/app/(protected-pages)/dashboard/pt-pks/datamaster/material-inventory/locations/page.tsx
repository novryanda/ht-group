import { Suspense } from "react";
import { LocationList } from "~/components/pt-pks/inventory/master/location-list";

export default function LocationsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <LocationList />
      </Suspense>
    </div>
  );
}

