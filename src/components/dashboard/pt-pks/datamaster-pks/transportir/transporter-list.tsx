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
import { Search, Eye, Plus, Loader2, Trash2, Truck, Users, Pencil, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { TransporterEditModal } from "./transporter-edit-modal";

interface Transporter {
  id: string;
  type: "PERUSAHAAN" | "PERORANGAN";
  legalName: string;
  tradeName?: string | null;
  npwp?: string | null;
  pkpStatus: "NON_PKP" | "PKP_11" | "PKP_1_1";
  city?: string | null;
  province?: string | null;
  picName?: string | null;
  picPhone?: string | null;
  status: "AKTIF" | "NONAKTIF";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles?: any[];
  drivers?: any[];
}

interface TransporterListResponse {
  success: boolean;
  data: Transporter[];
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
  PERUSAHAAN: "Perusahaan",
  PERORANGAN: "Perorangan",
};

const pkpLabels = {
  NON_PKP: "Non PKP",
  PKP_11: "PKP 11%",
  PKP_1_1: "PKP 1.1%",
};

const statusLabels = {
  AKTIF: "Aktif",
  NONAKTIF: "Nonaktif",
};

const statusVariants = {
  AKTIF: "default" as const,
  NONAKTIF: "destructive" as const,
};

export function TransporterList() {
  const router = useRouter();
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [pkpFilter, setPkpFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // Selection states
  const [selectedTransporters, setSelectedTransporters] = useState<Set<string>>(new Set());

  // Toggle status states
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [transporterToToggle, setTransporterToToggle] = useState<{ id: string; name: string; status: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Delete states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transporterToDelete, setTransporterToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete states
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [transporterToEdit, setTransporterToEdit] = useState<string | null>(null);

  const loadTransporters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (searchTerm) params.append("query", searchTerm);
      if (typeFilter) params.append("type", typeFilter);
      if (pkpFilter) params.append("pkpStatus", pkpFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (cityFilter) params.append("city", cityFilter);

  const response = await fetch(`/api/pt-pks/transporters?${params.toString()}`);
  const result: TransporterListResponse = await response.json();

      if (result.success && result.data) {
        setTransporters(result.data);
        setPagination((prev) => ({
          ...prev,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        }));
      } else {
        toast.error("Gagal memuat data transportir");
      }
    } catch (error) {
      console.error("Error loading transporters:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter, pkpFilter, statusFilter, cityFilter, pagination.page, pagination.pageSize]);

  useEffect(() => {
    void loadTransporters();
  }, [loadTransporters]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(transporters.map((t) => t.id));
      setSelectedTransporters(allIds);
    } else {
      setSelectedTransporters(new Set());
    }
  };

  const handleSelectTransporter = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedTransporters);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedTransporters(newSelection);
  };

  // Edit handlers
  const handleEdit = (id: string) => {
    setTransporterToEdit(id);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    void loadTransporters();
    setEditModalOpen(false);
    setTransporterToEdit(null);
  };

  // Toggle status
  const handleToggleStatus = async () => {
    if (!transporterToToggle) return;

    setIsToggling(true);
    try {
      const response = await fetch(`/api/pt-pks/transporters/${transporterToToggle.id}/toggle-status`, {
        method: "PATCH",
      });

      const result = await response.json();

      if (result.success) {
        const action = transporterToToggle.status === "AKTIF" ? "dinonaktifkan" : "diaktifkan";
        toast.success(`Transportir berhasil ${action}`);
        void loadTransporters();
      } else {
        toast.error(result.error || "Gagal mengubah status transportir");
      }
    } catch (error) {
      console.error("Error toggling transporter status:", error);
      toast.error("Terjadi kesalahan saat mengubah status transportir");
    } finally {
      setIsToggling(false);
      setToggleDialogOpen(false);
      setTransporterToToggle(null);
    }
  };

  // Delete single (hard delete)
  const handleDelete = async () => {
    if (!transporterToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pt-pks/transporters/${transporterToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Transportir berhasil dihapus");
        void loadTransporters();
        // Remove from selection if selected
        setSelectedTransporters((prev) => {
          const newSet = new Set(prev);
          newSet.delete(transporterToDelete.id);
          return newSet;
        });
      } else {
        toast.error(result.error || "Gagal menghapus transportir");
      }
    } catch (error) {
      console.error("Error deleting transporter:", error);
      toast.error("Terjadi kesalahan saat menghapus transportir");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTransporterToDelete(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedTransporters.size === 0) return;

    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    // Delete sequentially
    for (const id of Array.from(selectedTransporters)) {
      try {
        const response = await fetch(`/api/pt-pks/transporters/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Error deleting transporter ${id}:`, error);
        failCount++;
      }
    }

    // Show result
    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount} transportir berhasil dihapus`);
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`${successCount} transportir berhasil dihapus, ${failCount} gagal dihapus`);
    } else {
      toast.error("Gagal menghapus transportir");
    }

    // Reload and reset selection
    void loadTransporters();
    setSelectedTransporters(new Set());
    setIsBulkDeleting(false);
    setBulkDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Toolbar */}
      {selectedTransporters.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-900">
                {selectedTransporters.size} transportir dipilih
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransporters(new Set())}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Semua
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Data Transportir</CardTitle>
              <CardDescription>Kelola data transportir dan armada</CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/pt-pks/datamaster/transportir/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transportir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 space-y-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NPWP, plat..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={typeFilter || undefined} onValueChange={(value) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERUSAHAAN">Perusahaan</SelectItem>
                  <SelectItem value="PERORANGAN">Perorangan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={pkpFilter || undefined} onValueChange={(value) => setPkpFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua PKP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NON_PKP">Non PKP</SelectItem>
                  <SelectItem value="PKP_11">PKP 11%</SelectItem>
                  <SelectItem value="PKP_1_1">PKP 1.1%</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || undefined} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">Aktif</SelectItem>
                  <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter Kota"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
            {(searchTerm || typeFilter || pkpFilter || statusFilter || cityFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("");
                  setPkpFilter("");
                  setStatusFilter("");
                  setCityFilter("");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transporters.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Tidak ada data transportir
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selectedTransporters.size === transporters.length && transporters.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead>Nama Legal</TableHead>
                      <TableHead>Nama Dagang</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>PKP</TableHead>
                      <TableHead>NPWP</TableHead>
                      <TableHead>PIC</TableHead>
                      <TableHead>Kota/Provinsi</TableHead>
                      <TableHead className="text-center">Armada</TableHead>
                      <TableHead className="text-center">Sopir</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transporters.map((transporter) => (
                      <TableRow key={transporter.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTransporters.has(transporter.id)}
                            onCheckedChange={(checked) =>
                              handleSelectTransporter(transporter.id, checked as boolean)
                            }
                            aria-label={`Pilih ${transporter.legalName}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{transporter.legalName}</TableCell>
                        <TableCell>{transporter.tradeName || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeLabels[transporter.type]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pkpLabels[transporter.pkpStatus]}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{transporter.npwp || "-"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{transporter.picName || "-"}</div>
                            <div className="text-muted-foreground">{transporter.picPhone || ""}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{transporter.city || "-"}</div>
                            <div className="text-muted-foreground">{transporter.province || ""}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>{transporter.vehicles?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{transporter.drivers?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[transporter.status]}>
                            {statusLabels[transporter.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(transporter.id)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/pt-pks/datamaster/transportir/${transporter.id}`)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTransporterToToggle({
                                  id: transporter.id,
                                  name: transporter.legalName,
                                  status: transporter.status,
                                });
                                setToggleDialogOpen(true);
                              }}
                              title={transporter.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}
                            >
                              {transporter.status === "AKTIF" ? (
                                <PowerOff className="h-4 w-4 text-orange-600" />
                              ) : (
                                <Power className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTransporterToDelete({ id: transporter.id, name: transporter.legalName });
                                setDeleteDialogOpen(true);
                              }}
                              title="Hapus Permanen"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)} dari {pagination.total} data
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {transporterToToggle?.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"} Transportir?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin{" "}
              {transporterToToggle?.status === "AKTIF" ? "menonaktifkan" : "mengaktifkan"} transportir{" "}
              <strong>{transporterToToggle?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} disabled={isToggling}>
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : transporterToToggle?.status === "AKTIF" ? (
                "Nonaktifkan"
              ) : (
                "Aktifkan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transportir Permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transportir <strong>{transporterToDelete?.name}</strong>{" "}
              <strong className="text-destructive">secara permanen</strong>?
              <br />
              <br />
              ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait (armada, pengemudi, tarif, kontrak).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Permanen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedTransporters.size} Transportir Permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedTransporters.size} transportir</strong> yang dipilih{" "}
              <strong className="text-destructive">secara permanen</strong>?
              <br />
              <br />
              ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait untuk setiap transportir (armada, pengemudi, tarif, kontrak).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Semua Permanen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <TransporterEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        transporterId={transporterToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

