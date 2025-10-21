"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle2, Truck, Users, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

// Nested schemas
const vehicleSchema = z.object({
  plateNo: z.string().min(5, "Nomor plat minimal 5 karakter"),
  type: z.string().min(2, "Jenis kendaraan wajib diisi"),
  capacityTons: z.coerce.number().positive("Kapasitas harus lebih dari 0").optional(),
  stnkUrl: z.string().url("URL STNK tidak valid").optional().or(z.literal("")),
  stnkValidThru: z.string().optional(),
  kirUrl: z.string().url("URL KIR tidak valid").optional().or(z.literal("")),
  kirValidThru: z.string().optional(),
  gpsId: z.string().optional(),
  photoUrl: z.string().url("URL foto tidak valid").optional().or(z.literal("")),
});

const driverSchema = z.object({
  name: z.string().min(2, "Nama pengemudi minimal 2 karakter"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter").optional(),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit").optional(),
  simType: z.string().optional(),
  simUrl: z.string().url("URL SIM tidak valid").optional().or(z.literal("")),
  simValidThru: z.string().optional(),
});

const tariffSchema = z.object({
  origin: z.string().min(2, "Origin wajib diisi"),
  destination: z.string().min(2, "Destination wajib diisi"),
  commodity: z.string().min(2, "Komoditas wajib diisi"),
  unit: z.enum(["TON", "KM", "TRIP"]),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  includeToll: z.boolean().default(false),
  includeUnload: z.boolean().default(false),
  includeTax: z.boolean().default(false),
  notes: z.string().optional(),
});

const contractSchema = z.object({
  contractNo: z.string().min(3, "Nomor kontrak minimal 3 karakter"),
  buyerId: z.string().optional(),
  commodity: z.string().min(2, "Komoditas wajib diisi"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  baseTariffId: z.string().optional(),
  dokUrl: z.string().url("URL dokumen tidak valid").optional().or(z.literal("")),
});

// Main form schema
const transporterFormSchema = z.object({
  type: z.enum(["PERUSAHAAN", "PERORANGAN"]),
  legalName: z.string().min(3, "Nama legal minimal 3 karakter"),
  tradeName: z.string().optional(),
  npwp: z
    .string()
    .regex(/^\d{15}$/, "NPWP harus 15 digit angka")
    .optional()
    .or(z.literal("")),
  pkpStatus: z.enum(["NON_PKP", "PKP_11", "PKP_1_1"]),
  addressLine: z.string().min(5, "Alamat minimal 5 karakter").optional(),
  city: z.string().min(2, "Kota minimal 2 karakter").optional(),
  province: z.string().min(2, "Provinsi minimal 2 karakter").optional(),
  postalCode: z.string().optional(),
  picName: z.string().min(2, "Nama PIC minimal 2 karakter").optional(),
  picPhone: z.string().min(8, "Nomor telepon PIC minimal 8 karakter").optional(),
  picEmail: z.string().email("Email PIC tidak valid").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankAccountNm: z.string().optional(),
  statementUrl: z.string().url("URL surat pernyataan tidak valid").optional().or(z.literal("")),
  notes: z.string().optional(),
  vehicles: z.array(vehicleSchema).default([]),
  drivers: z.array(driverSchema).default([]),
  tariffs: z.array(tariffSchema).default([]),
  contracts: z.array(contractSchema).default([]),
}).refine(
  (data) => {
    // NPWP wajib jika PKP status bukan NON_PKP
    if (data.pkpStatus !== "NON_PKP" && !data.npwp) {
      return false;
    }
    return true;
  },
  {
    message: "NPWP wajib diisi untuk status PKP",
    path: ["npwp"],
  }
);

type TransporterFormData = z.infer<typeof transporterFormSchema>;

export function TransporterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  // Helper to get error message safely
  const getErrorMessage = (error: any): string => {
    return error?.message || "";
  };

  const form = useForm<any>({
    resolver: zodResolver(transporterFormSchema) as any,
    defaultValues: {
      type: "PERUSAHAAN",
      pkpStatus: "NON_PKP",
      legalName: "",
      tradeName: "",
      npwp: "",
      addressLine: "",
      city: "",
      province: "",
      postalCode: "",
      picName: "",
      picPhone: "",
      picEmail: "",
      bankName: "",
      bankAccountNo: "",
      bankAccountNm: "",
      statementUrl: "",
      notes: "",
      vehicles: [],
      drivers: [],
      tariffs: [],
      contracts: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const { fields: vehicleFields, append: appendVehicle, remove: removeVehicle } = useFieldArray({
    control,
    name: "vehicles" as any,
  });

  const { fields: driverFields, append: appendDriver, remove: removeDriver } = useFieldArray({
    control,
    name: "drivers" as any,
  });

  const { fields: tariffFields, append: appendTariff, remove: removeTariff } = useFieldArray({
    control,
    name: "tariffs" as any,
  });

  const { fields: contractFields, append: appendContract, remove: removeContract } = useFieldArray({
    control,
    name: "contracts" as any,
  });

  const pkpStatus = watch("pkpStatus");
  const npwp = watch("npwp");

  // Auto-format NPWP
  const handleNpwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    setValue("npwp", value);
  };

  const onSubmit = async (data: TransporterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pt-pks/transporters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Transportir berhasil dibuat");
        router.push("/dashboard/pt-pks/datamaster/transportir");
      } else {
        toast.error(result.error || "Gagal membuat transportir");
      }
    } catch (error) {
      console.error("Error creating transporter:", error);
      toast.error("Terjadi kesalahan saat membuat transportir");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Transportir Baru</CardTitle>
          <CardDescription>Lengkapi data transportir, armada, pengemudi, dan tarif</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profil">Profil</TabsTrigger>
              <TabsTrigger value="armada">
                <Truck className="mr-2 h-4 w-4" />
                Armada ({vehicleFields.length})
              </TabsTrigger>
              <TabsTrigger value="pengemudi">
                <Users className="mr-2 h-4 w-4" />
                Pengemudi ({driverFields.length})
              </TabsTrigger>
              <TabsTrigger value="tarif">
                <DollarSign className="mr-2 h-4 w-4" />
                Tarif ({tariffFields.length})
              </TabsTrigger>
              <TabsTrigger value="kontrak">
                <FileText className="mr-2 h-4 w-4" />
                Kontrak ({contractFields.length})
              </TabsTrigger>
            </TabsList>

            {/* Tab Profil */}
            <TabsContent value="profil" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Transportir *</Label>
                  <Select
                    value={watch("type")}
                    onValueChange={(value) => setValue("type", value as "PERUSAHAAN" | "PERORANGAN")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERUSAHAAN">Perusahaan</SelectItem>
                      <SelectItem value="PERORANGAN">Perorangan</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{String(errors.type.message)}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pkpStatus">Status PKP *</Label>
                  <Select
                    value={watch("pkpStatus")}
                    onValueChange={(value) => setValue("pkpStatus", value as "NON_PKP" | "PKP_11" | "PKP_1_1")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NON_PKP">Non PKP</SelectItem>
                      <SelectItem value="PKP_11">PKP 11%</SelectItem>
                      <SelectItem value="PKP_1_1">PKP 1.1%</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.pkpStatus?.message && <p className="text-sm text-destructive">{String(errors.pkpStatus.message)}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Nama Legal *</Label>
                  <Input {...register("legalName")} placeholder="PT Angkutan Sawit Jaya" />
                  {errors.legalName?.message && <p className="text-sm text-destructive">{String(errors.legalName.message)}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tradeName">Nama Dagang</Label>
                  <Input {...register("tradeName")} placeholder="ASJ Transport" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="npwp">
                  NPWP {pkpStatus !== "NON_PKP" && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  {...register("npwp")}
                  placeholder="123456789012345"
                  maxLength={15}
                  onChange={handleNpwpChange}
                  value={npwp}
                />
                {pkpStatus !== "NON_PKP" && !npwp && (
                  <p className="text-sm text-destructive">NPWP wajib diisi untuk status PKP</p>
                )}
                {errors.npwp?.message && <p className="text-sm text-destructive">{String(errors.npwp.message)}</p>}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Alamat</h3>
                <div className="space-y-2">
                  <Label htmlFor="addressLine">Alamat Lengkap</Label>
                  <Input {...register("addressLine")} placeholder="Jl. Raya Industri No. 45" />
                  {errors.addressLine?.message && <p className="text-sm text-destructive">{String(errors.addressLine.message)}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input {...register("city")} placeholder="Pekanbaru" />
                    {errors.city?.message && <p className="text-sm text-destructive">{String(errors.city.message)}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi</Label>
                    <Input {...register("province")} placeholder="Riau" />
                    {errors.province?.message && <p className="text-sm text-destructive">{String(errors.province.message)}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input {...register("postalCode")} placeholder="28292" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Person In Charge (PIC)</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="picName">Nama PIC</Label>
                    <Input {...register("picName")} placeholder="Budi Santoso" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="picPhone">Telepon PIC</Label>
                    <Input {...register("picPhone")} placeholder="081234567890" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="picEmail">Email PIC</Label>
                    <Input {...register("picEmail")} type="email" placeholder="budi@example.com" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Rekening Bank</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Input {...register("bankName")} placeholder="Bank Mandiri" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNo">Nomor Rekening</Label>
                    <Input {...register("bankAccountNo")} placeholder="1234567890" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNm">Atas Nama</Label>
                    <Input {...register("bankAccountNm")} placeholder="PT Angkutan Sawit Jaya" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statementUrl">URL Surat Pernyataan</Label>
                <Input {...register("statementUrl")} placeholder="https://..." />
                {errors.statementUrl?.message && <p className="text-sm text-destructive">{String(errors.statementUrl.message)}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input {...register("notes")} placeholder="Catatan tambahan..." />
              </div>
            </TabsContent>

            {/* Tab Armada */}
            <TabsContent value="armada" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Daftar Armada</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVehicle({
                      plateNo: "",
                      type: "",
                      capacityTons: undefined,
                      stnkUrl: "",
                      stnkValidThru: "",
                      kirUrl: "",
                      kirValidThru: "",
                      gpsId: "",
                      photoUrl: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Armada
                </Button>
              </div>

              {vehicleFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada armada. Klik tombol "Tambah Armada" untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicleFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Armada #{index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVehicle(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Nomor Plat *</Label>
                            <Input {...register(`vehicles.${index}.plateNo`)} placeholder="B 1234 XYZ" />
                            {Array.isArray(errors.vehicles) && errors.vehicles[index]?.plateNo?.message && (
                              <p className="text-sm text-destructive">{String(errors.vehicles[index]?.plateNo?.message)}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Jenis Kendaraan *</Label>
                            <Input {...register(`vehicles.${index}.type`)} placeholder="Truk Fuso" />
                            {Array.isArray(errors.vehicles) && errors.vehicles[index]?.type?.message && (
                              <p className="text-sm text-destructive">{String(errors.vehicles[index]?.type?.message)}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Kapasitas (Ton)</Label>
                            <Input
                              {...register(`vehicles.${index}.capacityTons`)}
                              type="number"
                              step="0.1"
                              placeholder="10"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>URL STNK</Label>
                            <Input {...register(`vehicles.${index}.stnkUrl`)} placeholder="https://..." />
                          </div>

                          <div className="space-y-2">
                            <Label>STNK Berlaku Hingga</Label>
                            <Input {...register(`vehicles.${index}.stnkValidThru`)} type="date" />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>URL KIR</Label>
                            <Input {...register(`vehicles.${index}.kirUrl`)} placeholder="https://..." />
                          </div>

                          <div className="space-y-2">
                            <Label>KIR Berlaku Hingga</Label>
                            <Input {...register(`vehicles.${index}.kirValidThru`)} type="date" />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>GPS ID</Label>
                            <Input {...register(`vehicles.${index}.gpsId`)} placeholder="GPS-12345" />
                          </div>

                          <div className="space-y-2">
                            <Label>URL Foto Kendaraan</Label>
                            <Input {...register(`vehicles.${index}.photoUrl`)} placeholder="https://..." />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab Pengemudi */}
            <TabsContent value="pengemudi" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Daftar Pengemudi</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendDriver({
                      name: "",
                      phone: "",
                      nik: "",
                      simType: "",
                      simUrl: "",
                      simValidThru: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengemudi
                </Button>
              </div>

              {driverFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada pengemudi. Klik tombol "Tambah Pengemudi" untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-4">
                  {driverFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Pengemudi #{index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDriver(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Nama Pengemudi *</Label>
                            <Input {...register(`drivers.${index}.name`)} placeholder="Ahmad Yani" />
                            {Array.isArray(errors.drivers) && errors.drivers[index]?.name?.message && (
                              <p className="text-sm text-destructive">{String(errors.drivers[index]?.name?.message)}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Nomor Telepon</Label>
                            <Input {...register(`drivers.${index}.phone`)} placeholder="081234567890" />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>NIK</Label>
                            <Input {...register(`drivers.${index}.nik`)} placeholder="1234567890123456" maxLength={16} />
                          </div>

                          <div className="space-y-2">
                            <Label>Tipe SIM</Label>
                            <Input {...register(`drivers.${index}.simType`)} placeholder="SIM B2" />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>URL SIM</Label>
                            <Input {...register(`drivers.${index}.simUrl`)} placeholder="https://..." />
                          </div>

                          <div className="space-y-2">
                            <Label>SIM Berlaku Hingga</Label>
                            <Input {...register(`drivers.${index}.simValidThru`)} type="date" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab Tarif */}
            <TabsContent value="tarif" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Daftar Tarif Dasar</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendTariff({
                      origin: "",
                      destination: "",
                      commodity: "",
                      unit: "TON",
                      price: 0,
                      includeToll: false,
                      includeUnload: false,
                      includeTax: false,
                      notes: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Tarif
                </Button>
              </div>

              {tariffFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada tarif. Klik tombol "Tambah Tarif" untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-4">
                  {tariffFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Tarif #{index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTariff(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Origin *</Label>
                            <Input {...register(`tariffs.${index}.origin`)} placeholder="Pekanbaru" />
                          </div>

                          <div className="space-y-2">
                            <Label>Destination *</Label>
                            <Input {...register(`tariffs.${index}.destination`)} placeholder="Dumai" />
                          </div>

                          <div className="space-y-2">
                            <Label>Komoditas *</Label>
                            <Input {...register(`tariffs.${index}.commodity`)} placeholder="CPO" />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Unit *</Label>
                            <Select
                              value={watch(`tariffs.${index}.unit`)}
                              onValueChange={(value) => setValue(`tariffs.${index}.unit`, value as "TON" | "KM" | "TRIP")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TON">Per Ton</SelectItem>
                                <SelectItem value="KM">Per KM</SelectItem>
                                <SelectItem value="TRIP">Per Trip</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Harga *</Label>
                            <Input
                              {...register(`tariffs.${index}.price`)}
                              type="number"
                              step="0.01"
                              placeholder="150000"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`tariffs.${index}.includeToll`}
                              checked={watch(`tariffs.${index}.includeToll`)}
                              onCheckedChange={(checked) => setValue(`tariffs.${index}.includeToll`, !!checked)}
                            />
                            <Label htmlFor={`tariffs.${index}.includeToll`} className="font-normal">
                              Termasuk Tol
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`tariffs.${index}.includeUnload`}
                              checked={watch(`tariffs.${index}.includeUnload`)}
                              onCheckedChange={(checked) => setValue(`tariffs.${index}.includeUnload`, !!checked)}
                            />
                            <Label htmlFor={`tariffs.${index}.includeUnload`} className="font-normal">
                              Termasuk Bongkar
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`tariffs.${index}.includeTax`}
                              checked={watch(`tariffs.${index}.includeTax`)}
                              onCheckedChange={(checked) => setValue(`tariffs.${index}.includeTax`, !!checked)}
                            />
                            <Label htmlFor={`tariffs.${index}.includeTax`} className="font-normal">
                              Termasuk Pajak
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Catatan</Label>
                          <Input {...register(`tariffs.${index}.notes`)} placeholder="Catatan tambahan..." />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab Kontrak */}
            <TabsContent value="kontrak" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Daftar Kontrak (Opsional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendContract({
                      contractNo: "",
                      buyerId: "",
                      commodity: "",
                      startDate: "",
                      endDate: "",
                      baseTariffId: "",
                      dokUrl: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kontrak
                </Button>
              </div>

              {contractFields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada kontrak. Klik tombol "Tambah Kontrak" untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-4">
                  {contractFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Kontrak #{index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContract(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Nomor Kontrak *</Label>
                            <Input {...register(`contracts.${index}.contractNo`)} placeholder="KTR/2024/001" />
                          </div>

                          <div className="space-y-2">
                            <Label>Komoditas *</Label>
                            <Input {...register(`contracts.${index}.commodity`)} placeholder="CPO" />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Tanggal Mulai</Label>
                            <Input {...register(`contracts.${index}.startDate`)} type="date" />
                          </div>

                          <div className="space-y-2">
                            <Label>Tanggal Selesai</Label>
                            <Input {...register(`contracts.${index}.endDate`)} type="date" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>URL Dokumen Kontrak</Label>
                          <Input {...register(`contracts.${index}.dokUrl`)} placeholder="https://..." />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Transportir"
          )}
        </Button>
      </div>
    </form>
  );
}

