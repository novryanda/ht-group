"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { BarangKeluarFormDialog } from "./barang-keluar-form";
import { format } from "date-fns";

export function BarangKeluarList() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["goods-issues"],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/barang-keluar");
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
      key: "purpose",
      label: "Tujuan",
    },
    {
      key: "targetDept",
      label: "Dept/Unit",
    },
    {
      key: "status",
      label: "Status",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Barang Keluar</h2>
          <p className="text-muted-foreground">Kelola pengeluaran barang dari gudang</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Barang Keluar Baru
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data?.data || []}
      />

      <BarangKeluarFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
