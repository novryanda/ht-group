"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import type { WarehouseDTO } from "~/server/types/pt-pks/material-inventory";

const warehouseFormSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  address: z.string().optional(),
  isActive: z.boolean(),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface WarehouseFormDialogProps {
  open: boolean;
  onClose: () => void;
  warehouse?: WarehouseDTO | null;
}

export function WarehouseFormDialog({
  open,
  onClose,
  warehouse,
}: WarehouseFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!warehouse;

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (warehouse) {
        form.reset({
          code: warehouse.code,
          name: warehouse.name,
          address: warehouse.address || "",
          isActive: warehouse.isActive,
        });
      } else {
        form.reset({
          code: "",
          name: "",
          address: "",
          isActive: true,
        });
      }
    }
  }, [open, warehouse, form]);

  const mutation = useMutation({
    mutationFn: async (data: WarehouseFormValues) => {
      const url = isEdit
        ? `/api/pt-pks/material-inventory/warehouses/${warehouse.id}`
        : "/api/pt-pks/material-inventory/warehouses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} warehouse`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({
        title: "Berhasil",
        description: `Gudang berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`,
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

  const onSubmit = (data: WarehouseFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Gudang" : "Tambah Gudang"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi gudang"
              : "Tambahkan gudang baru ke dalam sistem"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: WH-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Kode unik untuk gudang
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Gudang Utama" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nama gudang yang mudah dikenali
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alamat lengkap gudang..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Alamat lokasi gudang (opsional)
                  </FormDescription>
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
                      Gudang yang aktif dapat digunakan dalam transaksi
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
