import { Suspense } from "react";
import { CategoryList } from "~/components/pt-pks/inventory/master/category-list";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <CategoryList />
      </Suspense>
    </div>
  );
}

