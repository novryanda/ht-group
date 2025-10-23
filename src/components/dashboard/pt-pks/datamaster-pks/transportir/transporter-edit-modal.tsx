"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Loader2, Plus, Trash2, Truck, Users, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

// Nested schemas (same as transporter-form.tsx)
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
const transporterEditSchema = z.object({
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

type TransporterEditData = z.infer<typeof transporterEditSchema>;

interface TransporterEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transporterId: string | null;
  onSuccess?: () => void;
}

export function TransporterEditModal({
  open,
  onOpenChange,
  transporterId,
  onSuccess,
}: TransporterEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  const form = useForm<any>({
    resolver: zodResolver(transporterEditSchema) as any,
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
    reset,
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

  // Load transporter data when modal opens
  useEffect(() => {
    if (open && transporterId) {
      loadTransporterData();
    }
  }, [open, transporterId]);

  const loadTransporterData = async () => {
    if (!transporterId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/pt-pks/transporters/${transporterId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const transporter = result.data;
        
        // Format date fields if needed
        const formatDate = (dateString: string | null) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        // Reset form with fetched data
        reset({
          type: transporter.type || "PERUSAHAAN",
          legalName: transporter.legalName || "",
          tradeName: transporter.tradeName || "",
          npwp: transporter.npwp || "",
          pkpStatus: transporter.pkpStatus || "NON_PKP",
          addressLine: transporter.addressLine || "",
          city: transporter.city || "",
          province: transporter.province || "",
          postalCode: transporter.postalCode || "",
          picName: transporter.picName || "",
          picPhone: transporter.picPhone || "",
          picEmail: transporter.picEmail || "",
          bankName: transporter.bankName || "",
          bankAccountNo: transporter.bankAccountNo || "",
          bankAccountNm: transporter.bankAccountNm || "",
          statementUrl: transporter.statementUrl || "",
          notes: transporter.notes || "",
          vehicles: transporter.vehicles?.map((v: any) => ({
            plateNo: v.plateNo || "",
            type: v.type || "",
            capacityTons: v.capacityTons,
            stnkUrl: v.stnkUrl || "",
            stnkValidThru: formatDate(v.stnkValidThru),
            kirUrl: v.kirUrl || "",
            kirValidThru: formatDate(v.kirValidThru),
            gpsId: v.gpsId || "",
            photoUrl: v.photoUrl || "",
          })) || [],
          drivers: transporter.drivers?.map((d: any) => ({
            name: d.name || "",
            phone: d.phone || "",
            nik: d.nik || "",
            simType: d.simType || "",
            simUrl: d.simUrl || "",
            simValidThru: formatDate(d.simValidThru),
          })) || [],
          tariffs: transporter.tariffs?.map((t: any) => ({
            origin: t.origin || "",
            destination: t.destination || "",
            commodity: t.commodity || "",
            unit: t.unit || "TON",
            price: t.price || 0,
            includeToll: t.includeToll || false,
            includeUnload: t.includeUnload || false,
            includeTax: t.includeTax || false,
            notes: t.notes || "",
          })) || [],
          contracts: transporter.contracts?.map((c: any) => ({
            contractNo: c.contractNo || "",
            buyerId: c.buyerId || "",
            commodity: c.commodity || "",
            startDate: formatDate(c.startDate),
            endDate: formatDate(c.endDate),
            baseTariffId: c.baseTariffId || "",
            dokUrl: c.dokUrl || "",
          })) || [],
        });

        toast.success("Data transportir berhasil dimuat");
      } else {
        toast.error(result.error || "Gagal memuat data transportir");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error loading transporter:", error);
      toast.error("Terjadi kesalahan saat memuat data transportir");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-format NPWP
  const handleNpwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    setValue("npwp", value);
  };

  const onSubmit = async (data: TransporterEditData) => {
    if (!transporterId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/pt-pks/transporters/${transporterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Transportir berhasil diperbarui");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Gagal memperbarui transportir");
      }
    } catch (error) {
      console.error("Error updating transporter:", error);
      toast.error("Terjadi kesalahan saat memperbarui transportir");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transportir</DialogTitle>
          <DialogDescription>
            Perbarui data transportir, armada, pengemudi, tarif, dan kontrak
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 h-auto py-2">
                <TabsTrigger value="profil" className="py-3">Profil</TabsTrigger>
                <TabsTrigger value="armada" className="py-3">
                  <Truck className="mr-2 h-4 w-4" />
                  Armada ({vehicleFields.length})
                </TabsTrigger>
                <TabsTrigger value="pengemudi" className="py-3">
                  <Users className="mr-2 h-4 w-4" />
                  Pengemudi ({driverFields.length})
                </TabsTrigger>
                <TabsTrigger value="tarif" className="py-3">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Tarif ({tariffFields.length})
                </TabsTrigger>
                <TabsTrigger value="kontrak" className="py-3">
                  <FileText className="mr-2 h-4 w-4" />
                  Kontrak ({contractFields.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab Profil */}
              <TabsContent value="profil" className="space-y-6 mt-8 px-2">
                <div className="grid gap-5 lg:grid-cols-2 sm:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">Tipe Transportir *</Label>
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
                    <Label htmlFor="pkpStatus" className="text-sm font-medium">Status PKP *</Label>
                    <Select
                      value={watch("pkpStatus")}
                      onValueChange={(value) => setValue("pkpStatus", value as "NON_PKP" | "PKP_11" | "PKP_1_1")}
                    >
                      <SelectTrigger className="h-10">
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

                <div className="grid gap-5 lg:grid-cols-2 sm:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="legalName" className="text-sm font-medium">Nama Legal *</Label>
                    <Input {...register("legalName")} placeholder="PT Angkutan Sawit Jaya" className="h-10" />
                    {errors.legalName?.message && <p className="text-sm text-destructive">{String(errors.legalName.message)}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradeName" className="text-sm font-medium">Nama Dagang</Label>
                    <Input {...register("tradeName")} placeholder="ASJ Transport" className="h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="npwp" className="text-sm font-medium">
                    NPWP {pkpStatus !== "NON_PKP" && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    {...register("npwp")}
                    placeholder="123456789012345"
                    maxLength={15}
                    onChange={handleNpwpChange}
                    value={npwp}
                    className="h-10"
                  />
                  {pkpStatus !== "NON_PKP" && !npwp && (
                    <p className="text-sm text-destructive">NPWP wajib diisi untuk status PKP</p>
                  )}
                  {errors.npwp?.message && <p className="text-sm text-destructive">{String(errors.npwp.message)}</p>}
                </div>

                <Separator className="my-6" />

                <div className="space-y-5">
                  <h3 className="text-lg font-semibold">Alamat</h3>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine" className="text-sm font-medium">Alamat Lengkap</Label>
                    <Input {...register("addressLine")} placeholder="Jl. Raya Industri No. 45" className="h-10" />
                  {errors.addressLine?.message && <p className="text-sm text-destructive">{String(errors.addressLine.message)}</p>}
                </div>

                <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">Kota</Label>
                      <Input {...register("city")} placeholder="Pekanbaru" className="h-10" />
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
                  <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
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
                  <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
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
              <TabsContent value="armada" className="space-y-6 mt-8 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Daftar Armada</h3>
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
                  <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    Belum ada armada. Klik tombol "Tambah Armada" untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {vehicleFields.map((field, index) => (
                      <Card key={field.id} className="border-2">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Armada #{index + 1}</CardTitle>
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
                        <CardContent className="space-y-5 px-6 pb-6">
                          <div className="grid gap-5 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Nomor Plat *</Label>
                              <Input {...register(`vehicles.${index}.plateNo`)} placeholder="B 1234 XYZ" className="h-10" />
                              {Array.isArray(errors.vehicles) && errors.vehicles[index]?.plateNo?.message && (
                                <p className="text-sm text-destructive">{String(errors.vehicles[index]?.plateNo?.message)}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Jenis Kendaraan *</Label>
                              <Input {...register(`vehicles.${index}.type`)} placeholder="Truk Fuso" className="h-10" />
                              {Array.isArray(errors.vehicles) && errors.vehicles[index]?.type?.message && (
                                <p className="text-sm text-destructive">{String(errors.vehicles[index]?.type?.message)}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Kapasitas (Ton)</Label>
                              <Input
                                {...register(`vehicles.${index}.capacityTons`)}
                                type="number"
                                step="0.1"
                                placeholder="10"
                                className="h-10"
                              />
                            </div>
                          </div>

                          <div className="grid gap-5 lg:grid-cols-2 sm:grid-cols-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">URL STNK</Label>
                              <Input {...register(`vehicles.${index}.stnkUrl`)} placeholder="https://..." className="h-10" />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">STNK Berlaku Hingga</Label>
                              <Input {...register(`vehicles.${index}.stnkValidThru`)} type="date" className="h-10" />
                            </div>
                          </div>

                          <div className="grid gap-5 lg:grid-cols-2 sm:grid-cols-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">URL KIR</Label>
                              <Input {...register(`vehicles.${index}.kirUrl`)} placeholder="https://..." className="h-10" />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">KIR Berlaku Hingga</Label>
                              <Input {...register(`vehicles.${index}.kirValidThru`)} type="date" className="h-10" />
                            </div>
                          </div>

                          <div className="grid gap-5 lg:grid-cols-2 sm:grid-cols-1">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">GPS ID</Label>
                              <Input {...register(`vehicles.${index}.gpsId`)} placeholder="GPS-12345" className="h-10" />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">URL Foto Kendaraan</Label>
                              <Input {...register(`vehicles.${index}.photoUrl`)} placeholder="https://..." className="h-10" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab Pengemudi */}
              <TabsContent value="pengemudi" className="space-y-6 mt-8 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Daftar Pengemudi</h3>
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
                  <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    Belum ada pengemudi. Klik tombol "Tambah Pengemudi" untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {driverFields.map((field, index) => (
                      <Card key={field.id} className="border-2">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Pengemudi #{index + 1}</CardTitle>
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
                        <CardContent className="space-y-5 px-6 pb-6">
                          <div className="grid gap-4 lg:grid-cols-2 sm:grid-cols-1">
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
              <TabsContent value="tarif" className="space-y-6 mt-8 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Daftar Tarif</h3>
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
                  <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    Belum ada tarif. Klik tombol "Tambah Tarif" untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {tariffFields.map((field, index) => (
                      <Card key={field.id} className="border-2">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Tarif #{index + 1}</CardTitle>
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
                        <CardContent className="space-y-5 px-6 pb-6">
                          <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
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
                              <Input {...register(`tariffs.${index}.commodity`)} placeholder="TBS" />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Unit *</Label>
                              <Select
                                value={watch(`tariffs.${index}.unit`)}
                                onValueChange={(value) => setValue(`tariffs.${index}.unit`, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TON">TON</SelectItem>
                                  <SelectItem value="KM">KM</SelectItem>
                                  <SelectItem value="TRIP">TRIP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Harga *</Label>
                              <Input {...register(`tariffs.${index}.price`)} type="number" step="0.01" placeholder="0" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Catatan</Label>
                            <Input {...register(`tariffs.${index}.notes`)} placeholder="Catatan tarif..." />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab Kontrak */}
              <TabsContent value="kontrak" className="space-y-6 mt-8 px-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Daftar Kontrak</h3>
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
                  <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
                    Belum ada kontrak. Klik tombol "Tambah Kontrak" untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {contractFields.map((field, index) => (
                      <Card key={field.id} className="border-2">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold">Kontrak #{index + 1}</CardTitle>
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
                        <CardContent className="space-y-5 px-6 pb-6">
                          <div className="grid gap-4 lg:grid-cols-2 sm:grid-cols-1">
                            <div className="space-y-2">
                              <Label>Nomor Kontrak *</Label>
                              <Input {...register(`contracts.${index}.contractNo`)} placeholder="KTR/2024/001" />
                            </div>

                            <div className="space-y-2">
                              <Label>Komoditas *</Label>
                              <Input {...register(`contracts.${index}.commodity`)} placeholder="TBS" />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Tanggal Mulai</Label>
                              <Input {...register(`contracts.${index}.startDate`)} type="date" />
                            </div>

                            <div className="space-y-2">
                              <Label>Tanggal Berakhir</Label>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
