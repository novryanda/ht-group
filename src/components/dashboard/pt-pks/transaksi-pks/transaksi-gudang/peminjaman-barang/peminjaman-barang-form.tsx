"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const schema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  loanReceiver: z.string().min(2, "Nama peminjam wajib diisi"),
  targetDept: z.string().min(2, "Dept/Unit wajib diisi"),
  expectedReturnAt: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  note: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, "Barang wajib dipilih"),
      qty: z.string().min(1, "Jumlah wajib diisi").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Jumlah harus lebih dari 0",
      }),
      note: z.string().optional(),
    })
  ).min(1, "Minimal harus ada 1 barang yang dipinjam"),
});

type PeminjamanFormValues = z.infer<typeof schema>;

interface PeminjamanBarangFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ItemOption = {
  id: string;
  sku: string;
  name: string;
  baseUnit: {
    name: string;
  };
};

export function PeminjamanBarangFormDialog({ open, onOpenChange }: PeminjamanBarangFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<PeminjamanFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      loanReceiver: "",
      targetDept: "",
      expectedReturnAt: "",
      note: "",
      items: [{ itemId: "", qty: "", note: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch items from API
  const { data: itemsData } = useQuery({
    queryKey: ["items", "all"],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/material-inventory/items?limit=1000&isActive=true");
      if (!response.ok) throw new Error("Failed to fetch items");
      const result = await response.json();
      return (result.data?.data || []) as ItemOption[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PeminjamanFormValues) => {
      const response = await fetch("/api/pt-pks/transaksi-gudang/peminjaman-barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          loanReceiver: data.loanReceiver,
          targetDept: data.targetDept,
          expectedReturnAt: data.expectedReturnAt,
          note: data.note,
          lines: data.items.map((item) => ({
            itemId: item.itemId,
            qty: Number(item.qty),
            note: item.note,
          })),
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan-issues"] });
      toast.success("Peminjaman barang berhasil dibuat");
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Gagal membuat peminjaman barang");
    },
  });

  const onSubmit = (data: PeminjamanFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Peminjaman Barang Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Peminjaman</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedReturnAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loanReceiver"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Peminjam</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama peminjam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetDept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dept/Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan dept/unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan/Keterangan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan catatan (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Daftar Barang yang Dipinjam</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ itemId: "", qty: "", note: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Barang
                </Button>
              </div>

              {fields.map((field, index) => {
                const selectedItem = itemsData?.find((item) => item.id === form.watch(`items.${index}.itemId`));
                
                return (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-start border-b pb-3 last:border-b-0">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barang</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih barang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {itemsData?.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.sku} - {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.qty`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jumlah</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormLabel>Satuan</FormLabel>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                        <span className="text-sm">
                          {selectedItem?.baseUnit?.name || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.note`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catatan</FormLabel>
                            <FormControl>
                              <Input placeholder="Opsional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="mt-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan Peminjaman"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
