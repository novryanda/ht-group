"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
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
import { CategoryFormDialog } from "./category-form-dialog";
import type { CategoryDTO } from "~/server/types/pt-pks/material-inventory";

export function CategoryList() {
  // Bulk select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? allIds : []);
  };
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} kategori terpilih?`)) return;
    try {
      const res = await fetch("/api/pt-pks/material-inventory/categories/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const result = await res.json();
      if (!result.success) {
        toast({ title: "Sebagian gagal dihapus", description: "Beberapa kategori gagal dihapus.", variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Kategori terpilih berhasil dihapus." });
      }
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      toast({ title: "Gagal", description: "Gagal menghapus kategori." });
    }
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryDTO | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryDTO | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: "10",
        isActive: "all",
      });
      const res = await fetch(`/api/pt-pks/material-inventory/categories?${params}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const categories = data?.data?.data || [];
  const allIds = categories.map((cat: CategoryDTO) => cat.id);
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pt-pks/material-inventory/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
      setDeleteCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (category: CategoryDTO) => {
    setEditCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditCategory(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditCategory(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Kategori</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kategori..."
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
                  Tambah Kategori
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
          ) : data?.data?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data kategori
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <Checkbox
                          checked={isAllSelected || (isIndeterminate ? 'indeterminate' as any : false)}
                          onCheckedChange={handleSelectAll}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category: CategoryDTO) => {
                      const checked = selectedIds.includes(category.id);
                      return (
                        <TableRow key={category.id} data-state={checked ? "selected" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => handleSelectRow(category.id, !!v)}
                              aria-label={`Pilih ${category.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{category.code}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {category.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={category.isActive ? "default" : "secondary"}
                            >
                              {category.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteCategory(category)}
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
      <CategoryFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        category={editCategory}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori{" "}
              <span className="font-semibold">{deleteCategory?.name}</span>? Aksi
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategory && deleteMutation.mutate(deleteCategory.id)}
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
    </div>
  );
}
