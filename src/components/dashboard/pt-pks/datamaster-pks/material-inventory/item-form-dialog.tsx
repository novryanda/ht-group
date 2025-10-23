"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Wand2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import type { ItemDTO } from "~/server/types/pt-pks/material-inventory";

const itemFormSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi"),
  name: z.string().min(1, "Nama barang wajib diisi"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  itemTypeId: z.string().min(1, "Jenis barang wajib dipilih"),
  baseUnitId: z.string().min(1, "Satuan dasar wajib dipilih"),
  defaultIssueUnitId: z.string().optional(),
  valuationMethod: z.enum(["AVERAGE", "FIFO"]),
  minStock: z.number().nonnegative("Stok minimal tidak boleh negatif"),
  maxStock: z.number().nonnegative("Stok maksimal tidak boleh negatif"),
  isActive: z.boolean(),
}).refine(
  (data) => {
    if (data.minStock && data.maxStock) {
      return data.maxStock >= data.minStock;
    }
    return true;
  },
  {
    message: "Stok maksimal harus lebih besar atau sama dengan stok minimal",
    path: ["maxStock"],
  }
);

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ItemDTO | null;
  onSuccess: () => void;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ItemFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingSKU, setIsGeneratingSKU] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      categoryId: "",
      itemTypeId: "",
      baseUnitId: "",
      defaultIssueUnitId: "",
      valuationMethod: "AVERAGE",
      minStock: 0,
      maxStock: 0,
      isActive: true,
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/categories?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Fetch item types (filtered by selected category)
  const { data: itemTypesData } = useQuery({
    queryKey: ["item-types-active", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        isActive: "true",
        limit: "100",
        ...(selectedCategory && { categoryId: selectedCategory }),
      });
      const res = await fetch(`/api/pt-pks/material-inventory/item-types?${params}`);
      if (!res.ok) throw new Error("Failed to fetch item types");
      return res.json();
    },
    enabled: !!selectedCategory,
  });

  // Fetch units
  const { data: unitsData } = useQuery({
    queryKey: ["units-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/units?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch units");
      return res.json();
    },
  });

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (item) {
        // Edit mode
        form.reset({
          sku: item.sku,
          name: item.name,
          description: item.description || "",
          categoryId: item.categoryId,
          itemTypeId: item.itemTypeId,
          baseUnitId: item.baseUnitId,
          defaultIssueUnitId: item.defaultIssueUnitId || "",
          valuationMethod: item.valuationMethod as "AVERAGE" | "FIFO",
          minStock: item.minStock || 0,
          maxStock: item.maxStock || 0,
          isActive: item.isActive,
        });
        setSelectedCategory(item.categoryId);
      } else {
        // Create mode
        form.reset({
          sku: "",
          name: "",
          description: "",
          categoryId: "",
          itemTypeId: "",
          baseUnitId: "",
          defaultIssueUnitId: "",
          valuationMethod: "AVERAGE",
          minStock: 0,
          maxStock: 0,
          isActive: true,
        });
        setSelectedCategory("");
      }
    }
  }, [open, item, form]);

  // Watch category changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "categoryId") {
        setSelectedCategory(value.categoryId || "");
        // Reset itemType when category changes
        if (!item || value.categoryId !== item.categoryId) {
          form.setValue("itemTypeId", "");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, item]);

  // Generate SKU
  const handleGenerateSKU = async () => {
    const categoryId = form.getValues("categoryId");
    const itemTypeId = form.getValues("itemTypeId");

    if (!categoryId || !itemTypeId) {
      toast.error("Pilih kategori dan jenis barang terlebih dahulu");
      return;
    }

    setIsGeneratingSKU(true);
    try {
      const res = await fetch("/api/pt-pks/material-inventory/items/generate-sku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, itemTypeId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate SKU");
      }

      const data = await res.json();
      if (data.success && data.sku) {
        form.setValue("sku", data.sku);
        toast.success("SKU berhasil digenerate");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal generate SKU");
    } finally {
      setIsGeneratingSKU(false);
    }
  };

  const onSubmit = async (values: ItemFormValues) => {
    setIsSubmitting(true);
    try {
      const url = item
        ? `/api/pt-pks/material-inventory/items/${item.id}`
        : "/api/pt-pks/material-inventory/items";

      const res = await fetch(url, {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save item");
      }

      toast.success(item ? "Barang berhasil diupdate" : "Barang berhasil ditambahkan");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan barang");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = categoriesData?.data?.data || [];
  const itemTypes = itemTypesData?.data?.data || [];
  const units = unitsData?.data?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Barang" : "Tambah Barang Baru"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* SKU with Generate Button */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="Masukkan SKU atau generate otomatis" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateSKU}
                      disabled={isGeneratingSKU || !form.getValues("categoryId") || !form.getValues("itemTypeId")}
                    >
                      {isGeneratingSKU ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormDescription>
                    Format: KATEGORI-JENIS-SEQ (contoh: RM-STEEL-001)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Barang</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nama lengkap barang" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Deskripsi barang..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category - Cascading start */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Item Type - Cascading dependent */}
            <FormField
              control={form.control}
              name="itemTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Barang</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCategory ? "Pilih jenis" : "Pilih kategori dahulu"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {itemTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Base Unit */}
            <FormField
              control={form.control}
              name="baseUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satuan Dasar</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih satuan dasar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default Issue Unit (Optional) */}
            <FormField
              control={form.control}
              name="defaultIssueUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Satuan Pengeluaran Default (Opsional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value || undefined)} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih satuan pengeluaran (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit: any) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Kosongkan jika sama dengan satuan dasar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valuation Method */}
            <FormField
              control={form.control}
              name="valuationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Penilaian</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AVERAGE">Average Cost</SelectItem>
                      <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Min/Max Stock */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Minimal</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Maksimal</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <FormDescription>
                      Barang aktif dapat digunakan dalam transaksi
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
