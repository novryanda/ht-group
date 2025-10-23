"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import type { ItemTypeDTO, CategoryDTO } from "~/server/types/pt-pks/material-inventory";

// Form schema
const itemTypeFormSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type ItemTypeFormValues = z.infer<typeof itemTypeFormSchema>;

interface ItemTypeFormDialogProps {
  open: boolean;
  onClose: () => void;
  itemType?: ItemTypeDTO | null;
}

export function ItemTypeFormDialog({
  open,
  onClose,
  itemType,
}: ItemTypeFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!itemType;

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/categories?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: open,
  });

  const form = useForm<ItemTypeFormValues>({
    resolver: zodResolver(itemTypeFormSchema),
    defaultValues: {
      code: "",
      name: "",
      categoryId: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or itemType changes
  useEffect(() => {
    if (open) {
      if (itemType) {
        form.reset({
          code: itemType.code,
          name: itemType.name,
          categoryId: itemType.categoryId,
          description: itemType.description || "",
          isActive: itemType.isActive,
        });
      } else {
        form.reset({
          code: "",
          name: "",
          categoryId: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, itemType, form]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: ItemTypeFormValues) => {
      const url = isEdit
        ? `/api/pt-pks/material-inventory/item-types/${itemType.id}`
        : "/api/pt-pks/material-inventory/item-types";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} item type`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-types"] });
      toast({
        title: "Berhasil",
        description: `Jenis barang berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ItemTypeFormValues) => {
    mutation.mutate(data);
  };

  const categories = categoriesData?.data?.data || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Jenis Barang" : "Tambah Jenis Barang"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi jenis barang"
              : "Tambahkan jenis barang baru ke dalam sistem"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Select */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat: CategoryDTO) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.code} - {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih kategori untuk jenis barang ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: JNS-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Kode unik untuk jenis barang (harus unik)
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
                  <FormLabel>Nama *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Suku Cadang" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nama jenis barang yang mudah dikenali
                  </FormDescription>
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
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi detail tentang jenis barang ini..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Informasi tambahan tentang jenis barang (opsional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <FormDescription>
                      Jenis barang yang aktif dapat digunakan dalam transaksi
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
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Memperbarui..." : "Menyimpan..."}
                  </>
                ) : (
                  <>{isEdit ? "Perbarui" : "Simpan"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
