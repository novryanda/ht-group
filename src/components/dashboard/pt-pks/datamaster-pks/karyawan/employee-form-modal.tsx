"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2 } from "lucide-react";

// ============================================================================
// FORM SCHEMA
// ============================================================================

const employeeFormSchema = z.object({
  // Required fields
  nama: z.string().min(1, "Nama wajib diisi").max(100),
  jenis_kelamin: z.enum(["L", "P"]),
  no_nik_ktp: z.string().min(1, "NIK/KTP wajib diisi").max(20),

  // Optional fields
  status_kk: z.string().max(50).optional(),
  agama: z.string().max(30).optional(),
  suku: z.string().max(50).optional(),
  golongan_darah: z.string().max(5).optional(),
  no_telp_hp: z.string().max(20).optional(),
  tempat_lahir: z.string().max(50).optional(),
  tanggal_lahir: z.string().optional(), // ISO date string
  umur: z.coerce.number().int().min(0).max(150).optional().or(z.literal("")),
  alamat_rt_rw: z.string().max(20).optional(),
  alamat_desa: z.string().max(100).optional(),
  alamat_kecamatan: z.string().max(100).optional(),
  alamat_kabupaten: z.string().max(100).optional(),
  alamat_provinsi: z.string().max(100).optional(),
  pendidikan_terakhir: z.string().max(50).optional(),
  jurusan: z.string().max(100).optional(),
  divisiId: z.string().optional(),
  jabatanId: z.string().optional(),
  tgl_masuk_kerja: z.string().optional(), // ISO date string
  tgl_terakhir_kerja: z.string().optional(), // ISO date string
  masa_kerja: z.string().max(50).optional(),
  status_pkwt: z.string().max(50).optional(),
  no_bpjs_tenaga_kerja: z.string().max(50).optional(),
  no_bpjs_kesehatan: z.string().max(50).optional(),
  no_npwp: z.string().max(50).optional(),
  status_pajak: z.string().max(20).optional(),
  no_rekening_bank: z.string().max(50).optional(),
  perusahaan_sebelumnya: z.string().max(100).optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  employeeId?: string | null; // If provided, it's edit mode
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmployeeFormModal({ open, onOpenChange, onSuccess, employeeId }: EmployeeFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [divisiList, setDivisiList] = useState<Array<{ id: string; name: string }>>([]);
  const [jabatanList, setJabatanList] = useState<Array<{ id: string; name: string; divisiId: string }>>([]);
  const isEditMode = !!employeeId;

  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      nama: "",
      jenis_kelamin: undefined,
      no_nik_ktp: "",
      status_kk: "",
      agama: "",
      suku: "",
      golongan_darah: "",
      no_telp_hp: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      umur: "",
      alamat_rt_rw: "",
      alamat_desa: "",
      alamat_kecamatan: "",
      alamat_kabupaten: "",
      alamat_provinsi: "",
      pendidikan_terakhir: "",
      jurusan: "",
      divisiId: "",
      jabatanId: "",
      tgl_masuk_kerja: "",
      tgl_terakhir_kerja: "",
      masa_kerja: "",
      status_pkwt: "",
      no_bpjs_tenaga_kerja: "",
      no_bpjs_kesehatan: "",
      no_npwp: "",
      status_pajak: "",
      no_rekening_bank: "",
      perusahaan_sebelumnya: "",
    },
  });

  // Load divisi list
  useEffect(() => {
    if (open) {
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
    }
  }, [open]);

  // Load jabatan list when divisi is selected
  const selectedDivisiId = form.watch("divisiId");
  useEffect(() => {
    if (selectedDivisiId) {
      fetch(`/api/pt-pks/jabatan/active?divisiId=${selectedDivisiId}`)
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
      form.setValue("jabatanId", "");
    }
  }, [selectedDivisiId, form]);

  // Load employee data in edit mode
  useEffect(() => {
    if (open && isEditMode && employeeId) {
      setIsLoadingData(true);
      fetch(`/api/pt-pks/karyawan/${employeeId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            const emp = result.data.employee;
            // Format dates for input[type="date"]
            const formatDateForInput = (date: string | null) => {
              if (!date) return "";
              return new Date(date).toISOString().split("T")[0];
            };

            form.reset({
              nama: emp.nama || "",
              jenis_kelamin: emp.jenis_kelamin || undefined,
              no_nik_ktp: emp.no_nik_ktp || "",
              status_kk: emp.status_kk || "",
              agama: emp.agama || "",
              suku: emp.suku || "",
              golongan_darah: emp.golongan_darah || "",
              no_telp_hp: emp.no_telp_hp || "",
              tempat_lahir: emp.tempat_lahir || "",
              tanggal_lahir: formatDateForInput(emp.tanggal_lahir),
              umur: emp.umur ?? "",
              alamat_rt_rw: emp.alamat_rt_rw || "",
              alamat_desa: emp.alamat_desa || "",
              alamat_kecamatan: emp.alamat_kecamatan || "",
              alamat_kabupaten: emp.alamat_kabupaten || "",
              alamat_provinsi: emp.alamat_provinsi || "",
              pendidikan_terakhir: emp.pendidikan_terakhir || "",
              jurusan: emp.jurusan || "",
              divisiId: emp.divisiId || "",
              jabatanId: emp.jabatanId || "",
              tgl_masuk_kerja: formatDateForInput(emp.tgl_masuk_kerja),
              tgl_terakhir_kerja: formatDateForInput(emp.tgl_terakhir_kerja),
              masa_kerja: emp.masa_kerja || "",
              status_pkwt: emp.status_pkwt || "",
              no_bpjs_tenaga_kerja: emp.no_bpjs_tenaga_kerja || "",
              no_bpjs_kesehatan: emp.no_bpjs_kesehatan || "",
              no_npwp: emp.no_npwp || "",
              status_pajak: emp.status_pajak || "",
              no_rekening_bank: emp.no_rekening_bank || "",
              perusahaan_sebelumnya: emp.perusahaan_sebelumnya || "",
            });
          }
        })
        .catch((error) => {
          console.error("Error loading employee:", error);
          toast.error("Gagal memuat data karyawan");
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    } else if (open && !isEditMode) {
      // Reset form when opening in create mode
      form.reset();
    }
  }, [open, isEditMode, employeeId, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);

    try {
      const url = isEditMode
        ? `/api/pt-pks/karyawan?id=${employeeId}`
        : "/api/pt-pks/karyawan";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || `Gagal ${isEditMode ? "memperbarui" : "menambahkan"} karyawan`);
        return;
      }

      toast.success(`Karyawan berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`);
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error(`Terjadi kesalahan saat ${isEditMode ? "memperbarui" : "menambahkan"} karyawan`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Karyawan" : "Tambah Karyawan Baru"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Perbarui data karyawan. Field bertanda * wajib diisi."
              : "Isi data karyawan baru. Field bertanda * wajib diisi."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Data Pribadi */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Data Pribadi</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  {...form.register("nama")}
                  placeholder="Masukkan nama lengkap"
                />
                {form.formState.errors.nama && (
                  <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin">Jenis Kelamin *</Label>
                <Select
                  value={form.watch("jenis_kelamin")}
                  onValueChange={(value) => form.setValue("jenis_kelamin", value as "L" | "P")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.jenis_kelamin && (
                  <p className="text-sm text-red-500">{form.formState.errors.jenis_kelamin.message}</p>
                )}
              </div>

              {/* NIK/KTP */}
              <div className="space-y-2">
                <Label htmlFor="no_nik_ktp">NIK/KTP *</Label>
                <Input
                  id="no_nik_ktp"
                  {...form.register("no_nik_ktp")}
                  placeholder="Masukkan NIK/KTP"
                />
                {form.formState.errors.no_nik_ktp && (
                  <p className="text-sm text-red-500">{form.formState.errors.no_nik_ktp.message}</p>
                )}
              </div>

              {/* Status KK */}
              <div className="space-y-2">
                <Label htmlFor="status_kk">Status KK</Label>
                <Input
                  id="status_kk"
                  {...form.register("status_kk")}
                  placeholder="Kepala Keluarga / Anggota"
                />
              </div>

              {/* Agama */}
              <div className="space-y-2">
                <Label htmlFor="agama">Agama</Label>
                <Input id="agama" {...form.register("agama")} placeholder="Masukkan agama" />
              </div>

              {/* Suku */}
              <div className="space-y-2">
                <Label htmlFor="suku">Suku</Label>
                <Input id="suku" {...form.register("suku")} placeholder="Masukkan suku" />
              </div>

              {/* Golongan Darah */}
              <div className="space-y-2">
                <Label htmlFor="golongan_darah">Golongan Darah</Label>
                <Input
                  id="golongan_darah"
                  {...form.register("golongan_darah")}
                  placeholder="A / B / AB / O"
                />
              </div>

              {/* No Telp/HP */}
              <div className="space-y-2">
                <Label htmlFor="no_telp_hp">No. Telp/HP</Label>
                <Input
                  id="no_telp_hp"
                  {...form.register("no_telp_hp")}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* Tempat Lahir */}
              <div className="space-y-2">
                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                <Input
                  id="tempat_lahir"
                  {...form.register("tempat_lahir")}
                  placeholder="Masukkan tempat lahir"
                />
              </div>

              {/* Tanggal Lahir */}
              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <Input id="tanggal_lahir" type="date" {...form.register("tanggal_lahir")} />
              </div>

              {/* Umur */}
              <div className="space-y-2">
                <Label htmlFor="umur">Umur</Label>
                <Input
                  id="umur"
                  type="number"
                  {...form.register("umur")}
                  placeholder="Masukkan umur"
                />
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Alamat</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alamat_rt_rw">RT/RW</Label>
                <Input
                  id="alamat_rt_rw"
                  {...form.register("alamat_rt_rw")}
                  placeholder="001/002"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat_desa">Desa/Kelurahan</Label>
                <Input id="alamat_desa" {...form.register("alamat_desa")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat_kecamatan">Kecamatan</Label>
                <Input id="alamat_kecamatan" {...form.register("alamat_kecamatan")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat_kabupaten">Kabupaten/Kota</Label>
                <Input id="alamat_kabupaten" {...form.register("alamat_kabupaten")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat_provinsi">Provinsi</Label>
                <Input id="alamat_provinsi" {...form.register("alamat_provinsi")} />
              </div>
            </div>
          </div>

          {/* Pendidikan */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Pendidikan</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pendidikan_terakhir">Pendidikan Terakhir</Label>
                <Input
                  id="pendidikan_terakhir"
                  {...form.register("pendidikan_terakhir")}
                  placeholder="SD / SMP / SMA / D3 / S1 / S2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan</Label>
                <Input id="jurusan" {...form.register("jurusan")} placeholder="Masukkan jurusan" />
              </div>
            </div>
          </div>

          {/* Pekerjaan */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Data Pekerjaan</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Divisi - SELECT */}
              <div className="space-y-2">
                <Label htmlFor="divisiId">Divisi</Label>
                <Select
                  value={form.watch("divisiId")}
                  onValueChange={(value) => {
                    form.setValue("divisiId", value);
                    form.setValue("jabatanId", ""); // Reset jabatan when divisi changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Placeholder handled by SelectValue, do not add empty value item */}
                    {divisiList.map((divisi) => (
                      <SelectItem key={divisi.id} value={divisi.id}>
                        {divisi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jabatan - SELECT (depends on divisi) */}
              <div className="space-y-2">
                <Label htmlFor="jabatanId">Jabatan</Label>
                <Select
                  value={form.watch("jabatanId")}
                  onValueChange={(value) => form.setValue("jabatanId", value)}
                  disabled={!selectedDivisiId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedDivisiId ? "Pilih jabatan" : "Pilih divisi terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Placeholder handled by SelectValue, do not add empty value item */}
                    {jabatanList.map((jabatan) => (
                      <SelectItem key={jabatan.id} value={jabatan.id}>
                        {jabatan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedDivisiId && (
                  <p className="text-xs text-muted-foreground">Pilih divisi terlebih dahulu</p>
                )}
              </div>

              {/* Tanggal Masuk Kerja */}
              <div className="space-y-2">
                <Label htmlFor="tgl_masuk_kerja">Tanggal Masuk Kerja</Label>
                <Input id="tgl_masuk_kerja" type="date" {...form.register("tgl_masuk_kerja")} />
              </div>

              {/* Tanggal Terakhir Kerja */}
              <div className="space-y-2">
                <Label htmlFor="tgl_terakhir_kerja">Tanggal Terakhir Kerja</Label>
                <Input id="tgl_terakhir_kerja" type="date" {...form.register("tgl_terakhir_kerja")} />
              </div>

              {/* Masa Kerja */}
              <div className="space-y-2">
                <Label htmlFor="masa_kerja">Masa Kerja</Label>
                <Input
                  id="masa_kerja"
                  {...form.register("masa_kerja")}
                  placeholder="5 tahun 3 bulan"
                />
              </div>

              {/* Status PKWT */}
              <div className="space-y-2">
                <Label htmlFor="status_pkwt">Status PKWT</Label>
                <Input
                  id="status_pkwt"
                  {...form.register("status_pkwt")}
                  placeholder="PKWT / PKWTT"
                />
              </div>

              {/* Perusahaan Sebelumnya */}
              <div className="space-y-2">
                <Label htmlFor="perusahaan_sebelumnya">Perusahaan Sebelumnya</Label>
                <Input
                  id="perusahaan_sebelumnya"
                  {...form.register("perusahaan_sebelumnya")}
                  placeholder="Nama perusahaan"
                />
              </div>
            </div>
          </div>

          {/* Data Administrasi */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Data Administrasi</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="no_bpjs_tenaga_kerja">No. BPJS Ketenagakerjaan</Label>
                <Input
                  id="no_bpjs_tenaga_kerja"
                  {...form.register("no_bpjs_tenaga_kerja")}
                  placeholder="Masukkan no. BPJS TK"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_bpjs_kesehatan">No. BPJS Kesehatan</Label>
                <Input
                  id="no_bpjs_kesehatan"
                  {...form.register("no_bpjs_kesehatan")}
                  placeholder="Masukkan no. BPJS Kesehatan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_npwp">No. NPWP</Label>
                <Input id="no_npwp" {...form.register("no_npwp")} placeholder="Masukkan no. NPWP" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_pajak">Status Pajak</Label>
                <Input
                  id="status_pajak"
                  {...form.register("status_pajak")}
                  placeholder="TK/0, K/1, dll"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_rekening_bank">No. Rekening Bank</Label>
                <Input
                  id="no_rekening_bank"
                  {...form.register("no_rekening_bank")}
                  placeholder="Masukkan no. rekening"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

