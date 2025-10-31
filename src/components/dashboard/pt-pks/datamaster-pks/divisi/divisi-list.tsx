"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { DivisiFormDialog } from "./divisi-form-dialog";
import { JabatanFormDialog } from "./jabatan-form-dialog";
import { JabatanListDialog } from "./jabatan-list-dialog";
import type { DivisiDTO } from "~/server/types/pt-pks/divisi";

export function DivisiList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editDivisi, setEditDivisi] = useState<DivisiDTO | null>(null);
  const [deleteDivisi, setDeleteDivisi] = useState<DivisiDTO | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDivisiForJabatan, setSelectedDivisiForJabatan] = useState<DivisiDTO | null>(null);
  const [jabatanListOpen, setJabatanListOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["divisi", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: "10",
        isActive: "all",
      });
      const res = await fetch(`/api/pt-pks/divisi?${params}`);
      if (!res.ok) throw new Error("Failed to fetch divisi");
      return res.json();
    },
  });

  const divisiList = data?.data?.data || [];
  const allIds = divisiList.map((divisi: DivisiDTO) => divisi.id);
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pt-pks/divisi/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete divisi");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
      toast({
        title: "Berhasil",
        description: "Divisi berhasil dihapus",
      });
      setDeleteDivisi(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? allIds : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} divisi terpilih?`)) return;
    
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/pt-pks/divisi/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Berhasil",
        description: `${successCount} divisi berhasil dihapus`,
      });
    }
    if (failCount > 0) {
      toast({
        title: "Peringatan",
        description: `${failCount} divisi gagal dihapus`,
        variant: "destructive",
      });
    }

    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ["divisi"] });
  };

  const handleEdit = (divisi: DivisiDTO) => {
    setEditDivisi(divisi);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditDivisi(null);
    setIsFormOpen(true);
  };

  const handleViewJabatan = (divisi: DivisiDTO) => {
    setSelectedDivisiForJabatan(divisi);
    setJabatanListOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditDivisi(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Divisi</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari divisi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Terpilih ({selectedIds.length})
                  </Button>
                )}
                <Button onClick={handleAdd} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Divisi
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : divisiList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data divisi
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <Checkbox
                          checked={isAllSelected || (isIndeterminate ? ("indeterminate" as any) : false)}
                          onCheckedChange={handleSelectAll}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Divisi</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {divisiList.map((divisi: DivisiDTO) => {
                      const checked = selectedIds.includes(divisi.id);
                      return (
                        <TableRow key={divisi.id} data-state={checked ? "selected" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => handleSelectRow(divisi.id, !!v)}
                              aria-label={`Pilih ${divisi.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{divisi.code}</TableCell>
                          <TableCell>{divisi.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {divisi.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {divisi.jabatanCount ?? 0} jabatan
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {divisi.employeesCount ?? 0} karyawan
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={divisi.isActive ? "default" : "secondary"}
                            >
                              {divisi.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewJabatan(divisi)}
                                title="Kelola Jabatan"
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(divisi)}
                                title="Edit Divisi"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteDivisi(divisi)}
                                title="Hapus Divisi"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <DivisiFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        divisi={editDivisi}
      />

      {/* Jabatan List Dialog */}
      <JabatanListDialog
        open={jabatanListOpen}
        onClose={() => {
          setJabatanListOpen(false);
          setSelectedDivisiForJabatan(null);
        }}
        divisi={selectedDivisiForJabatan}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteDivisi}
        onOpenChange={(open) => !open && setDeleteDivisi(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Divisi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus divisi <strong>{deleteDivisi?.name}</strong>?
              <br />
              <span className="text-red-600">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua jabatan terkait.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDivisi && deleteMutation.mutate(deleteDivisi.id)}
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
    </div>
  );
}

