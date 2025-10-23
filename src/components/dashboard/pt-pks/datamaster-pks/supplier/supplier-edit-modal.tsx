import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Save, Plus, Trash2, X } from "lucide-react";
import { SupplierType } from "@prisma/client";
import { SupplierApiClient } from "~/lib/supplier-utils";
import { type Supplier, type ProfilKebunItem } from "~/server/types/pt-pks/supplier";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { PajakPKP } from "@prisma/client";
import { PajakPKPLabels } from "~/server/types/pt-pks/supplier";

// Form schema for editing - make it more flexible
const editSupplierSchema = z.object({
  typeSupplier: z.enum([SupplierType.RAMP_PERON, SupplierType.KUD, SupplierType.KELOMPOK_TANI]),
  pajakPKP: z.enum([PajakPKP.PKP_11_PERSEN, PajakPKP.PKP_1_1_PERSEN, PajakPKP.NON_PKP]),

  // IDENTITAS
  namaPemilik: z.string().min(1, "Nama pemilik wajib diisi"),
  alamatPemilik: z.string().optional().or(z.literal("")),
  hpPemilik: z.string().optional().or(z.literal("")),
  namaPerusahaan: z.string().optional().or(z.literal("")),
  alamatRampPeron: z.string().optional().or(z.literal("")),
  hpPerusahaan: z.string().optional().or(z.literal("")),
  bujur: z.string().optional().or(z.literal("")),
  lintang: z.string().optional().or(z.literal("")),

  // TIPE PENGELOLAAN
  pengelolaanSwadaya: z.string().optional().or(z.literal("")),
  pengelolaanKelompok: z.string().optional().or(z.literal("")),
  pengelolaanPerusahaan: z.string().optional().or(z.literal("")),
  jenisBibit: z.string().optional().or(z.literal("")),
  sertifikasiISPO: z.boolean(),
  sertifikasiRSPO: z.boolean(),

  // PROFIL IZIN USAHA
  aktePendirian: z.string().optional().or(z.literal("")),
  aktePerubahan: z.string().optional().or(z.literal("")),
  nib: z.string().optional().or(z.literal("")),
  siup: z.string().optional().or(z.literal("")),
  npwp: z.string().optional().or(z.literal("")),

  // PENJUALAN TBS
  penjualanLangsungPKS: z.string().optional().or(z.literal("")),
  penjualanAgen: z.string().optional().or(z.literal("")),

  // TRANSPORTASI
  transportMilikSendiri: z.number().int().min(0).optional(),
  transportPihak3: z.number().int().min(0).optional(),
});

type EditSupplierFormData = z.infer<typeof editSupplierSchema>;

interface SupplierEditModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupplierEditModal({ supplier, isOpen, onClose, onSuccess }: SupplierEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilKebunRows, setProfilKebunRows] = useState<ProfilKebunItem[]>([
    { tahunTanam: "", luasKebun: 0, estimasiSupplyTBS: 0 }
  ]);

  const form = useForm<EditSupplierFormData>({
    resolver: zodResolver(editSupplierSchema),
    defaultValues: {
      typeSupplier: SupplierType.RAMP_PERON,
      pajakPKP: PajakPKP.NON_PKP,
      sertifikasiISPO: false,
      sertifikasiRSPO: false,
      transportMilikSendiri: 0,
      transportPihak3: 0,
    }
  });

  // Load supplier data when modal opens
  useEffect(() => {
    if (supplier && isOpen) {
      // Reset form with supplier data
      form.reset({
        typeSupplier: supplier.typeSupplier,
        pajakPKP: supplier.pajakPKP || PajakPKP.NON_PKP,
        namaPemilik: supplier.namaPemilik,
        alamatPemilik: supplier.alamatPemilik || "",
        hpPemilik: supplier.hpPemilik || "",
        namaPerusahaan: supplier.namaPerusahaan || "",
        alamatRampPeron: supplier.alamatRampPeron || "",
        hpPerusahaan: supplier.hpPerusahaan || "",
        bujur: supplier.bujur || "",
        lintang: supplier.lintang || "",
        pengelolaanSwadaya: supplier.pengelolaanSwadaya || "",
        pengelolaanKelompok: supplier.pengelolaanKelompok || "",
        pengelolaanPerusahaan: supplier.pengelolaanPerusahaan || "",
        jenisBibit: supplier.jenisBibit || "",
        sertifikasiISPO: supplier.sertifikasiISPO,
        sertifikasiRSPO: supplier.sertifikasiRSPO,
        aktePendirian: supplier.aktePendirian || "",
        aktePerubahan: supplier.aktePerubahan || "",
        nib: supplier.nib || "",
        siup: supplier.siup || "",
        npwp: supplier.npwp || "",
        penjualanLangsungPKS: supplier.penjualanLangsungPKS || "",
        penjualanAgen: supplier.penjualanAgen || "",
        transportMilikSendiri: supplier.transportMilikSendiri || 0,
        transportPihak3: supplier.transportPihak3 || 0,
      });

      // Convert profilKebun to match supplier-form structure
      if (supplier.profilKebun) {
        if (Array.isArray(supplier.profilKebun)) {
          setProfilKebunRows(
            supplier.profilKebun.map((row: any) => ({
              id: row.id,
              tahunTanam: row.tahunTanam || "",
              luasKebun: row.luasKebun || 0,
              estimasiSupplyTBS: row.estimasiSupplyTBS || row.estimasiSupply || 0,
              koordinat: row.koordinat,
            }))
          );
        } else {
          // Handle single object case
          const row: any = supplier.profilKebun;
          setProfilKebunRows([{
            id: row.id,
            tahunTanam: row.tahunTanam || "",
            luasKebun: row.luasKebun || 0,
            estimasiSupplyTBS: row.estimasiSupplyTBS || row.estimasiSupply || 0,
            koordinat: row.koordinat,
          }]);
        }
      } else {
        setProfilKebunRows([{ tahunTanam: "", luasKebun: 0, estimasiSupplyTBS: 0 }]);
      }
    }
  }, [supplier, isOpen, form]);

  const onSubmit = async (data: EditSupplierFormData) => {
    console.log("=== SUBMIT BUTTON CLICKED ===");
    console.log("Supplier data:", supplier);
    console.log("Form data received:", data);
    console.log("isSubmitting state:", isSubmitting);

    if (!supplier) {
      console.log("❌ No supplier data available");
      alert("Error: Data supplier tidak tersedia");
      return;
    }

    console.log("✅ Supplier ID:", supplier.id);
    setIsSubmitting(true);

    try {
      const updateData = {
        ...data,
        // Handle profilKebun properly - convert rows to the format API expects
        profilKebun: (() => {
          const validRows = profilKebunRows.filter(row =>
            row.tahunTanam &&
            row.tahunTanam.trim() !== "" &&
            row.luasKebun &&
            row.luasKebun > 0
          );

          if (validRows.length === 0) {
            return undefined;
          } else if (validRows.length === 1) {
            // Single object
            return {
              tahunTanam: validRows[0]!.tahunTanam,
              luasKebun: validRows[0]!.luasKebun,
              estimasiSupplyTBS: validRows[0]!.estimasiSupplyTBS || 0
            };
          } else {
            // Multiple rows - array format
            return validRows.map(row => ({
              tahunTanam: row.tahunTanam,
              luasKebun: row.luasKebun,
              estimasiSupplyTBS: row.estimasiSupplyTBS || 0
            }));
          }
        })()
      };

      console.log("📤 Sending update data:", updateData);
      console.log("📤 Update URL will be:", `/api/suppliers/${supplier.id}`);

      const result = await SupplierApiClient.updateSupplier(supplier.id, updateData);

      console.log("📨 Update result received:", result);

      if (result && result.success) {
        console.log("✅ Success! Calling onSuccess and onClose");
        alert("Supplier berhasil diupdate!");
        onSuccess();
        onClose();
      } else {
        console.log("❌ Update failed:", result);
        // Handle different error types
        if (result?.code === '409' && result.conflicts) {
          const conflictMessages = [];
          if (result.conflicts.nib) conflictMessages.push("NIB");
          if (result.conflicts.npwp) conflictMessages.push("NPWP");
          alert(`Error: ${conflictMessages.join(" dan ")} sudah terdaftar di sistem`);
        } else if (result?.code === '404') {
          alert("Error: Supplier tidak ditemukan");
        } else if (result?.code === '400') {
          alert(`Error: ${result.error || "Data tidak valid"}`);
          if (result.details && Array.isArray(result.details)) {
            console.error("Validation errors:", result.details);
          }
        } else {
          alert(`Error: ${result?.error || "Terjadi kesalahan saat mengupdate data"}`);
        }
      }
    } catch (error) {
      console.error("💥 Update error caught:", error);
      alert("Terjadi kesalahan jaringan atau server tidak merespons");
    } finally {
      console.log("🔄 Setting isSubmitting back to false");
      setIsSubmitting(false);
    }
  };

  // Add debug handler for testing
  const handleDebugSubmit = async () => {
    console.log("🔧 DEBUG SUBMIT CALLED");
    console.log("Supplier:", supplier);

    if (!supplier) {
      alert("No supplier data!");
      return;
    }

    // Get current form values
    const formValues = form.getValues();
    console.log("Form values:", formValues);

    // Call onSubmit directly
    await onSubmit(formValues);
  };

  const addProfilKebunRow = () => {
    setProfilKebunRows([...profilKebunRows, { tahunTanam: "", luasKebun: 0, estimasiSupplyTBS: 0 }]);
  };

  const removeProfilKebunRow = (index: number) => {
    if (profilKebunRows.length > 1) {
      setProfilKebunRows(profilKebunRows.filter((_, i) => i !== index));
    }
  };

  const updateProfilKebunRow = (index: number, field: keyof ProfilKebunItem, value: string | number) => {
    const updated = [...profilKebunRows];
    const currentRow = updated[index];

    // Ensure all required fields have valid values
    updated[index] = {
      id: currentRow?.id,
      tahunTanam: currentRow?.tahunTanam || "",
      luasKebun: currentRow?.luasKebun || 0,
      estimasiSupplyTBS: currentRow?.estimasiSupplyTBS || 0,
      koordinat: currentRow?.koordinat,
      [field]: value
    };

    setProfilKebunRows(updated);
  };

  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[9999] bg-white shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Supplier - {supplier.namaPemilik}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Supplier */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tipe Supplier</h3>
              <FormField
                control={form.control}
                name="typeSupplier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value === SupplierType.RAMP_PERON}
                            onCheckedChange={() => field.onChange(SupplierType.RAMP_PERON)}
                          />
                          <label>Ramp/Peron</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value === SupplierType.KUD}
                            onCheckedChange={() => field.onChange(SupplierType.KUD)}
                          />
                          <label>KUD</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value === SupplierType.KELOMPOK_TANI}
                            onCheckedChange={() => field.onChange(SupplierType.KELOMPOK_TANI)}
                          />
                          <label>Kelompok Tani</label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PKP Tax Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pajak PKP</h3>
              <FormField
                control={form.control}
                name="pajakPKP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Jenis Pajak PKP</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis pajak PKP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PajakPKP.NON_PKP}>{PajakPKPLabels.NON_PKP}</SelectItem>
                        <SelectItem value={PajakPKP.PKP_1_1_PERSEN}>{PajakPKPLabels.PKP_1_1_PERSEN}</SelectItem>
                        <SelectItem value={PajakPKP.PKP_11_PERSEN}>{PajakPKPLabels.PKP_11_PERSEN}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* IDENTITAS */}
            <div>
              <h3 className="text-lg font-semibold mb-4">IDENTITAS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="namaPemilik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pemilik *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alamatPemilik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hpPemilik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor HP/Telp</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="namaPerusahaan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Perusahaan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alamatRampPeron"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Ramp / Peron</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hpPerusahaan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor HP/Telp Perusahaan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="bujur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bujur</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lintang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lintang</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* PROFIL KEBUN */}
            <div>
              <h3 className="text-lg font-semibold mb-4">PROFIL KEBUN</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                  <div className="col-span-4">Tahun Tanam</div>
                  <div className="col-span-3">Luas Kebun (Ha)</div>
                  <div className="col-span-4">Estimasi Supply TBS</div>
                  <div className="col-span-1">Aksi</div>
                </div>

                {profilKebunRows.map((row, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <Input
                        value={row.tahunTanam}
                        onChange={(e) => updateProfilKebunRow(index, "tahunTanam", e.target.value)}
                        placeholder="Tahun tanam"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={row.luasKebun || ""}
                        onChange={(e) => updateProfilKebunRow(index, "luasKebun", parseFloat(e.target.value) || 0)}
                        placeholder="Luas (Ha)"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        value={row.estimasiSupplyTBS || ""}
                        onChange={(e) => updateProfilKebunRow(index, "estimasiSupplyTBS", parseFloat(e.target.value) || 0)}
                        placeholder="Estimasi supply"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProfilKebunRow(index)}
                        disabled={profilKebunRows.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addProfilKebunRow}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Baris
                </Button>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">Total Luas: </label>
                    <span className="text-lg font-bold">
                      {profilKebunRows.reduce((sum, row) => sum + (row.luasKebun || 0), 0)} Ha
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Estimasi: </label>
                    <span className="text-lg font-bold">
                      {profilKebunRows.reduce((sum, row) => sum + (row.estimasiSupplyTBS || 0), 0)} Ton
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TIPE PENGELOLAAN KEBUN */}
            <div>
              <h3 className="text-lg font-semibold mb-4">TIPE PENGELOLAAN KEBUN</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pengelolaanSwadaya"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Swadaya</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pengelolaanKelompok"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelompok</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pengelolaanPerusahaan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perusahaan</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jenisBibit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Bibit</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="sertifikasiISPO"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Sertifikasi Kebun: ISPO</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sertifikasiRSPO"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>RSPO</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* PROFIL IZIN USAHA */}
            <div>
              <h3 className="text-lg font-semibold mb-4">PROFIL IZIN USAHA</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aktePendirian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Akte Pendirian</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aktePerubahan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Akte Perubahan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nib"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIB</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIUP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="npwp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPWP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PENJUALAN TBS */}
            <div>
              <h3 className="text-lg font-semibold mb-4">PENJUALAN TBS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="penjualanLangsungPKS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langsung PKS</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="penjualanAgen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agen</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* TRANSPORTASI */}
            <div>
              <h3 className="text-lg font-semibold mb-4">TRANSPORTASI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transportMilikSendiri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milik Sendiri (unit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportPihak3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jasa Pihak ke3 (unit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>

              {/* Debug button for testing */}

              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log("🔘 Button clicked directly");
                  console.log("Form state:", form.formState);
                  console.log("Form errors:", form.formState.errors);
                  console.log("Is form valid:", form.formState.isValid);
                  console.log("Form values:", form.getValues());

                  // Log detailed error information
                  const errors = form.formState.errors;
                  if (Object.keys(errors).length > 0) {
                    console.log("❌ Validation errors found:");
                    Object.entries(errors).forEach(([field, error]) => {
                      console.log(`  - ${field}: ${error?.message || 'Unknown error'}`);
                    });
                  }

                  // Don't prevent submission, let react-hook-form handle it
                  // Remove the preventDefault that was blocking submission
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Menyimpan..." : "Update Supplier"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
