"use client";

import { useState, useEffect } from "react";
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
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
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
});

type BuyerFormData = z.infer<typeof buyerFormSchema>;

interface BuyerEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  buyerId: string | null;
}

export function BuyerEditModal({ open, onOpenChange, onSuccess, buyerId }: BuyerEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<BuyerFormData>({
    resolver: zodResolver(buyerFormSchema) as any,
    defaultValues: {
      type: "COMPANY",
      pkpStatus: "NON_PKP",
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
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  // Load buyer data when modal opens
  useEffect(() => {
    if (open && buyerId) {
      setIsLoadingData(true);
      fetch(`/api/buyers/${buyerId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            const buyer = result.data;
            form.reset({
              type: buyer.type || "COMPANY",
              legalName: buyer.legalName || "",
              tradeName: buyer.tradeName || "",
              npwp: buyer.npwp || "",
              pkpStatus: buyer.pkpStatus || "NON_PKP",
              addressLine: buyer.addressLine || "",
              city: buyer.city || "",
              province: buyer.province || "",
              postalCode: buyer.postalCode || "",
              billingEmail: buyer.billingEmail || "",
              phone: buyer.phone || "",
              destinationName: buyer.destinationName || "",
              destinationAddr: buyer.destinationAddr || "",
              contacts: buyer.contacts && buyer.contacts.length > 0
                ? buyer.contacts
                : [{ name: "", role: "", email: "", phone: "", isBilling: true }],
            });
          }
        })
        .catch((error) => {
          console.error("Error loading buyer:", error);
          toast.error("Gagal memuat data buyer");
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    } else if (open && !buyerId) {
      form.reset();
    }
  }, [open, buyerId, form]);

  // Format NPWP input
  const handleNpwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    form.setValue("npwp", value);
  };

  const onSubmit = async (data: BuyerFormData) => {
    if (!buyerId) return;

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

      const response = await fetch(`/api/buyers/${buyerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Gagal memperbarui buyer");
        return;
      }

      toast.success("Buyer berhasil diperbarui");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating buyer:", error);
      toast.error("Terjadi kesalahan saat memperbarui buyer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Buyer</DialogTitle>
          <DialogDescription>
            Perbarui data buyer. Field bertanda * wajib diisi.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identitas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Identitas Buyer</h3>

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
                {form.formState.errors.npwp && (
                  <p className="text-sm text-destructive">{form.formState.errors.npwp.message}</p>
                )}
              </div>
            </div>

            {/* Alamat & Penagihan */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Alamat & Penagihan</h3>

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
            </div>

            {/* Logistik */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Informasi Logistik</h3>

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
            </div>

            {/* Kontak */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Kontak Person (Min. 1)</h3>
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
                  Tambah
                </Button>
              </div>

              {contactFields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Kontak {index + 1}</h4>
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
