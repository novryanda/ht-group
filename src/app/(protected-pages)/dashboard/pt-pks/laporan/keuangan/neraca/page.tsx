import { BalanceSheetTable } from "~/components/dashboard/pt-pks/laporan/keuangan/neraca/balance-sheet-table";

export default function NeracaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Neraca</h2>
        <p className="text-muted-foreground">
          Laporan posisi keuangan (aset, kewajiban, dan ekuitas)
        </p>
      </div>

      <BalanceSheetTable />
    </div>
  );
}
