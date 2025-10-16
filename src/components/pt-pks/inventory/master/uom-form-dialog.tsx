"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import type { UomDTO } from "~/server/types/inventory";

const uomSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi").max(10, "Kode maksimal 10 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
});

type UomFormData = z.infer<typeof uomSchema>;

interface UomFormDialogProps {
  open: boolean;
  onClose: () => void;
  uom?: UomDTO | null;
}

export function UomFormDialog({ open, onClose, uom }: UomFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!uom;

  const form = useForm<UomFormData>({
    resolver: zodResolver(uomSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (uom) {
      form.reset({
        code: uom.code,
        name: uom.name,
        description: uom.description || "",
      });
    } else {
      form.reset({
        code: "",
        name: "",
        description: "",
      });
    }
  }, [uom, form]);

  const mutation = useMutation({
    mutationFn: async (data: UomFormData) => {
      const url = isEdit ? `/api/inventory/uom/${uom.id}` : "/api/inventory/uom";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save UoM");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uoms"] });
      toast({
        title: "Success",
        description: `UoM ${isEdit ? "updated" : "created"} successfully`,
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

  const onSubmit = (data: UomFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit UoM" : "Tambah UoM"}</DialogTitle>
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
                    <Input {...field} placeholder="KG" disabled={isEdit} />
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
                    <Input {...field} placeholder="Kilogram" />
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
                    <Textarea {...field} placeholder="Satuan berat" rows={3} />
                  </FormControl>
                  <FormMessage />
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

