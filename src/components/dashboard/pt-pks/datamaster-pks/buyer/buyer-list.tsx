"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
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
import { Search, Eye, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BuyerEditModal } from "./buyer-edit-modal";

interface Buyer {
  id: string;
  buyerCode: string;
  type: "COMPANY" | "PERSON";
  legalName: string;
  tradeName?: string | null;
  npwp?: string | null;
  pkpStatus: "NON_PKP" | "PKP_11" | "PKP_1_1";
  city: string;
  province: string;
  status: "DRAFT" | "VERIFIED" | "INACTIVE";
  billingEmail: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface BuyerListResponse {
  success: boolean;
  data: Buyer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const typeLabels = {
  COMPANY: "Perusahaan",
  PERSON: "Perorangan",
};

const pkpLabels = {
  NON_PKP: "Non PKP",
  PKP_11: "PKP 11%",
  PKP_1_1: "PKP 1.1%",
};

const statusLabels = {
  DRAFT: "Draft",
  VERIFIED: "Terverifikasi",
  INACTIVE: "Tidak Aktif",
};

const statusVariants = {
  DRAFT: "secondary" as const,
  VERIFIED: "default" as const,
  INACTIVE: "destructive" as const,
};

export function BuyerList() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [buyerToEdit, setBuyerToEdit] = useState<string | null>(null);

  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buyerToDelete, setBuyerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete states
  const [selectedBuyers, setSelectedBuyers] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadBuyers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (searchTerm) params.append("query", searchTerm);
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/pt-pks/buyers?${params.toString()}`);
      const result: BuyerListResponse = await response.json();

      if (result.success && result.data) {
        setBuyers(result.data);
        setPagination((prev) => ({
          ...prev,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        }));
      } else {
        toast.error("Gagal memuat data buyer");
      }
    } catch (error) {
      console.error("Error loading buyers:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter, pagination.page, pagination.pageSize]);

  useEffect(() => {
    void loadBuyers();
    // Clear selection when pagination or filters change
    setSelectedBuyers(new Set());
  }, [loadBuyers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDetail = (buyerId: string) => {
    router.push(`/dashboard/pt-pks/datamaster/buyer/${buyerId}`);
  };

  const handleEdit = (buyerId: string) => {
    setBuyerToEdit(buyerId);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setBuyerToEdit(null);
    void loadBuyers();
  };

  const handleDeleteClick = (buyer: Buyer) => {
    setBuyerToDelete({
      id: buyer.id,
      name: buyer.tradeName || buyer.legalName,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!buyerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pt-pks/buyers/${buyerToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Gagal menghapus buyer");
        return;
      }

      toast.success("Buyer berhasil dihapus");
      setDeleteDialogOpen(false);
      setBuyerToDelete(null);
      void loadBuyers();
    } catch (error) {
      console.error("Error deleting buyer:", error);
      toast.error("Terjadi kesalahan saat menghapus buyer");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(buyers.map((buyer) => buyer.id));
      setSelectedBuyers(allIds);
    } else {
      setSelectedBuyers(new Set());
    }
  };

  const handleSelectBuyer = (buyerId: string, checked: boolean) => {
    const newSelected = new Set(selectedBuyers);
    if (checked) {
      newSelected.add(buyerId);
    } else {
      newSelected.delete(buyerId);
    }
    setSelectedBuyers(newSelected);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    const buyerIds = Array.from(selectedBuyers);
    let successCount = 0;
    let failCount = 0;

    try {
      // Delete each buyer sequentially
      for (const id of buyerIds) {
        try {
          const response = await fetch(`/api/pt-pks/buyers/${id}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (response.ok && result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error deleting buyer ${id}:`, error);
          failCount++;
        }
      }

      // Show result
      if (successCount > 0) {
        toast.success(`${successCount} buyer berhasil dihapus`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} buyer gagal dihapus`);
      }

      setSelectedBuyers(new Set());
      setBulkDeleteDialogOpen(false);
      void loadBuyers();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Terjadi kesalahan saat menghapus buyer");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCreateNew = () => {
    router.push("/dashboard/pt-pks/datamaster/buyer/new");
  };

  return (
    <>
      {/* Bulk Action Toolbar */}
      {selectedBuyers.size > 0 && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-base">
                  {selectedBuyers.size} buyer dipilih
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBuyers(new Set())}
                >
                  Batalkan Pilihan
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus {selectedBuyers.size} Buyer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Buyer</CardTitle>
              <CardDescription>
                Kelola data buyer untuk transaksi penjualan
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Buyer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kode, nama, NPWP..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter || "all"} onValueChange={handleTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="COMPANY">Perusahaan</SelectItem>
              <SelectItem value="PERSON">Perorangan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : buyers.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Tidak ada data buyer
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          buyers.length > 0 && selectedBuyers.size === buyers.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>NPWP</TableHead>
                    <TableHead>PKP</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.map((buyer) => (
                    <TableRow key={buyer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBuyers.has(buyer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectBuyer(buyer.id, checked as boolean)
                          }
                          aria-label={`Select ${buyer.legalName}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{buyer.buyerCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{buyer.legalName}</div>
                          {buyer.tradeName && (
                            <div className="text-sm text-muted-foreground">
                              {buyer.tradeName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabels[buyer.type]}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {buyer.npwp || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pkpLabels[buyer.pkpStatus]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {buyer.city}, {buyer.province}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[buyer.status]}>
                          {statusLabels[buyer.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(buyer.id)}
                            title="Edit Buyer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(buyer.id)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(buyer)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus Buyer"
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
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} dari{" "}
                {pagination.total} buyer
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus buyer{" "}
              <span className="font-semibold">{buyerToDelete?.name}</span>?
              <br />
              <span className="text-red-600">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Multiple</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold">{selectedBuyers.size} buyer</span> yang
              dipilih?
              <br />
              <span className="text-red-600 font-semibold">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus {selectedBuyers.size} buyer
                tersebut.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? "Menghapus..." : `Hapus ${selectedBuyers.size} Buyer`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <BuyerEditModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setBuyerToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        buyerId={buyerToEdit}
      />
    </>
  );
}

