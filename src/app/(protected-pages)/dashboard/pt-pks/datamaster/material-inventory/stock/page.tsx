import { StockReport } from "~/components/pt-pks/inventory/reports/stock-report";

export default function StockReportPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Stok</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Posisi stok material per lokasi penyimpanan
        </p>
      </div>
      <StockReport />
    </div>
  );
}

