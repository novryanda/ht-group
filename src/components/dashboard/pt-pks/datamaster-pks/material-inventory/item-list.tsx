"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Package,
  History,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import { ItemFormDialog } from "./item-form-dialog";
import { StockBalanceView } from "./stock-balance-view";
import { StockLedgerView } from "./stock-ledger-view";
import type { ItemDTO } from "~/server/types/pt-pks/material-inventory";

export function ItemList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDTO | null>(null);
  const [stockViewOpen, setStockViewOpen] = useState(false);
  const [selectedItemForStock, setSelectedItemForStock] = useState<{ id: string; name: string } | null>(null);
  const [ledgerViewOpen, setLedgerViewOpen] = useState(false);
  const [selectedItemForLedger, setSelectedItemForLedger] = useState<{ id: string; name: string } | null>(null);

  const limit = 10;

  // Fetch items with filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["items", page, searchTerm, categoryFilter, itemTypeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { categoryId: categoryFilter }),
        ...(itemTypeFilter && { itemTypeId: itemTypeFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
      });

      const res = await fetch(`/api/pt-pks/material-inventory/items?${params}`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/categories?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch item types for filter (filtered by category if selected)
  const { data: itemTypesData } = useQuery({
    queryKey: ["item-types-filter", categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        isActive: "true",
        limit: "100",
        ...(categoryFilter && { categoryId: categoryFilter }),
      });
      const res = await fetch(`/api/pt-pks/material-inventory/item-types?${params}`);
      if (!res.ok) throw new Error("Failed to fetch item types");
      return res.json();
    },
    enabled: showFilters,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus barang ini?")) return;

    try {
      const res = await fetch(`/api/pt-pks/material-inventory/items/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete item");
      }

      // Show appropriate message
      if (result.message) {
        toast.warning(result.message);
      } else {
        toast.success("Barang berhasil dihapus");
      }
      
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus barang");
    }
  };

  const handleEdit = (item: ItemDTO) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
    refetch();
  };

  const handleViewStock = (item: ItemDTO) => {
    setSelectedItemForStock({ id: item.id, name: item.name });
    setStockViewOpen(true);
  };

  const handleViewLedger = (item: ItemDTO) => {
    setSelectedItemForLedger({ id: item.id, name: item.name });
    setLedgerViewOpen(true);
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setItemTypeFilter("");
    setStatusFilter("all");
    setSearchTerm("");
    setPage(1);
  };

  const hasActiveFilters = categoryFilter || itemTypeFilter || statusFilter !== "all" || searchTerm;

  const items = data?.data?.data || [];
  const meta = data?.data?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daftar Barang</CardTitle>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Barang
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search & Filter Controls */}
        <div className="mb-4 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari SKU atau nama barang..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value);
                  setItemTypeFilter(""); // Reset item type when category changes
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {categoriesData?.data?.data?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Jenis Barang</label>
                <Select 
                  value={itemTypeFilter} 
                  onValueChange={(value) => {
                    setItemTypeFilter(value);
                    setPage(1);
                  }}
                  disabled={!categoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua jenis</SelectItem>
                    {itemTypesData?.data?.data?.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Min Stock</TableHead>
                <TableHead className="text-right">Max Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Tidak ada data barang
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: ItemDTO) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>{item.itemTypeName}</TableCell>
                    <TableCell>{item.baseUnitName}</TableCell>
                    <TableCell className="text-right">
                      {item.minStock !== undefined ? item.minStock.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.maxStock !== undefined ? item.maxStock.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewStock(item)}
                          title="Lihat Stok"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewLedger(item)}
                          title="Histori Mutasi"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          title="Edit Barang"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          title="Hapus Barang"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} total barang)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Form Dialog */}
      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
        onSuccess={handleFormClose}
      />

      {/* Stock Balance View */}
      <StockBalanceView
        open={stockViewOpen}
        onOpenChange={setStockViewOpen}
        itemId={selectedItemForStock?.id || null}
        itemName={selectedItemForStock?.name}
      />

      {/* Stock Ledger View */}
      <StockLedgerView
        open={ledgerViewOpen}
        onOpenChange={setLedgerViewOpen}
        itemId={selectedItemForLedger?.id || null}
        itemName={selectedItemForLedger?.name}
      />
    </Card>
  );
}
