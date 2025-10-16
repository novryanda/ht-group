"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "~/components/ui/card";

const grnFormSchema = z.object({
  warehouseId: z.string().cuid("Gudang wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        materialId: z.string().cuid("Material wajib dipilih"),
        locationId: z.string().cuid("Lokasi wajib dipilih"),
        qty: z.coerce.number().positive("Qty harus lebih dari 0"),
        uomId: z.string().cuid("UoM wajib dipilih"),
        note: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 item harus diisi"),
});

type GrnFormValues = z.infer<typeof grnFormSchema>;

interface GrnFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GrnFormDialog({ open, onOpenChange, onSuccess }: GrnFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GrnFormValues>({
    resolver: zodResolver(grnFormSchema),
    defaultValues: {
      warehouseId: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
      items: [
        {
          materialId: "",
          locationId: "",
          qty: 0,
          uomId: "",
          note: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/warehouses?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  // Fetch materials
  const { data: materialsData } = useQuery({
    queryKey: ["materials-active"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/materials?pageSize=100&isActive=true");
      if (!res.ok) throw new Error("Failed to fetch materials");
      return res.json();
    },
  });

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ["locations-active"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/locations?pageSize=100&isActive=true");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
  });

  // Fetch UoMs
  const { data: uomsData } = useQuery({
    queryKey: ["uoms"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/uom?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch UoMs");
      return res.json();
    },
  });

  const onSubmit = async (values: GrnFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error ?? "Terjadi kesalahan");
      }

      toast({
        title: "Berhasil",
        description: "GRN berhasil dibuat dan stok telah diupdate",
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Goods Receipt Note (GRN)</DialogTitle>
          <DialogDescription>
            Catat penerimaan barang masuk gudang. Stok akan otomatis bertambah.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gudang *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehousesData?.data?.map((wh: any) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Item Penerimaan *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      materialId: "",
                      locationId: "",
                      qty: 0,
                      uomId: "",
                      note: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.materialId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {materialsData?.data?.map((mat: any) => (
                                  <SelectItem key={mat.id} value={mat.id}>
                                    {mat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.locationId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lokasi</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locationsData?.data?.map((loc: any) => (
                                  <SelectItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.uomId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UoM</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {uomsData?.data?.map((uom: any) => (
                                  <SelectItem key={uom.id} value={uom.id}>
                                    {uom.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {fields.length > 1 && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
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
                Simpan & Posting
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

