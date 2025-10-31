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
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import type { DivisiDTO } from "~/server/types/pt-pks/divisi";

const divisiFormSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi").max(20, "Kode maksimal 20 karakter"),
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().max(300, "Deskripsi maksimal 300 karakter").optional(),
  isActive: z.boolean(),
});

type DivisiFormValues = z.infer<typeof divisiFormSchema>;

interface DivisiFormDialogProps {
  open: boolean;
  onClose: () => void;
  divisi?: DivisiDTO | null;
}

export function DivisiFormDialog({ open, onClose, divisi }: DivisiFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DivisiFormValues>({
    resolver: zodResolver(divisiFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or divisi changes
  useEffect(() => {
    if (open && divisi) {
      form.reset({
        code: divisi.code,
        name: divisi.name,
        description: divisi.description ?? "",
        isActive: divisi.isActive,
      });
    } else if (open && !divisi) {
      form.reset({
        code: "",
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [open, divisi, form]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (values: DivisiFormValues) => {
      const url = divisi
        ? `/api/pt-pks/divisi/${divisi.id}`
        : "/api/pt-pks/divisi";
      const method = divisi ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save divisi");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisi"] });
      toast({
        title: "Berhasil",
        description: divisi ? "Divisi berhasil diupdate" : "Divisi berhasil ditambahkan",
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

  const onSubmit = (values: DivisiFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{divisi ? "Edit Divisi" : "Tambah Divisi"}</DialogTitle>
          <DialogDescription>
            {divisi ? "Ubah data divisi" : "Tambahkan divisi baru"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Divisi *</FormLabel>
                  <FormControl>
                    <Input placeholder="Misal: PROD, HRD, FIN" {...field} />
                  </FormControl>
                  <FormDescription>Kode unik untuk divisi</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Divisi *</FormLabel>
                  <FormControl>
                    <Input placeholder="Misal: Produksi, HRD, Finance" {...field} />
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
                    <Textarea
                      placeholder="Keterangan divisi (opsional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
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
                      Divisi aktif dapat digunakan dalam data karyawan
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

