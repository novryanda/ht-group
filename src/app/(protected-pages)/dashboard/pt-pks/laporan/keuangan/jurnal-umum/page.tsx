import { JournalTable } from "~/components/dashboard/pt-pks/laporan/keuangan/jurnal-umum/journal-table";

export default function JurnalUmumPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Jurnal Umum</h2>
        <p className="text-muted-foreground">
          Daftar semua transaksi jurnal yang telah diposting
        </p>
      </div>

      <JournalTable />
    </div>
  );
}
