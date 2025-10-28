"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { PeminjamanBarangFormDialog } from "./peminjaman-barang-form";
import { format } from "date-fns";

export function PeminjamanBarangList() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["loan-issues"],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/peminjaman-barang");
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
      key: "loanReceiver",
      label: "Peminjam",
    },
    {
      key: "targetDept",
      label: "Dept/Unit",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "expectedReturnAt",
      label: "Jatuh Tempo",
      render: (value: unknown) =>
        value ? format(new Date(value as string), "dd/MM/yyyy") : "-",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Peminjaman Barang</h2>
          <p className="text-muted-foreground">Kelola peminjaman barang dan tracking pengembalian</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Peminjaman Baru
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data?.data || []}
      />

      <PeminjamanBarangFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
