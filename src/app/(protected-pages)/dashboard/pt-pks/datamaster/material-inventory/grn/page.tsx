import { GrnList } from "~/components/pt-pks/inventory/transactions/grn-list";

export default function GrnPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Goods Receipt Note (GRN)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Penerimaan barang masuk gudang
        </p>
      </div>
      <GrnList />
    </div>
  );
}

