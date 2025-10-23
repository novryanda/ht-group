"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Loader2, Warehouse } from "lucide-react";
import { Button } from "~/components/ui/button";
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
import { WarehouseFormDialog } from "./warehouse-form-dialog";
import { BinManagementDialog } from "./bin-management-dialog";
import type { WarehouseDTO } from "~/server/types/pt-pks/material-inventory";

export function WarehouseList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<WarehouseDTO | null>(null);
  const [deleteWarehouse, setDeleteWarehouse] = useState<WarehouseDTO | null>(null);
  const [manageBinsWarehouse, setManageBinsWarehouse] = useState<WarehouseDTO | null>(null);

  // Fetch warehouses
  const { data, isLoading } = useQuery({
    queryKey: ["warehouses", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: "10",
        isActive: "all",
      });
      const res = await fetch(`/api/pt-pks/material-inventory/warehouses?${params}`);
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pt-pks/material-inventory/warehouses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({
        title: "Berhasil",
        description: "Gudang berhasil dihapus",
      });
      setDeleteWarehouse(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (warehouse: WarehouseDTO) => {
    setEditWarehouse(warehouse);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditWarehouse(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditWarehouse(null);
  };

  const handleManageBins = (warehouse: WarehouseDTO) => {
    setManageBinsWarehouse(warehouse);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Daftar Gudang</CardTitle>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Gudang
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari gudang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
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
              Tidak ada data gudang
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.data?.map((warehouse: WarehouseDTO) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.code}</TableCell>
                        <TableCell>{warehouse.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {warehouse.address || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={warehouse.isActive ? "default" : "secondary"}
                          >
                            {warehouse.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageBins(warehouse)}
                              className="gap-2"
                            >
                              <Warehouse className="h-4 w-4" />
                              Bins
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(warehouse)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteWarehouse(warehouse)}
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
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <WarehouseFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        warehouse={editWarehouse}
      />

      {/* Bin Management Dialog */}
      {manageBinsWarehouse && (
        <BinManagementDialog
          open={!!manageBinsWarehouse}
          onClose={() => setManageBinsWarehouse(null)}
          warehouse={manageBinsWarehouse}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteWarehouse} onOpenChange={() => setDeleteWarehouse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gudang</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gudang{" "}
              <span className="font-semibold">{deleteWarehouse?.name}</span>? Aksi
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWarehouse && deleteMutation.mutate(deleteWarehouse.id)}
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
