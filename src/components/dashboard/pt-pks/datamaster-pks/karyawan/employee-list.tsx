"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
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
import { Search, Users, Eye, Plus, Settings2, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { FamilyDetailSheet } from "./family-detail-sheet";
import { FamilyFormModal } from "./family-form-modal";
import { EmployeeFormModal } from "./employee-form-modal";
import type { EmployeeListItemDTO } from "~/server/types/pt-pks/karyawan";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [divisiList, setDivisiList] = useState<Array<{ id: string; name: string }>>([]);
  const [jabatanList, setJabatanList] = useState<Array<{ id: string; name: string; divisiId: string }>>([]);
  const [divisiIdFilter, setDivisiIdFilter] = useState<string>("");
  const [jabatanIdFilter, setJabatanIdFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [familyDetailOpen, setFamilyDetailOpen] = useState(false);
  const [familyFormOpen, setFamilyFormOpen] = useState(false);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [columnVisibilityOpen, setColumnVisibilityOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: string;
    nama: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete states
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Column visibility state - default show key columns
  const [visibleColumns, setVisibleColumns] = useState({
    nama: true,
    no_nik_ktp: true,
    jenis_kelamin: false,
    status_kk: false,
    agama: false,
    suku: false,
    golongan_darah: false,
    no_telp_hp: true,
    tempat_lahir: false,
    tanggal_lahir: false,
    umur: false,
    alamat_rt_rw: false,
    alamat_desa: false,
    alamat_kecamatan: false,
    alamat_kabupaten: false,
    alamat_provinsi: false,
    pendidikan_terakhir: false,
    jurusan: false,
    divisiName: true,
    jabatanName: true,
    tgl_masuk_kerja: true,
    tgl_terakhir_kerja: false,
    masa_kerja: false,
    status_pkwt: false,
    no_bpjs_tenaga_kerja: false,
    no_bpjs_kesehatan: false,
    no_npwp: false,
    status_pajak: false,
    no_rekening_bank: false,
    perusahaan_sebelumnya: false,
    familyCount: true,
  });

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(divisiIdFilter && { divisiId: divisiIdFilter }),
        ...(jabatanIdFilter && { jabatanId: jabatanIdFilter }),
      });

      const response = await fetch(`/api/pt-pks/karyawan?${params}`);
      const result = await response.json();

      if (result.success && result.data) {
        setEmployees(result.data.items);
        setPagination((prev) => ({
          ...prev,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchTerm, divisiIdFilter, jabatanIdFilter]);

  // Load divisi list for filter
  useEffect(() => {
    fetch("/api/pt-pks/divisi/active")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setDivisiList(result.data);
        }
      })
      .catch((error) => {
        console.error("Error loading divisi:", error);
      });
  }, []);

  // Load jabatan list when divisi filter is selected
  useEffect(() => {
    if (divisiIdFilter) {
      fetch(`/api/pt-pks/jabatan/active?divisiId=${divisiIdFilter}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            setJabatanList(result.data);
          } else {
            setJabatanList([]);
          }
        })
        .catch((error) => {
          console.error("Error loading jabatan:", error);
          setJabatanList([]);
        });
    } else {
      setJabatanList([]);
      setJabatanIdFilter("");
    }
  }, [divisiIdFilter]);

  useEffect(() => {
    void loadEmployees();
    // Clear selection when pagination or filters change
    setSelectedEmployees(new Set());
  }, [loadEmployees]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewFamily = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setFamilyDetailOpen(true);
  };

  const handleAddFamily = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setFamilyFormOpen(true);
  };

  const handleEdit = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setEmployeeFormOpen(true);
  };

  const handleDeleteClick = (employee: EmployeeListItemDTO) => {
    setEmployeeToDelete({
      id: employee.id_karyawan,
      nama: employee.nama || "Karyawan",
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pt-pks/karyawan?id=${employeeToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Gagal menghapus karyawan");
        return;
      }

      toast.success("Karyawan berhasil dihapus");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      void loadEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Terjadi kesalahan saat menghapus karyawan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(employees.map((emp) => emp.id_karyawan));
      setSelectedEmployees(allIds);
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    const employeeIds = Array.from(selectedEmployees);
    let successCount = 0;
    let failCount = 0;

    try {
      // Delete each employee sequentially
      for (const id of employeeIds) {
        try {
          const response = await fetch(`/api/pt-pks/karyawan?id=${id}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (response.ok && result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error deleting employee ${id}:`, error);
          failCount++;
        }
      }

      // Show result
      if (successCount > 0) {
        toast.success(`${successCount} karyawan berhasil dihapus`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} karyawan gagal dihapus`);
      }

      setSelectedEmployees(new Set());
      setBulkDeleteDialogOpen(false);
      void loadEmployees();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Terjadi kesalahan saat menghapus karyawan");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const closeModals = () => {
    setFamilyDetailOpen(false);
    setFamilyFormOpen(false);
    setEmployeeFormOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleModalSuccess = () => {
    closeModals();
    void loadEmployees();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <>
      {/* Bulk Action Toolbar */}
      {selectedEmployees.size > 0 && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-base">
                  {selectedEmployees.size} karyawan dipilih
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmployees(new Set())}
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
                Hapus {selectedEmployees.size} Karyawan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Filter & Pencarian</CardTitle>
          </div>
          <Button onClick={() => setEmployeeFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Karyawan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIK, divisi, jabatan..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={divisiIdFilter}
              onValueChange={(value) => {
                setDivisiIdFilter(value);
                setJabatanIdFilter("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Divisi</SelectItem>
                {divisiList.map((divisi) => (
                  <SelectItem key={divisi.id} value={divisi.id}>
                    {divisi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={jabatanIdFilter}
              onValueChange={(value) => {
                setJabatanIdFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              disabled={!divisiIdFilter}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={divisiIdFilter ? "Filter Jabatan" : "Pilih divisi dulu"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jabatan</SelectItem>
                {jabatanList.map((jabatan) => (
                  <SelectItem key={jabatan.id} value={jabatan.id}>
                    {jabatan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Karyawan</CardTitle>
            <CardDescription>{pagination.total} karyawan terdaftar</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setColumnVisibilityOpen(!columnVisibilityOpen)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Kolom
          </Button>
        </CardHeader>
        <CardContent>
          {/* Column Visibility Toggle */}
          {columnVisibilityOpen && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="text-sm font-semibold mb-3">Tampilkan Kolom</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">
                      {key.replace(/_/g, " ").replace("tgl", "Tanggal")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          employees.length > 0 && selectedEmployees.size === employees.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {visibleColumns.nama && <TableHead className="min-w-[150px]">Nama</TableHead>}
                    {visibleColumns.no_nik_ktp && <TableHead className="min-w-[120px]">NIK/KTP</TableHead>}
                    {visibleColumns.jenis_kelamin && <TableHead className="min-w-[100px]">Jenis Kelamin</TableHead>}
                    {visibleColumns.status_kk && <TableHead className="min-w-[120px]">Status KK</TableHead>}
                    {visibleColumns.agama && <TableHead className="min-w-[100px]">Agama</TableHead>}
                    {visibleColumns.suku && <TableHead className="min-w-[100px]">Suku</TableHead>}
                    {visibleColumns.golongan_darah && <TableHead className="min-w-[100px]">Gol. Darah</TableHead>}
                    {visibleColumns.no_telp_hp && <TableHead className="min-w-[120px]">No. HP</TableHead>}
                    {visibleColumns.tempat_lahir && <TableHead className="min-w-[120px]">Tempat Lahir</TableHead>}
                    {visibleColumns.tanggal_lahir && <TableHead className="min-w-[120px]">Tanggal Lahir</TableHead>}
                    {visibleColumns.umur && <TableHead className="min-w-[80px]">Umur</TableHead>}
                    {visibleColumns.alamat_rt_rw && <TableHead className="min-w-[100px]">RT/RW</TableHead>}
                    {visibleColumns.alamat_desa && <TableHead className="min-w-[120px]">Desa</TableHead>}
                    {visibleColumns.alamat_kecamatan && <TableHead className="min-w-[120px]">Kecamatan</TableHead>}
                    {visibleColumns.alamat_kabupaten && <TableHead className="min-w-[120px]">Kabupaten</TableHead>}
                    {visibleColumns.alamat_provinsi && <TableHead className="min-w-[120px]">Provinsi</TableHead>}
                    {visibleColumns.pendidikan_terakhir && <TableHead className="min-w-[120px]">Pendidikan</TableHead>}
                    {visibleColumns.jurusan && <TableHead className="min-w-[120px]">Jurusan</TableHead>}
                    {visibleColumns.divisiName && <TableHead className="min-w-[120px]">Divisi</TableHead>}
                    {visibleColumns.jabatanName && <TableHead className="min-w-[120px]">Jabatan</TableHead>}
                    {visibleColumns.tgl_masuk_kerja && <TableHead className="min-w-[120px]">TMK</TableHead>}
                    {visibleColumns.tgl_terakhir_kerja && <TableHead className="min-w-[120px]">Tgl Keluar</TableHead>}
                    {visibleColumns.masa_kerja && <TableHead className="min-w-[120px]">Masa Kerja</TableHead>}
                    {visibleColumns.status_pkwt && <TableHead className="min-w-[100px]">Status PKWT</TableHead>}
                    {visibleColumns.no_bpjs_tenaga_kerja && <TableHead className="min-w-[140px]">BPJS TK</TableHead>}
                    {visibleColumns.no_bpjs_kesehatan && <TableHead className="min-w-[140px]">BPJS Kesehatan</TableHead>}
                    {visibleColumns.no_npwp && <TableHead className="min-w-[140px]">NPWP</TableHead>}
                    {visibleColumns.status_pajak && <TableHead className="min-w-[100px]">Status Pajak</TableHead>}
                    {visibleColumns.no_rekening_bank && <TableHead className="min-w-[140px]">No. Rekening</TableHead>}
                    {visibleColumns.perusahaan_sebelumnya && <TableHead className="min-w-[150px]">Perusahaan Sebelumnya</TableHead>}
                    {visibleColumns.familyCount && <TableHead className="min-w-[100px]">Keluarga</TableHead>}
                    <TableHead className="text-right min-w-[200px] sticky right-0 bg-background">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={50} className="text-center py-8 text-muted-foreground">
                        Tidak ada data karyawan
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id_karyawan}>
                        <TableCell>
                          <Checkbox
                            checked={selectedEmployees.has(employee.id_karyawan)}
                            onCheckedChange={(checked) =>
                              handleSelectEmployee(employee.id_karyawan, checked as boolean)
                            }
                            aria-label={`Select ${employee.nama}`}
                          />
                        </TableCell>
                        {visibleColumns.nama && <TableCell className="font-medium">{employee.nama || "-"}</TableCell>}
                        {visibleColumns.no_nik_ktp && <TableCell>{employee.no_nik_ktp || "-"}</TableCell>}
                        {visibleColumns.jenis_kelamin && <TableCell>{employee.jenis_kelamin === "L" ? "Laki-laki" : employee.jenis_kelamin === "P" ? "Perempuan" : "-"}</TableCell>}
                        {visibleColumns.status_kk && <TableCell>{employee.status_kk || "-"}</TableCell>}
                        {visibleColumns.agama && <TableCell>{employee.agama || "-"}</TableCell>}
                        {visibleColumns.suku && <TableCell>{employee.suku || "-"}</TableCell>}
                        {visibleColumns.golongan_darah && <TableCell>{employee.golongan_darah || "-"}</TableCell>}
                        {visibleColumns.no_telp_hp && <TableCell>{employee.no_telp_hp || "-"}</TableCell>}
                        {visibleColumns.tempat_lahir && <TableCell>{employee.tempat_lahir || "-"}</TableCell>}
                        {visibleColumns.tanggal_lahir && <TableCell>{formatDate(employee.tanggal_lahir)}</TableCell>}
                        {visibleColumns.umur && <TableCell>{employee.umur ?? "-"}</TableCell>}
                        {visibleColumns.alamat_rt_rw && <TableCell>{employee.alamat_rt_rw || "-"}</TableCell>}
                        {visibleColumns.alamat_desa && <TableCell>{employee.alamat_desa || "-"}</TableCell>}
                        {visibleColumns.alamat_kecamatan && <TableCell>{employee.alamat_kecamatan || "-"}</TableCell>}
                        {visibleColumns.alamat_kabupaten && <TableCell>{employee.alamat_kabupaten || "-"}</TableCell>}
                        {visibleColumns.alamat_provinsi && <TableCell>{employee.alamat_provinsi || "-"}</TableCell>}
                        {visibleColumns.pendidikan_terakhir && <TableCell>{employee.pendidikan_terakhir || "-"}</TableCell>}
                        {visibleColumns.jurusan && <TableCell>{employee.jurusan || "-"}</TableCell>}
                        {visibleColumns.divisiName && <TableCell>{employee.divisiName || "-"}</TableCell>}
                        {visibleColumns.jabatanName && <TableCell>{employee.jabatanName || "-"}</TableCell>}
                        {visibleColumns.tgl_masuk_kerja && <TableCell>{formatDate(employee.tgl_masuk_kerja)}</TableCell>}
                        {visibleColumns.tgl_terakhir_kerja && <TableCell>{formatDate(employee.tgl_terakhir_kerja)}</TableCell>}
                        {visibleColumns.masa_kerja && <TableCell>{employee.masa_kerja || "-"}</TableCell>}
                        {visibleColumns.status_pkwt && <TableCell>{employee.status_pkwt || "-"}</TableCell>}
                        {visibleColumns.no_bpjs_tenaga_kerja && <TableCell>{employee.no_bpjs_tenaga_kerja || "-"}</TableCell>}
                        {visibleColumns.no_bpjs_kesehatan && <TableCell>{employee.no_bpjs_kesehatan || "-"}</TableCell>}
                        {visibleColumns.no_npwp && <TableCell>{employee.no_npwp || "-"}</TableCell>}
                        {visibleColumns.status_pajak && <TableCell>{employee.status_pajak || "-"}</TableCell>}
                        {visibleColumns.no_rekening_bank && <TableCell>{employee.no_rekening_bank || "-"}</TableCell>}
                        {visibleColumns.perusahaan_sebelumnya && <TableCell>{employee.perusahaan_sebelumnya || "-"}</TableCell>}
                        {visibleColumns.familyCount && (
                          <TableCell>
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {employee.familyCount}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-right sticky right-0 bg-background">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(employee.id_karyawan)}
                              title="Edit Karyawan"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFamily(employee.id_karyawan)}
                              title="Lihat Detail Keluarga"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddFamily(employee.id_karyawan)}
                              title="Tambah Keluarga"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Keluarga
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(employee)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && employees.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} dari{" "}
                {pagination.total} karyawan
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
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
      <FamilyDetailSheet
        employeeId={selectedEmployeeId}
        isOpen={familyDetailOpen}
        onClose={closeModals}
      />

      <FamilyFormModal
        employeeId={selectedEmployeeId}
        isOpen={familyFormOpen}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />

      <EmployeeFormModal
        open={employeeFormOpen}
        onOpenChange={(open) => {
          setEmployeeFormOpen(open);
          if (!open) setSelectedEmployeeId(null);
        }}
        onSuccess={handleModalSuccess}
        employeeId={selectedEmployeeId}
      />

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus karyawan{" "}
              <span className="font-semibold">{employeeToDelete?.nama}</span>?
              <br />
              <span className="text-red-600">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data keluarga
                terkait.
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
              <span className="font-semibold">{selectedEmployees.size} karyawan</span> yang
              dipilih?
              <br />
              <span className="text-red-600 font-semibold">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data keluarga
                terkait dari {selectedEmployees.size} karyawan tersebut.
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
              {isBulkDeleting ? "Menghapus..." : `Hapus ${selectedEmployees.size} Karyawan`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

