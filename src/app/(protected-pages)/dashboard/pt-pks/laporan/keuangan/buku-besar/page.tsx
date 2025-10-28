import { LedgerTable } from "~/components/dashboard/pt-pks/laporan/keuangan/buku-besar/ledger-table";

export default function BukuBesarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buku Besar</h2>
        <p className="text-muted-foreground">
          Rincian mutasi dan saldo setiap akun
        </p>
      </div>

      <LedgerTable />
    </div>
  );
}
