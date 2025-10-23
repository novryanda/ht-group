import { BuyerForm } from "~/components/dashboard/pt-pks/datamaster-pks/buyer/buyer-form";

export default function NewBuyerPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Buyer Baru</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buyer akan langsung terverifikasi setelah dibuat
        </p>
      </div>
      <BuyerForm />
    </div>
  );
}

