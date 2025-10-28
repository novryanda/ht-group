"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import PermintaanBarangForm from "./permintaan-barang-form";
import { format } from "date-fns";

export function PermintaanBarangList() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["item-requests"],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/pengajuan-barang");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const columns = [
    {
      key: "reqNumber",
      label: "No. Permintaan",
    },
    {
      key: "date",
      label: "Tanggal",
      render: (value: unknown) => format(new Date(value as string), "dd/MM/yyyy"),
    },
    {
      key: "requestDept",
      label: "Dept/Unit",
    },
    {
      key: "reason",
      label: "Alasan",
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
          <h2 className="text-2xl font-bold">Permintaan Barang</h2>
          <p className="text-muted-foreground">Kelola permintaan barang dari dept/unit</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Permintaan Baru
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data?.data || []}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Permintaan Barang Baru</DialogTitle>
          </DialogHeader>
          <PermintaanBarangForm onSubmit={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
