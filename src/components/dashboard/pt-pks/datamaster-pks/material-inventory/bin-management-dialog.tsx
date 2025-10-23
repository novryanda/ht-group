"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useToast } from "~/hooks/use-toast";
import { BinFormDialog } from "./bin-form-dialog";
import type { WarehouseDTO, BinDTO } from "~/server/types/pt-pks/material-inventory";

interface BinManagementDialogProps {
  open: boolean;
  onClose: () => void;
  warehouse: WarehouseDTO;
}

export function BinManagementDialog({
  open,
  onClose,
  warehouse,
}: BinManagementDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBinFormOpen, setIsBinFormOpen] = useState(false);
  const [editBin, setEditBin] = useState<BinDTO | null>(null);
  const [deleteBin, setDeleteBin] = useState<BinDTO | null>(null);

  // Fetch bins for this warehouse
  const { data: bins, isLoading } = useQuery({
    queryKey: ["bins", warehouse.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/pt-pks/material-inventory/bins?warehouseId=${warehouse.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch bins");
      const result = await res.json();
      return result.data || [];
    },
    enabled: open,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pt-pks/material-inventory/bins/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete bin");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins", warehouse.id] });
      toast({
        title: "Berhasil",
        description: "Bin berhasil dihapus",
      });
      setDeleteBin(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (bin: BinDTO) => {
    setEditBin(bin);
    setIsBinFormOpen(true);
  };

  const handleAdd = () => {
    setEditBin(null);
    setIsBinFormOpen(true);
  };

  const handleBinFormClose = () => {
    setIsBinFormOpen(false);
    setEditBin(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Bin - {warehouse.name}</DialogTitle>
            <DialogDescription>
              Atur bin/lokasi penyimpanan di dalam gudang ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total: {bins?.length || 0} bin
              </p>
              <Button onClick={handleAdd} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Bin
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bins?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <p>Belum ada bin di gudang ini</p>
                <p className="text-sm mt-1">Klik tombol "Tambah Bin" untuk menambahkan</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bins?.map((bin: BinDTO) => (
                      <TableRow key={bin.id}>
                        <TableCell className="font-medium">{bin.code}</TableCell>
                        <TableCell>{bin.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {bin.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={bin.isActive ? "default" : "secondary"}>
                            {bin.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(bin)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteBin(bin)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bin Form Dialog */}
      <BinFormDialog
        open={isBinFormOpen}
        onClose={handleBinFormClose}
        warehouse={warehouse}
        bin={editBin}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBin} onOpenChange={() => setDeleteBin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Bin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus bin{" "}
              <span className="font-semibold">{deleteBin?.name}</span>? Aksi ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBin && deleteMutation.mutate(deleteBin.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
