"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Search, Eye, Edit, Trash2, FileText } from "lucide-react";
import { SupplierApiClient } from "~/lib/supplier-utils";
import { type Supplier, type SupplierFilter, SupplierTypeLabels } from "~/server/types/pt-pks/supplier";
import { SupplierType } from "@prisma/client";
import { SupplierViewModal } from "./supplier-view-modal";
import { SupplierEditModal } from "./supplier-edit-modal";
import { SupplierDeleteDialog } from "./supplier-delete-dialog";
import { SupplierSuratPernyataanModal } from "./supplier-surat-pernyataan-modal";
import { SupplierMap } from "~/components/ui/supplier-map";

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<SupplierFilter>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suratPernyataanModalOpen, setSuratPernyataanModalOpen] = useState(false);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await SupplierApiClient.getSuppliers(
        { ...filter, search: searchTerm },
        { page: pagination.page, limit: pagination.limit }
      );

      if (result.success && result.data) {
        setSuppliers(result.data);
        if (result.pagination) {
          setPagination(prev => ({
            ...prev,
            total: result.pagination!.total,
            totalPages: result.pagination!.totalPages
          }));
        }
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof SupplierFilter, value: string | boolean | undefined) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getCertificationBadges = (supplier: Supplier) => {
    const badges = [];
    if (supplier.sertifikasiISPO) badges.push(<Badge key="ispo" variant="outline">ISPO</Badge>);
    if (supplier.sertifikasiRSPO) badges.push(<Badge key="rspo" variant="outline">RSPO</Badge>);
    return badges;
  };

  // Modal handlers
  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditModalOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleSuratPernyataan = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSuratPernyataanModalOpen(true);
  };

  const handleModalSuccess = () => {
    void loadSuppliers(); // Reload the supplier list
    setSelectedSupplier(null);
  };

  const closeModals = () => {
    setSelectedSupplier(null);
    setViewModalOpen(false);
    setEditModalOpen(false);
    setDeleteDialogOpen(false);
    setSuratPernyataanModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Supplier Location Map */}
      <Card>
        <CardHeader>
          <CardTitle>Peta Lokasi Supplier</CardTitle>
          <CardDescription>
            Menampilkan lokasi geografis dari semua supplier yang telah terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierMap suppliers={suppliers} height="450px" />
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Gunakan filter untuk mencari supplier berdasarkan kriteria tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama pemilik, perusahaan, atau nomor form..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={filter.typeSupplier ?? ""} onValueChange={(value) =>
              handleFilterChange("typeSupplier", value === "all" ? undefined : value as SupplierType)
            }>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipe Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value={SupplierType.RAMP_PERON}>Ramp Peron</SelectItem>
                <SelectItem value={SupplierType.KUD}>KUD</SelectItem>
                <SelectItem value={SupplierType.KELOMPOK_TANI}>Kelompok Tani</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.sertifikasiISPO?.toString() ?? ""} onValueChange={(value) =>
              handleFilterChange("sertifikasiISPO", value === "all" ? undefined : value === "true")
            }>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ISPO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="true">Ada ISPO</SelectItem>
                <SelectItem value="false">Tanpa ISPO</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.sertifikasiRSPO?.toString() ?? ""} onValueChange={(value) =>
              handleFilterChange("sertifikasiRSPO", value === "all" ? undefined : value === "true")
            }>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="RSPO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="true">Ada RSPO</SelectItem>
                <SelectItem value="false">Tanpa RSPO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="h-full">
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Supplier</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Badge className="h-4 w-4 bg-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sertifikasi ISPO</p>
                <p className="text-2xl font-bold">{suppliers.filter(s => s.sertifikasiISPO).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-6 h-full flex items-center">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Badge className="h-4 w-4 bg-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sertifikasi RSPO</p>
                <p className="text-2xl font-bold">{suppliers.filter(s => s.sertifikasiRSPO).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Supplier</CardTitle>
          <CardDescription>
            {pagination.total} supplier terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Form</TableHead>
                    <TableHead>Nama Pemilik</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Luas (Ha)</TableHead>
                    <TableHead>Estimasi Supply (Ton)</TableHead>
                    <TableHead>Sertifikasi</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        Tidak ada data supplier
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => {
                      // Extract and calculate totals from profilKebun JSON - handle both single object and array
                      const profilKebun = supplier.profilKebun as any;
                      let totalLuasKebun = 0;
                      let totalEstimasiSupply = 0;

                      if (Array.isArray(profilKebun)) {
                        // Multiple rows - calculate totals
                        totalLuasKebun = profilKebun.reduce((sum: number, row: any) => sum + (row.luasKebun || 0), 0);
                        totalEstimasiSupply = profilKebun.reduce((sum: number, row: any) => sum + (row.estimasiSupply || row.estimasiSupplyTBS || 0), 0);
                      } else if (profilKebun) {
                        // Single object
                        totalLuasKebun = profilKebun.luasKebun || 0;
                        totalEstimasiSupply = profilKebun.estimasiSupply || profilKebun.estimasiSupplyTBS || 0;
                      }

                      return (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">
                            {supplier.nomorForm ?? "-"}
                          </TableCell>
                          <TableCell>{supplier.namaPemilik}</TableCell>
                          <TableCell>{supplier.namaPerusahaan ?? "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {SupplierTypeLabels[supplier.typeSupplier]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {totalLuasKebun > 0 ? `${totalLuasKebun} Ha` : "-"}
                          </TableCell>
                          <TableCell>
                            {totalEstimasiSupply > 0 ? `${totalEstimasiSupply} Ton` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {getCertificationBadges(supplier)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(supplier.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(supplier)}
                                title="Lihat Detail PDF"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(supplier)}
                                title="Edit Supplier"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(supplier)}
                                title="Hapus Supplier"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleSuratPernyataan(supplier)}
                                title="Surat Pernyataan"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} supplier
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, pagination.page - 2);
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SupplierViewModal
        supplier={selectedSupplier}
        isOpen={viewModalOpen}
        onClose={closeModals}
      />

      <SupplierEditModal
        supplier={selectedSupplier}
        isOpen={editModalOpen}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />

      <SupplierDeleteDialog
        supplier={selectedSupplier}
        isOpen={deleteDialogOpen}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />

      <SupplierSuratPernyataanModal
        supplier={selectedSupplier}
        isOpen={suratPernyataanModalOpen}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
