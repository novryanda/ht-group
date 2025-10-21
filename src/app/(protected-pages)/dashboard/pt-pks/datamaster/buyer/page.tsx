import { BuyerList } from "~/components/pt-pks/datamaster-pks/buyer/buyer-list";

export default function PKSBuyerPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Master Buyer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola data buyer untuk transaksi penjualan CPO/PK
        </p>
      </div>
      <BuyerList />
    </div>
  );
}
