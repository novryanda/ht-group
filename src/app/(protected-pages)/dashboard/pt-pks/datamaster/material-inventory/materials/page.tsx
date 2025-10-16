import { MaterialList } from "~/components/pt-pks/inventory/materials/material-list";

export default function MaterialsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Master Material</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola data master material dan barang untuk inventory
        </p>
      </div>
      <MaterialList />
    </div>
  );
}

