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
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

const schema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  loanReceiver: z.string().min(2, "Nama peminjam wajib diisi"),
  targetDept: z.string().min(2, "Dept/Unit wajib diisi"),
  expectedReturnAt: z.string().min(1, "Tanggal jatuh tempo wajib diisi"),
  pickerName: z.string().optional(),
  loanNotes: z.string().optional(),
  note: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, "Barang wajib dipilih"),
      unitId: z.string().min(1, "Satuan wajib dipilih"),
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
  baseUnitId: string;
  baseUnitName?: string;
  defaultIssueUnitId?: string;
  defaultIssueUnitName?: string;
};

export function PeminjamanBarangFormDialog({ open, onOpenChange }: PeminjamanBarangFormProps) {
  const queryClient = useQueryClient();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  
  const form = useForm<PeminjamanFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      warehouseId: "",
      loanReceiver: "",
      targetDept: "",
      expectedReturnAt: "",
      pickerName: "",
      loanNotes: "",
      note: "",
      items: [{ itemId: "", unitId: "", qty: "", note: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch warehouse selection
  const watchedWarehouse = form.watch("warehouseId");
  useEffect(() => {
    setSelectedWarehouse(watchedWarehouse);
    // Reset items when warehouse changes
    if (watchedWarehouse) {
      form.setValue("items", [{ itemId: "", unitId: "", qty: "", note: "" }]);
    }
  }, [watchedWarehouse, form]);

  // Helper function to auto-fill unitId when item is selected
  const handleItemChange = (index: number, itemId: string) => {
    const item = itemsData?.find((i) => i.id === itemId);
    if (item) {
      const unitId = item.defaultIssueUnitId || item.baseUnitId;
      form.setValue(`items.${index}.unitId`, unitId);
    }
  };

  // Fetch active warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/warehouses/active");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      const result = await res.json();
      return result.data || [];
    },
  });

  // Fetch items from API (only when warehouse is selected)
  const { data: itemsData } = useQuery({
    queryKey: ["items", "all", selectedWarehouse],
    queryFn: async () => {
      const response = await fetch("/api/pt-pks/material-inventory/items?limit=1000&isActive=true");
      if (!response.ok) throw new Error("Failed to fetch items");
      const result = await response.json();
      return (result.data?.data || []) as ItemOption[];
    },
    enabled: !!selectedWarehouse, // Only fetch when warehouse is selected
  });

  const mutation = useMutation({
    mutationFn: async (data: PeminjamanFormValues) => {
      const response = await fetch("/api/pt-pks/peminjaman-barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: data.date,
          warehouseId: data.warehouseId,
          loanReceiver: data.loanReceiver,
          targetDept: data.targetDept,
          expectedReturnAt: data.expectedReturnAt,
          pickerName: data.pickerName,
          loanNotes: data.loanNotes,
          note: data.note,
          lines: data.items.map((item) => ({
            itemId: item.itemId,
            unitId: item.unitId,
            qty: Number(item.qty),
            note: item.note,
          })),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan-issues"] });
      toast.success("Peminjaman barang berhasil dibuat");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat peminjaman barang");
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
            {/* Alert Info COA Mapping */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Jurnal Akuntansi:</strong> Debit: Persediaan Dipinjamkan (1-1305) → Credit: Persediaan Material (1-1304)
              </AlertDescription>
            </Alert>

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

            {/* Warehouse Selection - FIRST! */}
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Gudang *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih gudang terlebih dahulu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehousesData?.map((wh: any) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.code} - {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih gudang terlebih dahulu sebelum memilih barang
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pickerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pengambil (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama pengambil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loanNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Peminjaman (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Catatan khusus peminjaman" {...field} />
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
                  <FormLabel>Catatan Umum (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan catatan umum" {...field} />
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
                  onClick={() => append({ itemId: "", unitId: "", qty: "", note: "" })}
                  disabled={!selectedWarehouse}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Barang
                </Button>
              </div>

              {!selectedWarehouse && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pilih gudang terlebih dahulu untuk dapat menambahkan barang
                  </AlertDescription>
                </Alert>
              )}

              {fields.map((field, index) => {
                const selectedItem = itemsData?.find((item) => item.id === form.watch(`items.${index}.itemId`));
                
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
                              disabled={!selectedWarehouse}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedWarehouse ? "Pilih barang" : "Pilih gudang dulu"} />
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
                              <Input type="number" step="0.01" placeholder="0" {...field} disabled={!selectedItem} />
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
                          {selectedItem?.defaultIssueUnitName || selectedItem?.baseUnitName || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3">
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

                    {/* Hidden field for unitId */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitId`}
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending || !selectedWarehouse}>
                {mutation.isPending ? "Menyimpan..." : "Simpan Peminjaman"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
