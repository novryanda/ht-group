"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { BarangMasukFormDialog } from "./barang-masuk-form";
import { format } from "date-fns";

export function BarangMasukList() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["goods-receipts"],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/barang-masuk");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const columns = [
    {
      key: "docNumber",
      label: "No. Dokumen",
    },
    {
      key: "date",
      label: "Tanggal",
      render: (value: unknown) => format(new Date(value as string), "dd/MM/yyyy"),
    },
    {
      key: "sourceType",
      label: "Sumber",
    },
    {
      key: "warehouse",
      label: "Gudang",
      render: (value: unknown) => (value as any)?.name || "-",
    },
    {
      key: "glStatus",
      label: "Status GL",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Barang Masuk</h2>
          <p className="text-muted-foreground">Kelola penerimaan barang ke gudang</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Barang Masuk Baru
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data?.data || []}
      />

      <BarangMasukFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
