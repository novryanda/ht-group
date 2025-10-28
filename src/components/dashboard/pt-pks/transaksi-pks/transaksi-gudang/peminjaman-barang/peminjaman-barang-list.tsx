"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Plus, Eye, FileText, PackageCheck } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { PeminjamanBarangFormDialog } from "./peminjaman-barang-form";
import { PeminjamanBarangDetailDialog } from "./peminjaman-barang-detail";
import { PeminjamanBarangReturnDialog } from "./peminjaman-barang-return";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export function PeminjamanBarangList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [selectedDocNumber, setSelectedDocNumber] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["loan-issues"],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/peminjaman-barang");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const handleViewDetail = (loanId: string) => {
    setSelectedLoanId(loanId);
    setIsDetailOpen(true);
  };

  const handleReturn = (loanId: string, docNumber: string) => {
    setSelectedLoanId(loanId);
    setSelectedDocNumber(docNumber);
    setIsReturnOpen(true);
  };

  const handleGeneratePdf = async (loanId: string, docNumber: string) => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch(`/api/pt-pks/peminjaman-barang/${loanId}/pdf`);
      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Peminjaman-${docNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF berhasil diunduh");
    } catch (error) {
      toast.error("Gagal generate PDF");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
      key: "expectedReturnAt",
      label: "Jatuh Tempo",
      render: (value: unknown) => format(new Date(value as string), "dd/MM/yyyy"),
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const status = value as string;
        return (
          <Badge variant={status === "RETURNED" ? "default" : "secondary"}>
            {status === "RETURNED" ? "Dikembalikan" : status === "PARTIAL_RETURN" ? "Sebagian Kembali" : "Dipinjam"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_: unknown, row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewDetail(row.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleGeneratePdf(row.id, row.docNumber)}
              disabled={isGeneratingPdf}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate PDF
            </DropdownMenuItem>
            {row.status !== "RETURNED" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleReturn(row.id, row.docNumber)}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Kembalikan Barang
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Peminjaman Barang</h2>
          <p className="text-muted-foreground">Kelola peminjaman barang dari gudang</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Peminjaman Baru
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data?.data || []} />

      <PeminjamanBarangFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
      <PeminjamanBarangDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        loanId={selectedLoanId}
      />
      <PeminjamanBarangReturnDialog
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        loanId={selectedLoanId}
        docNumber={selectedDocNumber}
      />
    </div>
  );
}
