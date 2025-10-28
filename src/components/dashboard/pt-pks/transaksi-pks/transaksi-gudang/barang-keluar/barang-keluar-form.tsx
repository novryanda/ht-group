"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const schema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  targetDept: z.string().min(2, "Dept/Unit tujuan wajib diisi"),
  purpose: z.enum(["ISSUE", "LOAN", "PROD", "SCRAP"]),
  pickerName: z.string().min(2, "Nama pengambil wajib diisi"),
  note: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, "Barang wajib dipilih"),
      qty: z.string().min(1, "Jumlah wajib diisi").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Jumlah harus lebih dari 0",
      }),
      unitCost: z.string().optional(), // Harga per unit (akan terisi otomatis dari stok)
      note: z.string().optional(),
    })
  ).min(1, "Minimal harus ada 1 barang yang keluar"),
});

type BarangKeluarFormValues = z.infer<typeof schema>;

interface BarangKeluarFormProps {
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

type StockBalance = {
  warehouseId: string;
  warehouse: {
    name: string;
  };
  qtyOnHand: string;
  avgCost: string;
};

export function BarangKeluarFormDialog({ open, onOpenChange }: BarangKeluarFormProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<BarangKeluarFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      targetDept: "",
      purpose: "ISSUE",
      pickerName: "",
      note: "",
      items: [{ itemId: "", qty: "", unitCost: "", note: "" }],
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

  // Fetch stock balance for selected item
  const fetchStockBalance = async (itemId: string) => {
    try {
      const response = await fetch(`/api/pt-pks/material-inventory/items/${itemId}/stock-balances`);
      if (!response.ok) return null;
      const result = await response.json();
      return result.data as StockBalance[];
    } catch (error) {
      return null;
    }
  };

  // Update unit cost when item is selected
  const handleItemChange = async (index: number, itemId: string) => {
    if (!itemId) return;
    
    const stockBalances = await fetchStockBalance(itemId);
    if (stockBalances && stockBalances.length > 0) {
      // Use first warehouse's avg cost
      const avgCost = stockBalances[0]?.avgCost || "0";
      form.setValue(`items.${index}.unitCost`, avgCost);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: BarangKeluarFormValues) => {
      const response = await fetch("/api/pt-pks/transaksi-gudang/barang-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          targetDept: data.targetDept,
          purpose: data.purpose,
          pickerName: data.pickerName,
          note: data.note,
          lines: data.items.map((item) => ({
            itemId: item.itemId,
            qty: Number(item.qty),
            unitCost: item.unitCost ? Number(item.unitCost) : undefined,
            note: item.note,
          })),
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goods-issues"] });
      toast.success("Barang keluar berhasil dibuat");
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Gagal membuat barang keluar");
    },
  });

  const onSubmit = (data: BarangKeluarFormValues) => {
    mutation.mutate(data);
  };

  // Calculate total expense
  const calculateTotal = () => {
    return fields.reduce((total, _, index) => {
      const qty = form.watch(`items.${index}.qty`);
      const unitCost = form.watch(`items.${index}.unitCost`);
      if (qty && unitCost) {
        return total + (Number(qty) * Number(unitCost));
      }
      return total;
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Barang Keluar Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tujuan Penggunaan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ISSUE">Pemakaian Umum</SelectItem>
                        <SelectItem value="LOAN">Peminjaman</SelectItem>
                        <SelectItem value="PROD">Produksi</SelectItem>
                        <SelectItem value="SCRAP">Scrap/Rusak</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetDept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dept/Unit Tujuan</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan dept/unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pickerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pengambil</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama pengambil" {...field} />
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
                <h3 className="font-semibold">Daftar Barang yang Keluar</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ itemId: "", qty: "", unitCost: "", note: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Barang
                </Button>
              </div>

              {fields.map((field, index) => {
                const selectedItem = itemsData?.find((item) => item.id === form.watch(`items.${index}.itemId`));
                const qty = form.watch(`items.${index}.qty`);
                const unitCost = form.watch(`items.${index}.unitCost`);
                const lineTotal = qty && unitCost ? Number(qty) * Number(unitCost) : 0;
                
                return (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-start border-b pb-3 last:border-b-0">
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barang</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleItemChange(index, value);
                              }} 
                              value={field.value}
                            >
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

                    <div className="col-span-1">
                      <FormLabel>Satuan</FormLabel>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-xs">
                        <span className="truncate">
                          {selectedItem?.baseUnit?.name || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitCost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Harga</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0" {...field} readOnly className="bg-muted" />
                            </FormControl>
                            <FormDescription className="text-xs">Auto</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormLabel>Subtotal</FormLabel>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                        <span className="text-sm font-medium">
                          {lineTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
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

              {/* Total Section */}
              <div className="flex justify-end border-t pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total Pengeluaran</p>
                  <p className="text-2xl font-bold">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan Barang Keluar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
