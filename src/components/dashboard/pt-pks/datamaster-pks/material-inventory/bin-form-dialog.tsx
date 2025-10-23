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
import type { WarehouseDTO, BinDTO } from "~/server/types/pt-pks/material-inventory";

const binFormSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type BinFormValues = z.infer<typeof binFormSchema>;

interface BinFormDialogProps {
  open: boolean;
  onClose: () => void;
  warehouse: WarehouseDTO;
  bin?: BinDTO | null;
}

export function BinFormDialog({
  open,
  onClose,
  warehouse,
  bin,
}: BinFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!bin;

  const form = useForm<BinFormValues>({
    resolver: zodResolver(binFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (bin) {
        form.reset({
          code: bin.code,
          name: bin.name,
          description: bin.description || "",
          isActive: bin.isActive,
        });
      } else {
        form.reset({
          code: "",
          name: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, bin, form]);

  const mutation = useMutation({
    mutationFn: async (data: BinFormValues) => {
      const url = isEdit
        ? `/api/pt-pks/material-inventory/bins/${bin.id}`
        : `/api/pt-pks/material-inventory/bins`;
      const method = isEdit ? "PUT" : "POST";

      // For POST, include warehouseId in body
      const payload = isEdit ? data : { ...data, warehouseId: warehouse.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${isEdit ? "update" : "create"} bin`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins", warehouse.id] });
      toast({
        title: "Berhasil",
        description: `Bin berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`,
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

  const onSubmit = (data: BinFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Bin" : "Tambah Bin"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui informasi bin" : `Tambahkan bin baru di gudang ${warehouse.name}`}
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
                    <Input placeholder="Contoh: A1-01 atau SHELF-01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Kode lokasi bin (unik dalam gudang)
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
                    <Input placeholder="Contoh: Rak A1 Kolom 01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nama bin yang mudah dikenali
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
                    <Textarea
                      placeholder="Deskripsi detail tentang lokasi bin..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Informasi tambahan tentang bin (opsional)
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
                      Bin yang aktif dapat digunakan untuk penyimpanan
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
