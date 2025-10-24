"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { format } from "date-fns";

// Schema
const formSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  sourceType: z.enum(["RETURN", "PURCHASE", "PRODUCTION", "OTHER"]),
  sourceRef: z.string().optional(),
  note: z.string().optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item wajib dipilih"),
        qty: z.number().min(0.01, "Jumlah harus lebih dari 0"),
      })
    )
    .min(1, "Minimal 1 item"),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inboundId?: string | null;
  outboundId?: string; // Pre-fill from "Kembalikan" button
  onSuccess?: () => void;
}

export function BarangMasukFormDialog({
  open,
  onOpenChange,
  inboundId,
  outboundId,
  onSuccess,
}: Props) {
  const [itemDetails, setItemDetails] = useState<Record<string, any>>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      warehouseId: "",
      sourceType: outboundId ? "RETURN" : "PURCHASE",
      sourceRef: "",
      note: "",
      lines: [{ itemId: "", qty: 0 }],
    },
  });

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/warehouses");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch items
  const { data: itemsData } = useQuery({
    queryKey: ["items-all"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/items?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch detail if editing
  const { data: detailData } = useQuery({
    queryKey: ["warehouse-inbound", inboundId],
    queryFn: async () => {
      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-masuk/${inboundId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!inboundId,
  });

  // Fetch outbound detail for return flow
  const { data: outboundData } = useQuery({
    queryKey: ["warehouse-outbound", outboundId],
    queryFn: async () => {
      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-keluar/${outboundId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!outboundId,
  });

  // Populate form when editing
  useEffect(() => {
    if (detailData?.data) {
      const detail = detailData.data;
      form.reset({
        date: format(new Date(detail.date), "yyyy-MM-dd"),
        warehouseId: detail.warehouseId,
        sourceType: detail.sourceType,
        sourceRef: detail.sourceRef || "",
        note: detail.note || "",
        lines: detail.lines.map((line: any) => ({
          itemId: line.itemId,
          qty: line.qty,
        })),
      });
    }
  }, [detailData, form]);

  // Populate form from outbound (return flow)
  useEffect(() => {
    if (outboundData?.data) {
      const outbound = outboundData.data;
      
      // Pre-fetch item details for all items
      const itemIds = outbound.lines.map((line: any) => line.itemId);
      const fetchPromises = itemIds.map(async (itemId: string) => {
        try {
          const res = await fetch(`/api/pt-pks/material-inventory/items/${itemId}`);
          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data) {
              setItemDetails((prev) => ({
                ...prev,
                [itemId]: result.data,
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching item:", error);
        }
      });
      void Promise.all(fetchPromises);

      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        warehouseId: outbound.warehouseId,
        sourceType: "RETURN",
        sourceRef: outbound.docNumber,
        note: `Pengembalian dari ${outbound.targetDept}`,
        lines: outbound.lines.map((line: any) => ({
          itemId: line.itemId,
          qty: 0, // User will input the actual return qty
        })),
      });
    }
  }, [outboundData, form]);

  // Fetch item details when item is selected
  const handleItemSelect = async (itemId: string, lineIndex: number) => {
    if (!itemId || itemDetails[itemId]) return;

    try {
      const res = await fetch(`/api/pt-pks/material-inventory/items/${itemId}`);
      if (!res.ok) throw new Error("Failed to fetch item");
      const result = await res.json();
      
      if (result.success && result.data) {
        setItemDetails((prev) => ({
          ...prev,
          [itemId]: result.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  // Submit mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/pt-pks/transaksi-gudang/barang-masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Barang masuk berhasil disimpan");
      form.reset();
      setItemDetails({});
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const addLine = () => {
    const currentLines = form.getValues("lines");
    form.setValue("lines", [...currentLines, { itemId: "", qty: 0 }]);
  };

  const removeLine = (index: number) => {
    const currentLines = form.getValues("lines");
    if (currentLines.length > 1) {
      form.setValue(
        "lines",
        currentLines.filter((_, i) => i !== index)
      );
    }
  };

  const warehouses = warehousesData?.data?.data || [];
  const items = itemsData?.data?.data || [];
  const isViewMode = !!inboundId;
  const isReturnMode = !!outboundId;
  const outboundLines = outboundData?.data?.lines || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? "Detail Barang Masuk" : isReturnMode ? "Kembalikan Barang" : "Barang Dikembalikan"}
          </DialogTitle>
          <DialogDescription>
            {isViewMode
              ? "Lihat detail transaksi barang masuk"
              : isReturnMode
              ? `Catat pengembalian barang dari dokumen ${outboundData?.data?.docNumber || ""}`
              : "Catat pengembalian barang dari divisi lain atau penerimaan barang"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isViewMode} />
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
                      value={field.value}
                      disabled={isViewMode || isReturnMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((wh: any) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
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
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Penerimaan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isViewMode || isReturnMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RETURN">Pengembalian</SelectItem>
                        <SelectItem value="PURCHASE">Pembelian</SelectItem>
                        <SelectItem value="PRODUCTION">Produksi</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Referensi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="No. dokumen asal (opsional)"
                        {...field}
                        disabled={isViewMode || isReturnMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Item Barang</FormLabel>
                {!isViewMode && !isReturnMode && (
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Item
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {form.watch("lines").map((line, index) => {
                  const selectedItem = itemDetails[line.itemId];
                  const outboundLine = isReturnMode ? outboundLines[index] : null;
                  
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 p-3 border rounded-lg items-end"
                    >
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.itemId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Item</FormLabel>
                              {isReturnMode ? (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {selectedItem?.name || "Loading..."}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {selectedItem?.kategoriName} • {selectedItem?.jenisName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Satuan: {selectedItem?.baseUnitName}
                                  </div>
                                  {outboundLine && (
                                    <div className="text-xs font-medium text-primary">
                                      Qty Dipinjam: {outboundLine.qty} {outboundLine.unitName}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      void handleItemSelect(value, index);
                                    }}
                                    value={field.value}
                                    disabled={isViewMode}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih item" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {items.map((item: any) => (
                                        <SelectItem key={item.id} value={item.id}>
                                          <div className="flex flex-col">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {item.kategoriName} • {item.jenisName}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {selectedItem && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Satuan: {selectedItem.baseUnitName}
                                    </p>
                                  )}
                                </>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lines.${index}.qty`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                {isReturnMode ? "Qty Dikembalikan" : "Jumlah"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder={outboundLine ? `Max: ${outboundLine.qty}` : "0"}
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  disabled={isViewMode}
                                />
                              </FormControl>
                              {outboundLine && field.value > outboundLine.qty && (
                                <p className="text-xs text-destructive mt-1">
                                  Melebihi qty dipinjam!
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-5 flex items-end gap-2">
                        {!isViewMode && !isReturnMode && form.watch("lines").length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan (opsional)"
                      {...field}
                      disabled={isViewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            {!isViewMode && (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
