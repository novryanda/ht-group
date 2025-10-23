import { TransporterForm } from "~/components/dashboard/pt-pks/datamaster-pks/transportir";

export default function NewTransporterPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Transportir Baru</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Transportir akan langsung terverifikasi setelah dibuat
        </p>
      </div>
      <TransporterForm />
    </div>
  );
}

