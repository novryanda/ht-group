"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { JabatanFormDialog } from "./jabatan-form-dialog";
import type { DivisiDTO } from "~/server/types/pt-pks/divisi";
import type { JabatanDTO } from "~/server/types/pt-pks/divisi";

interface JabatanListDialogProps {
  open: boolean;
  onClose: () => void;
  divisi: DivisiDTO | null;
}

export function JabatanListDialog({ open, onClose, divisi }: JabatanListDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editJabatan, setEditJabatan] = useState<JabatanDTO | null>(null);
  const [deleteJabatan, setDeleteJabatan] = useState<JabatanDTO | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["jabatan", divisi?.id, page],
    queryFn: async () => {
      if (!divisi?.id) return null;
      const params = new URLSearchParams({
        divisiId: divisi.id,
        page: page.toString(),
        limit: "10",
        isActive: "all",
      });
      const res = await fetch(`/api/pt-pks/jabatan?${params}`);
      if (!res.ok) throw new Error("Failed to fetch jabatan");
      return res.json();
    },
    enabled: !!divisi?.id && open,
  });

  const jabatanList = data?.data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pt-pks/jabatan/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete jabatan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jabatan", divisi?.id] });
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
      toast({
        title: "Berhasil",
        description: "Jabatan berhasil dihapus",
      });
      setDeleteJabatan(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (jabatan: JabatanDTO) => {
    setEditJabatan(jabatan);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditJabatan(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditJabatan(null);
  };

  if (!divisi) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Jabatan - {divisi.name}</DialogTitle>
            <DialogDescription>
              Daftar jabatan dalam divisi {divisi.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Jabatan
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : jabatanList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada jabatan untuk divisi ini
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama Jabatan</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jabatanList.map((jabatan: JabatanDTO) => (
                        <TableRow key={jabatan.id}>
                          <TableCell className="font-medium">{jabatan.code}</TableCell>
                          <TableCell>{jabatan.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {jabatan.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {jabatan.employeesCount ?? 0} karyawan
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={jabatan.isActive ? "default" : "secondary"}
                            >
                              {jabatan.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(jabatan)}
                                title="Edit Jabatan"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteJabatan(jabatan)}
                                title="Hapus Jabatan"
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

                {/* Pagination */}
                {data?.data?.meta && data.data.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Halaman {data.data.meta.page} dari {data.data.meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.data.meta.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Jabatan Form Dialog */}
      <JabatanFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        jabatan={editJabatan}
        divisiId={divisi.id}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteJabatan}
        onOpenChange={(open) => !open && setDeleteJabatan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Jabatan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jabatan <strong>{deleteJabatan?.name}</strong>?
              <br />
              <span className="text-red-600">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJabatan && deleteMutation.mutate(deleteJabatan.id)}
              className="bg-red-600 hover:bg-red-700"
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

