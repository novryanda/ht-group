import { TransporterList } from "~/components/pt-pks/datamaster/transportir";

export default function PKSTransportirPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Master Transportir</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola data transportir, armada, pengemudi, dan tarif angkutan
        </p>
      </div>
      <TransporterList />
    </div>
  );
}
