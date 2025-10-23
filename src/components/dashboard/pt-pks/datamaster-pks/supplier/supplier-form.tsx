import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { CoordinateMapInput } from "~/components/ui/coordinate-map-input";
import { Eye, Save, Plus, Trash2 } from "lucide-react";
import { SupplierType, PajakPKP } from "@prisma/client";
import { SupplierApiClient } from "~/lib/supplier-utils";
import { type CreateSupplierForm, type ProfilKebunItem, PajakPKPLabels } from "~/server/types/pt-pks/supplier";
import { SupplierFormPDFPreview } from "./supplier-form-pdf-preview";

const supplierFormSchema = z.object({
  typeSupplier: z.enum([SupplierType.RAMP_PERON, SupplierType.KUD, SupplierType.KELOMPOK_TANI]),
  pajakPKP: z.enum([PajakPKP.PKP_11_PERSEN, PajakPKP.PKP_1_1_PERSEN, PajakPKP.NON_PKP]),

  // IDENTITAS
  namaPemilik: z.string().min(1, "Nama pemilik wajib diisi"),
  alamatPemilik: z.string().optional(),
  hpPemilik: z.string().optional(),
  namaPerusahaan: z.string().optional(),
  alamatRampPeron: z.string().optional(),
  hpPerusahaan: z.string().optional(),
  bujur: z.string().optional(),
  lintang: z.string().optional(),

  // PROFIL KEBUN - JSON field containing tahunTanam, luasKebun, estimasiSupplyTBS
  profilKebun: z.object({
    tahunTanam: z.string(),
    luasKebun: z.number().nonnegative(),
    estimasiSupplyTBS: z.number().nonnegative(),
  }).optional(),

  // TIPE PENGELOLAAN
  pengelolaanSwadaya: z.string().optional(),
  pengelolaanKelompok: z.string().optional(),
  pengelolaanPerusahaan: z.string().optional(),
  jenisBibit: z.string().optional(),
  sertifikasiISPO: z.boolean(),
  sertifikasiRSPO: z.boolean(),

  // PROFIL IZIN USAHA
  aktePendirian: z.string().optional(),
  aktePerubahan: z.string().optional(),
  nib: z.string().optional(),
  siup: z.string().optional(),
  npwp: z.string().optional(),

  // PENJUALAN TBS
  penjualanLangsungPKS: z.string().optional(),
  penjualanAgen: z.string().optional(),

  // TRANSPORTASI
  transportMilikSendiri: z.number().int().min(0).optional(),
  transportPihak3: z.number().int().min(0).optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  onSuccess?: () => void;
}

export function SupplierForm({ onSuccess }: SupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profilKebunRows, setProfilKebunRows] = useState<ProfilKebunItem[]>([
    { tahunTanam: "", luasKebun: 0, estimasiSupplyTBS: 0 }
  ]);

  // Function to clear conflicted fields if needed
  const clearConflictedFields = () => {
    const currentData = form.getValues();
    if (currentData.nib) {
      form.setValue("nib", "");
    }
    if (currentData.npwp) {
      form.setValue("npwp", "");
    }
    alert("Field NIB dan NPWP telah dikosongkan. Silakan isi ulang dengan data yang berbeda.");
  };

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      typeSupplier: SupplierType.RAMP_PERON,
      pajakPKP: PajakPKP.NON_PKP,

      // IDENTITAS
      namaPemilik: "",
      alamatPemilik: "",
      hpPemilik: "",
      namaPerusahaan: "",
      alamatRampPeron: "",
      hpPerusahaan: "",
      bujur: "",
      lintang: "",

      // PROFIL KEBUN - JSON field containing tahunTanam, luasKebun, estimasiSupply
      profilKebun: undefined,

      // TIPE PENGELOLAAN
      pengelolaanSwadaya: "",
      pengelolaanKelompok: "",
      pengelolaanPerusahaan: "",
      jenisBibit: "",
      sertifikasiISPO: false,
      sertifikasiRSPO: false,

      // PROFIL IZIN USAHA
      aktePendirian: "",
      aktePerubahan: "",
      nib: "",
      siup: "",
      npwp: "",

      // PENJUALAN TBS
      penjualanLangsungPKS: "",
      penjualanAgen: "",

      // TRANSPORTASI
      transportMilikSendiri: 0,
      transportPihak3: 0,
    }
  });

  const onSubmit = async (data: SupplierFormData) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Raw form data:", data);
    console.log("ProfilKebun rows:", profilKebunRows);

    setIsSubmitting(true);
    try {
      // Validate required fields manually
      if (!data.namaPemilik || data.namaPemilik.trim() === "") {
        alert("Nama pemilik wajib diisi");
        setIsSubmitting(false);
        return;
      }

      // Warning jika NIB atau NPWP kosong (bisa menyebabkan conflict jika ada data dengan nilai kosong)
      if (data.nib && data.nib.trim() === "") {
        data.nib = undefined; // Set to undefined instead of empty string
      }
      if (data.npwp && data.npwp.trim() === "") {
        data.npwp = undefined; // Set to undefined instead of empty string
      }

      // Handle multiple rows dari profilKebun - simpan sebagai array untuk mendukung multiple rows
      let profilKebun;
      const validRows = profilKebunRows.filter(row =>
        row.tahunTanam &&
        row.tahunTanam.trim() !== "" &&
        row.luasKebun &&
        row.luasKebun > 0
      );

      console.log("=== PROFIL KEBUN PROCESSING ===");
      console.log("Original profilKebunRows:", profilKebunRows);
      console.log("Valid rows after filtering:", validRows);

      if (validRows.length === 0) {
        console.log("No valid profil kebun rows found, setting to undefined");
        profilKebun = undefined;
      } else if (validRows.length === 1) {
        // Single object untuk database
        profilKebun = {
          tahunTanam: validRows[0]!.tahunTanam,
          luasKebun: validRows[0]!.luasKebun,
          estimasiSupplyTBS: validRows[0]!.estimasiSupplyTBS || 0
        };
        console.log("Single row profil kebun:", profilKebun);
      } else {
        // Multiple rows - simpan sebagai array untuk menampilkan baris terpisah
        profilKebun = validRows.map(row => ({
          tahunTanam: row.tahunTanam,
          luasKebun: row.luasKebun,
          estimasiSupplyTBS: row.estimasiSupplyTBS || 0
        }));
        console.log("Multiple rows profil kebun:", profilKebun);
      }

      const submitData: CreateSupplierForm = {
        ...data,
        profilKebun
      };


      console.log("Final submit data:", submitData);
      console.log("Calling SupplierApiClient.createSupplier...");

      const result = await SupplierApiClient.createSupplier(submitData);

      console.log("API Response received:", result);
      console.log("Result success:", result.success);
      console.log("Result code:", result.code);

      if (result.success) {
        console.log("Success! Resetting form...");
        form.reset();
        setProfilKebunRows([{ tahunTanam: "", luasKebun: 0, estimasiSupplyTBS: 0 }]);
        setShowPreview(false); // Hide preview after successful save
        onSuccess?.();
        alert("Supplier berhasil didaftarkan!");
      } else {
        console.error("API Error:", result.error);
        console.error("API Details:", result.details);
        console.error("Full result:", result);

        // Handle conflict errors (409) specially
        if (result.code === '409') {
          let conflictMessage = "Data sudah terdaftar:\n";

          if (result.conflicts) {
            if (result.conflicts.nib) {
              conflictMessage += "- NIB sudah digunakan\n";
            }
            if (result.conflicts.npwp) {
              conflictMessage += "- NPWP sudah digunakan\n";
            }
          }

          conflictMessage += "\nSilakan periksa dan ubah data yang sudah ada, atau hubungi administrator jika ini adalah data yang benar.";
          alert(conflictMessage);

          // Don't hide preview, allow user to edit
          return;
        }

        // Handle validation errors (400)
        if (result.code === '400' && Array.isArray(result.details)) {
          let validationMessage = "Data tidak valid:\n\n";
          result.details.forEach((error: any) => {
            if (error.path && error.message) {
              validationMessage += `- ${error.path.join('.')}: ${error.message}\n`;
            } else if (error.message) {
              validationMessage += `- ${error.message}\n`;
            }
          });
          alert(validationMessage);
          return;
        }

        // Show general error messages
        let errorMessage = result.error || 'Terjadi kesalahan saat menyimpan data';
        if (result.details) {
          if (Array.isArray(result.details)) {
            errorMessage += '\n\nDetail: ' + result.details.map((d: any) => d.message || d).join(', ');
          } else if (typeof result.details === 'string') {
            errorMessage += '\n\nDetail: ' + result.details;
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Submit error:", error);
      console.error("Error type:", typeof error);
      console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
      alert("Terjadi kesalahan saat menyimpan data. Periksa console untuk detail lengkap.");
    } finally {
      console.log("=== FORM SUBMISSION ENDED ===");
      setIsSubmitting(false);
    }
  };

  const addProfilKebunRow = () => {
    setProfilKebunRows([...profilKebunRows, { tahunTanam: "", luasKebun: 0, estimasiSupplyTBS: 0 }]);
  };

  const removeProfilKebunRow = (index: number) => {
    if (profilKebunRows.length > 1) {
      setProfilKebunRows(profilKebunRows.filter((_, i) => i !== index));
    }
  };

  const updateProfilKebunRow = (
    index: number,
    field: keyof ProfilKebunItem,
    value: string | number,
  ) => {
    const updated = [...profilKebunRows];
    const currentRow = updated[index];

    // Ensure all required fields have valid values
    updated[index] = {
      id: currentRow?.id,
      tahunTanam: currentRow?.tahunTanam || "",
      luasKebun: currentRow?.luasKebun || 0,
      estimasiSupplyTBS: currentRow?.estimasiSupplyTBS || 0,
      koordinat: currentRow?.koordinat,
      [field]: value,
    };

    setProfilKebunRows(updated);
  };

  if (showPreview) {
    return (
      <SupplierFormPDFPreview
        data={form.getValues()}
        profilKebun={profilKebunRows}
        onBack={() => setShowPreview(false)}
        onSave={async () => {
          const formData = form.getValues();
          await onSubmit(formData);
        }}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Form Calon Supplier TBS Sawit</h2>
          <p className="text-muted-foreground">PT. TARO RAKAYA TASYA</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview PDF
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Supplier */}
          <Card>
            <CardHeader>
              <CardTitle>Tipe Supplier</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* PKP Tax Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pajak PKP</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="pajakPKP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Jenis Pajak PKP</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </CardContent>
          </Card>

          {/* IDENTITAS */}
          <Card>
            <CardHeader>
              <CardTitle>IDENTITAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              </div>

              {/* Coordinate Map Input */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Koordinat Lokasi</FormLabel>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pilih lokasi pada peta atau masukkan koordinat secara manual
                  </p>
                  <CoordinateMapInput
                    latitude={form.watch("lintang")}
                    longitude={form.watch("bujur")}
                    onCoordinateChange={(lat, lng) => {
                      form.setValue("lintang", lat);
                      form.setValue("bujur", lng);
                    }}
                    height="350px"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="bujur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bujur (Longitude)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 106.8456"
                            onChange={(e) => {
                              field.onChange(e);
                              // Update map when manual input changes
                              const lat = form.getValues("lintang");
                              if (lat && e.target.value) {
                                // Trigger re-render if both coordinates are available
                              }
                            }}
                          />
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
                        <FormLabel>Lintang (Latitude)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. -6.2088"
                            onChange={(e) => {
                              field.onChange(e);
                              // Update map when manual input changes
                              const lng = form.getValues("bujur");
                              if (lng && e.target.value) {
                                // Trigger re-render if both coordinates are available
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PROFIL KEBUN */}
          <Card>
            <CardHeader>
              <CardTitle>PROFIL KEBUN</CardTitle>
            </CardHeader>
            <CardContent>
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
              </div>
            </CardContent>
          </Card>

          {/* TIPE PENGELOLAAN KEBUN */}
          <Card>
            <CardHeader>
              <CardTitle>TIPE PENGELOLAAN KEBUN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* PROFIL IZIN USAHA */}
          <Card>
            <CardHeader>
              <CardTitle>PROFIL IZIN USAHA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* PENJUALAN TBS */}
          <Card>
            <CardHeader>
              <CardTitle>PENJUALAN TBS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* TRANSPORTASI */}
          <Card>
            <CardHeader>
              <CardTitle>TRANSPORTASI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview PDF
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
