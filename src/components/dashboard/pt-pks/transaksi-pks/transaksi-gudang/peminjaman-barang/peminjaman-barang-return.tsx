"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

const returnSchema = z.object({
  returnedAt: z.string().min(1, "Tanggal pengembalian wajib diisi"),
  returnNote: z.string().optional(),
});

type ReturnFormValues = z.infer<typeof returnSchema>;

interface PeminjamanBarangReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string | null;
  docNumber?: string;
}

export function PeminjamanBarangReturnDialog({
  open,
  onOpenChange,
  loanId,
  docNumber,
}: PeminjamanBarangReturnDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returnedAt: new Date().toISOString().split("T")[0],
      returnNote: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReturnFormValues) => {
      const response = await fetch(`/api/pt-pks/peminjaman-barang/${loanId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to return items");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan-issues"] });
      queryClient.invalidateQueries({ queryKey: ["loan-issue-detail", loanId] });
      toast.success("Barang berhasil dikembalikan");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengembalikan barang");
    },
  });

  const onSubmit = (data: ReturnFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kembalikan Barang</DialogTitle>
          <DialogDescription>
            Konfirmasi pengembalian barang untuk dokumen {docNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Jurnal Akuntansi:</strong> Debit: Persediaan Material (1-1304) → Credit:
                Persediaan Dipinjamkan (1-1305)
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="returnedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pengembalian</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="returnNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Pengembalian (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan catatan pengembalian jika ada"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Memproses..." : "Kembalikan Barang"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
