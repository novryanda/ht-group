"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Form schema
const buyerContactSchema = z.object({
  name: z.string().min(2, "Nama kontak minimal 2 karakter"),
  role: z.string().optional(),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter"),
  isBilling: z.boolean().default(false),
});

const buyerDocSchema = z.object({
  kind: z.string().min(2, "Jenis dokumen wajib diisi"),
  fileUrl: z.string().url("URL file tidak valid"),
  fileName: z.string().min(1, "Nama file wajib diisi"),
});

const buyerFormSchema = z.object({
  type: z.enum(["COMPANY", "PERSON"], {
    errorMap: () => ({ message: "Tipe buyer wajib dipilih" }),
  }),
  legalName: z.string().min(2, "Nama legal minimal 2 karakter"),
  tradeName: z.string().optional(),
  npwp: z
    .string()
    .regex(/^\d{15}$/, "NPWP harus 15 digit angka")
    .optional()
    .or(z.literal("")),
  pkpStatus: z.enum(["NON_PKP", "PKP_11", "PKP_1_1"], {
    errorMap: () => ({ message: "Status PKP wajib dipilih" }),
  }),
  addressLine: z.string().min(5, "Alamat minimal 5 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  province: z.string().min(2, "Provinsi minimal 2 karakter"),
  postalCode: z.string().optional(),
  billingEmail: z.string().email("Email penagihan tidak valid"),
  phone: z.string().min(8, "Nomor telepon minimal 8 karakter"),
  destinationName: z.string().min(2, "Nama tujuan minimal 2 karakter"),
  destinationAddr: z.string().min(5, "Alamat tujuan minimal 5 karakter"),
  contacts: z.array(buyerContactSchema).min(1, "Minimal 1 kontak wajib diisi"),
  docs: z.array(buyerDocSchema).optional(),
});

type BuyerFormData = z.infer<typeof buyerFormSchema>;

interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicates: Array<{
    id: string;
    buyerCode: string;
    legalName: string;
    city: string;
    province: string;
  }>;
  message?: string;
}

export function BuyerForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);

  const form = useForm({
    resolver: zodResolver(buyerFormSchema),
    defaultValues: {
      type: "COMPANY" as const,
      pkpStatus: "NON_PKP" as const,
      legalName: "",
      tradeName: "",
      npwp: "",
      addressLine: "",
      city: "",
      province: "",
      postalCode: "",
      billingEmail: "",
      phone: "",
      destinationName: "",
      destinationAddr: "",
      contacts: [
        {
          name: "",
          role: "",
          email: "",
          phone: "",
          isBilling: true,
        },
      ],
      docs: [],
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
    control: form.control,
    name: "docs",
  });

  // Watch NPWP for duplicate checking
  const npwpValue = form.watch("npwp");
  const legalNameValue = form.watch("legalName");
  const cityValue = form.watch("city");
  const provinceValue = form.watch("province");

  // Check duplicate on NPWP change
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!npwpValue || npwpValue.length !== 15) {
        setDuplicateWarning(null);
        return;
      }

      setIsCheckingDuplicate(true);
      try {
        const params = new URLSearchParams({ npwp: npwpValue });
        const response = await fetch(`/api/buyers/check?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDuplicateWarning(result.data);
        }
      } catch (error) {
        console.error("Error checking duplicate:", error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    };

    const timeoutId = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeoutId);
  }, [npwpValue]);

  // Format NPWP input
  const handleNpwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    form.setValue("npwp", value);
  };

  const onSubmit = async (data: BuyerFormData) => {
    // Final duplicate check if NPWP is empty
    if (!data.npwp && data.legalName && data.city && data.province) {
      setIsCheckingDuplicate(true);
      try {
        const params = new URLSearchParams({
          legalName: data.legalName,
          city: data.city,
          province: data.province,
        });
        const response = await fetch(`/api/buyers/check?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data && result.data.isDuplicate) {
          setDuplicateWarning(result.data);
          setIsCheckingDuplicate(false);
          toast.error("Buyer dengan data yang sama sudah terdaftar");
          return;
        }
      } catch (error) {
        console.error("Error checking duplicate:", error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }

    setIsSubmitting(true);
    try {
      // Clean up data
      const submitData = {
        ...data,
        npwp: data.npwp || undefined,
        tradeName: data.tradeName || undefined,
        postalCode: data.postalCode || undefined,
        contacts: data.contacts.map((c) => ({
          ...c,
          role: c.role || undefined,
        })),
      };

      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Buyer berhasil dibuat");
        router.push(`/dashboard/pt-pks/datamaster/buyer/${result.data.id}`);
      } else {
        toast.error(result.error || "Gagal membuat buyer");
      }
    } catch (error) {
      console.error("Error creating buyer:", error);
      toast.error("Terjadi kesalahan saat membuat buyer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Identitas */}
      <Card>
        <CardHeader>
          <CardTitle>Identitas Buyer</CardTitle>
          <CardDescription>Informasi dasar buyer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Buyer *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(value) => form.setValue("type", value as "COMPANY" | "PERSON")}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Perusahaan</SelectItem>
                  <SelectItem value="PERSON">Perorangan</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pkpStatus">Status PKP *</Label>
              <Select
                value={form.watch("pkpStatus")}
                onValueChange={(value) => form.setValue("pkpStatus", value as any)}
              >
                <SelectTrigger id="pkpStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NON_PKP">Non PKP</SelectItem>
                  <SelectItem value="PKP_11">PKP 11%</SelectItem>
                  <SelectItem value="PKP_1_1">PKP 1.1%</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.pkpStatus && (
                <p className="text-sm text-destructive">{form.formState.errors.pkpStatus.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legalName">Nama Legal *</Label>
              <Input
                id="legalName"
                {...form.register("legalName")}
                placeholder="PT ABC atau Nama Lengkap"
              />
              {form.formState.errors.legalName && (
                <p className="text-sm text-destructive">{form.formState.errors.legalName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeName">Nama Dagang</Label>
              <Input
                id="tradeName"
                {...form.register("tradeName")}
                placeholder="Nama dagang (opsional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="npwp">NPWP (15 digit)</Label>
            <Input
              id="npwp"
              value={form.watch("npwp")}
              onChange={handleNpwpChange}
              placeholder="123456789012345"
              maxLength={15}
            />
            {isCheckingDuplicate && (
              <p className="text-sm text-muted-foreground">
                <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                Memeriksa duplikasi...
              </p>
            )}
            {form.formState.errors.npwp && (
              <p className="text-sm text-destructive">{form.formState.errors.npwp.message}</p>
            )}
            {duplicateWarning && duplicateWarning.isDuplicate && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {duplicateWarning.message}
                  {duplicateWarning.duplicates.length > 0 && (
                    <div className="mt-2">
                      {duplicateWarning.duplicates.map((dup) => (
                        <div key={dup.id} className="text-sm">
                          • {dup.buyerCode} - {dup.legalName}
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {duplicateWarning && !duplicateWarning.isDuplicate && npwpValue && npwpValue.length === 15 && (
              <p className="text-sm text-green-600">
                <CheckCircle2 className="mr-1 inline h-3 w-3" />
                NPWP tersedia
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alamat & Penagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Alamat & Penagihan</CardTitle>
          <CardDescription>Informasi alamat dan kontak penagihan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine">Alamat Lengkap *</Label>
            <Input
              id="addressLine"
              {...form.register("addressLine")}
              placeholder="Jalan, nomor, RT/RW, kelurahan"
            />
            {form.formState.errors.addressLine && (
              <p className="text-sm text-destructive">{form.formState.errors.addressLine.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Kota/Kabupaten *</Label>
              <Input id="city" {...form.register("city")} placeholder="Jakarta" />
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provinsi *</Label>
              <Input id="province" {...form.register("province")} placeholder="DKI Jakarta" />
              {form.formState.errors.province && (
                <p className="text-sm text-destructive">{form.formState.errors.province.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Kode Pos</Label>
              <Input id="postalCode" {...form.register("postalCode")} placeholder="12345" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Email Penagihan *</Label>
              <Input
                id="billingEmail"
                type="email"
                {...form.register("billingEmail")}
                placeholder="billing@company.com"
              />
              {form.formState.errors.billingEmail && (
                <p className="text-sm text-destructive">{form.formState.errors.billingEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telepon *</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="08123456789"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logistik */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Logistik</CardTitle>
          <CardDescription>Tujuan pengiriman barang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destinationName">Nama Gudang/Bulking *</Label>
            <Input
              id="destinationName"
              {...form.register("destinationName")}
              placeholder="Gudang Utama Jakarta"
            />
            {form.formState.errors.destinationName && (
              <p className="text-sm text-destructive">{form.formState.errors.destinationName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationAddr">Alamat Tujuan *</Label>
            <Input
              id="destinationAddr"
              {...form.register("destinationAddr")}
              placeholder="Alamat lengkap gudang/bulking"
            />
            {form.formState.errors.destinationAddr && (
              <p className="text-sm text-destructive">{form.formState.errors.destinationAddr.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kontak */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kontak Person</CardTitle>
              <CardDescription>Minimal 1 kontak wajib diisi</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendContact({
                  name: "",
                  role: "",
                  email: "",
                  phone: "",
                  isBilling: false,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kontak
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contactFields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Kontak {index + 1}</h4>
                {contactFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama *</Label>
                  <Input
                    {...form.register(`contacts.${index}.name`)}
                    placeholder="Nama lengkap"
                  />
                  {form.formState.errors.contacts?.[index]?.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.contacts[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <Input
                    {...form.register(`contacts.${index}.role`)}
                    placeholder="Manager, Staff, dll"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    {...form.register(`contacts.${index}.email`)}
                    placeholder="email@example.com"
                  />
                  {form.formState.errors.contacts?.[index]?.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.contacts[index]?.email?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Telepon *</Label>
                  <Input
                    {...form.register(`contacts.${index}.phone`)}
                    placeholder="08123456789"
                  />
                  {form.formState.errors.contacts?.[index]?.phone && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.contacts[index]?.phone?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {form.formState.errors.contacts && (
            <p className="text-sm text-destructive">
              {form.formState.errors.contacts.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (duplicateWarning?.isDuplicate ?? false)}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan & Terverifikasi
        </Button>
      </div>
    </form>
  );
}

