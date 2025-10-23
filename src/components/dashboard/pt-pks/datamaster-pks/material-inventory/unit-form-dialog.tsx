"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import type { UnitDTO } from "~/server/types/pt-pks/material-inventory";

const unitFormSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  isBase: z.boolean(),
  conversionToBase: z.number().positive("Konversi harus lebih dari 0"),
  description: z.string(),
  isActive: z.boolean(),
}).refine(
  (data) => {
    if (data.isBase && data.conversionToBase !== 1) {
      return false;
    }
    return true;
  },
  {
    message: "Satuan dasar harus memiliki konversi = 1",
    path: ["conversionToBase"],
  }
);

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormDialogProps {
  open: boolean;
  onClose: () => void;
  unit?: UnitDTO | null;
}

export function UnitFormDialog({ open, onClose, unit }: UnitFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      code: "",
      name: "",
      isBase: false,
      conversionToBase: 1,
      description: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or unit changes
  useEffect(() => {
    if (open && unit) {
      form.reset({
        code: unit.code,
        name: unit.name,
        isBase: unit.isBase,
        conversionToBase: unit.conversionToBase,
        description: unit.description ?? "",
        isActive: unit.isActive,
      });
    } else if (open && !unit) {
      form.reset({
        code: "",
        name: "",
        isBase: false,
        conversionToBase: 1,
        description: "",
        isActive: true,
      });
    }
  }, [open, unit, form]);

  // Watch isBase to auto-set conversionToBase
  const isBase = form.watch("isBase");
  useEffect(() => {
    if (isBase) {
      form.setValue("conversionToBase", 1);
    }
  }, [isBase, form]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (values: UnitFormValues) => {
      const url = unit
        ? `/api/pt-pks/material-inventory/units/${unit.id}`
        : "/api/pt-pks/material-inventory/units";
      const method = unit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save unit");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast({
        title: "Berhasil",
        description: unit ? "Satuan berhasil diupdate" : "Satuan berhasil ditambahkan",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: UnitFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Satuan" : "Tambah Satuan"}</DialogTitle>
          <DialogDescription>
            {unit ? "Ubah data satuan barang" : "Tambahkan satuan barang baru"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Satuan *</FormLabel>
                  <FormControl>
                    <Input placeholder="Misal: PCS, KG, M" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Satuan *</FormLabel>
                  <FormControl>
                    <Input placeholder="Misal: Pieces, Kilogram, Meter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBase"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Satuan Dasar</FormLabel>
                    <FormDescription>
                      Tandai jika ini adalah satuan dasar (base unit)
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

            <FormField
              control={form.control}
              name="conversionToBase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konversi ke Satuan Dasar *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="1"
                      disabled={isBase}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isBase
                      ? "Satuan dasar selalu bernilai 1"
                      : "Misal: 1 Dus = 12 Pcs, maka isi 12"}
                  </FormDescription>
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
                    <Input placeholder="Keterangan tambahan (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <FormDescription>
                      Satuan aktif dapat digunakan dalam transaksi
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
