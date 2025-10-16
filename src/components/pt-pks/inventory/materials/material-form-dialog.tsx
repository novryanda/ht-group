"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const materialFormSchema = z.object({
  isActive: z.boolean(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  code: z.string().min(1, "Kode wajib diisi").max(20),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  baseUomId: z.string().min(1, "UoM wajib dipilih"),
  description: z.string().optional(),
  minStock: z.number().optional(),
  maxStock: z.number().optional(),
});

type MaterialFormValues = z.infer<typeof materialFormSchema>;

interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: { id: string; code: string; name: string };
  baseUom: { id: string; code: string; name: string };
  minStock?: number;
  maxStock?: number;
  isActive: boolean;
}

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  onSuccess: () => void;
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  onSuccess,
}: MaterialFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      isActive: material?.isActive ?? false,
      categoryId: material?.category?.id ?? "",
      code: material?.code ?? "",
      name: material?.name ?? "",
      baseUomId: material?.baseUom?.id ?? "",
      description: material?.description ?? undefined,
      minStock: material?.minStock ?? undefined,
      maxStock: material?.maxStock ?? undefined,
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["material-categories"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/categories?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
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

  // Reset form when material changes
  useEffect(() => {
    if (material) {
      form.reset({
        isActive: material.isActive ?? false,
        categoryId: material.category?.id ?? "",
        code: material.code ?? "",
        name: material.name ?? "",
        baseUomId: material.baseUom?.id ?? "",
        description: material.description ?? undefined,
        minStock: material.minStock ?? undefined,
        maxStock: material.maxStock ?? undefined,
      });
    } else {
      form.reset({
        isActive: false,
        categoryId: "",
        code: "",
        name: "",
        baseUomId: "",
        description: undefined,
        minStock: undefined,
        maxStock: undefined,
      });
    }
  }, [material, form]);

  const onSubmit: SubmitHandler<MaterialFormValues> = async (values) => {
    setIsSubmitting(true);
    try {
      const url = material
        ? `/api/inventory/materials/${material.id}`
        : "/api/inventory/materials";
      const method = material ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error ?? "Terjadi kesalahan");
      }

      toast({
        title: "Berhasil",
        description: material
          ? "Material berhasil diupdate"
          : "Material berhasil ditambahkan",
      });

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? "Edit Material" : "Tambah Material"}</DialogTitle>
          <DialogDescription>
            {material
              ? "Ubah data material yang sudah ada"
              : "Tambahkan material baru ke dalam sistem"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Material *</FormLabel>
                    <FormControl>
                      <Input placeholder="MAT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesData?.data?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} ({cat.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Material *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama material" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi material (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="baseUomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UoM Dasar *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih UoM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uomsData?.data?.map((uom: any) => (
                          <SelectItem key={uom.id} value={uom.id}>
                            {uom.name} ({uom.code})
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
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
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
                    <FormLabel>Max Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status Aktif</FormLabel>
                    <FormDescription>
                      Material aktif dapat digunakan dalam transaksi
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
                {material ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

