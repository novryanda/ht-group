"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  purpose: z.enum(["LOAN", "ISSUE", "PROD", "SCRAP"]),
  targetDept: z.string().min(1, "Divisi tujuan wajib diisi"),
  note: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Barang wajib dipilih"),
        qty: z.number().positive("Jumlah harus lebih dari 0"),
        note: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 item barang harus diisi"),
});

type FormValues = z.infer<typeof formSchema>;

interface BarangKeluarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outboundId?: string | null;
  onSuccess?: () => void;
}

export function BarangKeluarFormDialog({
  open,
  onOpenChange,
  outboundId,
  onSuccess,
}: BarangKeluarFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!outboundId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      warehouseId: "",
      purpose: "LOAN",
      targetDept: "",
      note: "",
      lines: [{ itemId: "", qty: 1, note: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/warehouses?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  // Fetch items with stock info
  const { data: itemsData } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/items?isActive=true&limit=1000");
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
  });

  // Watch warehouse selection
  const selectedWarehouseId = form.watch("warehouseId");

  // Fetch existing data if edit mode
  const { data: existingData } = useQuery({
    queryKey: ["warehouse-outbound", outboundId],
    queryFn: async () => {
      if (!outboundId) return null;
      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-keluar/${outboundId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isEdit && open,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data;
      form.reset({
        date: format(new Date(data.date), "yyyy-MM-dd"),
        warehouseId: data.warehouseId,
        purpose: data.purpose,
        targetDept: data.targetDept,
        note: data.note || "",
        lines: data.lines.map((line: any) => ({
          itemId: line.itemId,
          qty: line.qty,
          note: line.note || "",
        })),
      });
    }
  }, [existingData, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Transform lines to add unitId from item's baseUnitId
      const linesWithUnit = values.lines.map((line) => {
        const item = itemsData?.data?.data?.find((i: any) => i.id === line.itemId);
        return {
          itemId: line.itemId,
          unitId: item?.baseUnitId || "", // Use base unit from item
          qty: line.qty,
          note: line.note,
        };
      });

      const payload = {
        ...values,
        lines: linesWithUnit,
      };

      const url = isEdit
        ? `/api/pt-pks/transaksi-gudang/barang-keluar/${outboundId}`
        : "/api/pt-pks/transaksi-gudang/barang-keluar";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        form.reset();
        onSuccess?.();
      } else {
        alert(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Lihat" : "Tambah"} Barang Keluar</DialogTitle>
          <DialogDescription>
            {isEdit ? "Detail transaksi" : "Buat transaksi baru"} peminjaman atau pengeluaran barang
          </DialogDescription>
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
                      <Input type="date" {...field} disabled={isEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gudang</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehousesData?.data?.data?.map((warehouse: any) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
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
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tujuan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOAN">Peminjaman</SelectItem>
                        <SelectItem value="ISSUE">Pengeluaran</SelectItem>
                        <SelectItem value="PROD">Produksi</SelectItem>
                        <SelectItem value="SCRAP">Scrap</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetDept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Divisi Tujuan</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama divisi" {...field} disabled={isEdit} />
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
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan tambahan..." {...field} disabled={isEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Item Barang</h4>
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ itemId: "", qty: 1, note: "" })}
                    className="gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Item
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  // Get selected item to show details
                  const selectedItemId = form.watch(`lines.${index}.itemId`);
                  const selectedItem = itemsData?.data?.data?.find((i: any) => i.id === selectedItemId);
                  
                  return (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name={`lines.${index}.itemId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Barang</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isEdit}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih barang" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {itemsData?.data?.data?.map((item: any) => (
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

                          <FormField
                            control={form.control}
                            name={`lines.${index}.qty`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    disabled={isEdit}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Show item details if selected */}
                        {selectedItem && (
                          <div className="grid grid-cols-4 gap-2 text-sm p-2 bg-muted/50 rounded">
                            <div>
                              <span className="text-muted-foreground">Kategori:</span>
                              <div className="font-medium">{selectedItem.categoryName}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Jenis:</span>
                              <div className="font-medium">{selectedItem.itemTypeName}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Satuan:</span>
                              <div className="font-medium">{selectedItem.baseUnitName}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Info:</span>
                              <div className="font-medium text-muted-foreground text-xs">
                                {selectedWarehouseId 
                                  ? 'Stock akan divalidasi saat simpan'
                                  : 'Pilih gudang terlebih dahulu'
                                }
                              </div>
                            </div>
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name={`lines.${index}.note`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catatan (Opsional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Catatan item..." {...field} disabled={isEdit} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {!isEdit && fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="mt-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {!isEdit && (
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
