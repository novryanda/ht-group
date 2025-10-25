"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2, Filter } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { ItemTypeFormDialog } from "./item-type-form-dialog";
import type { ItemTypeDTO, CategoryDTO } from "~/server/types/pt-pks/material-inventory";

export function ItemTypeList() {
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
    if (!confirm(`Hapus ${selectedIds.length} jenis barang terpilih?`)) return;
    try {
      const res = await fetch("/api/pt-pks/material-inventory/item-types/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const result = await res.json();
      if (!result.success) {
        toast({ title: "Sebagian gagal dihapus", description: "Beberapa jenis gagal dihapus.", variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Jenis terpilih berhasil dihapus." });
      }
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["item-types"] });
    } catch (error) {
      toast({ title: "Gagal", description: "Gagal menghapus jenis." });
    }
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<ItemTypeDTO | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<ItemTypeDTO | null>(null);

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/categories?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["item-types", { search, categoryFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: "10",
        isActive: "all",
      });
      if (categoryFilter && categoryFilter !== "all") {
        params.append("categoryId", categoryFilter);
      }
      const res = await fetch(`/api/pt-pks/material-inventory/item-types?${params}`);
      if (!res.ok) throw new Error("Failed to fetch item types");
      return res.json();
    },
  });

  const itemTypes = data?.data?.data || [];
  const allIds = itemTypes.map((item: ItemTypeDTO) => item.id);
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pt-pks/material-inventory/item-types/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete item type");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-types"] });
      toast({
        title: "Berhasil",
        description: "Jenis barang berhasil dihapus",
      });
      setDeleteItemType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (itemType: ItemTypeDTO) => {
    setEditItemType(itemType);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditItemType(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditItemType(null);
  };

  const categories = categoriesData?.data?.data || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Daftar Jenis Barang</CardTitle>
              <div className="flex gap-2">
                {selectedIds.length > 0 && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Terpilih ({selectedIds.length})
                  </Button>
                )}
                <Button onClick={handleAdd} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Jenis
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari jenis barang..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((cat: CategoryDTO) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Tidak ada data jenis barang
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
                      <TableHead>Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemTypes.map((itemType: ItemTypeDTO) => {
                      const checked = selectedIds.includes(itemType.id);
                      return (
                        <TableRow key={itemType.id} data-state={checked ? "selected" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => handleSelectRow(itemType.id, !!v)}
                              aria-label={`Pilih ${itemType.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{itemType.code}</TableCell>
                          <TableCell>{itemType.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{itemType.categoryName}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {itemType.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={itemType.isActive ? "default" : "secondary"}
                            >
                              {itemType.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(itemType)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteItemType(itemType)}
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
      <ItemTypeFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        itemType={editItemType}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItemType} onOpenChange={() => setDeleteItemType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jenis Barang</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jenis barang{" "}
              <span className="font-semibold">{deleteItemType?.name}</span>? Aksi
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemType && deleteMutation.mutate(deleteItemType.id)}
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
