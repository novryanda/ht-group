"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import type { WarehouseDTO } from "~/server/types/inventory";

const warehouseSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  code: z.string().min(1, "Kode wajib diisi").max(20, "Kode maksimal 20 karakter"),
  isActive: z.boolean(),
  address: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormDialogProps {
  open: boolean;
  onClose: () => void;
  warehouse?: WarehouseDTO | null;
}

export function WarehouseFormDialog({ open, onClose, warehouse }: WarehouseFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!warehouse;

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name ?? "",
      code: warehouse?.code ?? "",
      isActive: warehouse?.isActive ?? false,
      address: warehouse?.address ?? undefined,
    },
  });

  useEffect(() => {
    if (warehouse) {
      form.reset({
        name: warehouse.name ?? "",
        code: warehouse.code ?? "",
        isActive: warehouse.isActive ?? false,
        address: warehouse.address ?? undefined,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        isActive: false,
        address: undefined,
      });
    }
  }, [warehouse, form]);

  const mutation = useMutation({
    mutationFn: async (data: WarehouseFormData) => {
      const url = isEdit ? `/api/inventory/warehouses/${warehouse.id}` : "/api/inventory/warehouses";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save warehouse");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({
        title: "Success",
        description: `Warehouse ${isEdit ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<WarehouseFormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gudang" : "Tambah Gudang"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="WH-01" disabled={isEdit} />
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
                  <FormLabel>Nama *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Gudang Utama" />
                  </FormControl>
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
                    <Textarea {...field} placeholder="Jl. Raya..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Aktif</FormLabel>
                    <FormDescription>
                      Gudang aktif dapat digunakan untuk transaksi
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

