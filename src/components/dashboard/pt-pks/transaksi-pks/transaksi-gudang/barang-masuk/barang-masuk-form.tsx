"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
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
  FormDescription 
} from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import { Wand2, Loader2 } from "lucide-react";

const schema = z.object({
  // Item Master Data Fields
  sku: z.string().min(1, "SKU wajib diisi"),
  name: z.string().min(1, "Nama barang wajib diisi"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  itemTypeId: z.string().min(1, "Jenis barang wajib dipilih"),
  baseUnitId: z.string().min(1, "Satuan dasar wajib dipilih"),
  defaultIssueUnitId: z.string().optional(),
  valuationMethod: z.enum(["AVERAGE", "FIFO"]),
  minStock: z.string().optional(),
  maxStock: z.string().optional(),
  isActive: z.boolean(),
  
  // Receipt Fields
  date: z.string().min(1, "Tanggal wajib diisi"),
  sourceType: z.enum(["PURCHASE", "RETURN", "PRODUCTION", "LOAN_RETURN", "OTHER"]),
  sourceRef: z.string().optional(),
  note: z.string().optional(),
  
  // Initial Stock
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  binId: z.string().optional(),
  quantity: z.string().min(1, "Jumlah wajib diisi").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Jumlah harus lebih dari 0",
  }),
  unitCost: z.string().min(1, "Harga satuan wajib diisi").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Harga satuan tidak boleh negatif",
  }),
});

type BarangMasukFormValues = z.infer<typeof schema>;

interface BarangMasukFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarangMasukFormDialog({ open, onOpenChange }: BarangMasukFormProps) {
  const queryClient = useQueryClient();
  const [isGeneratingSKU, setIsGeneratingSKU] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  
  const form = useForm<BarangMasukFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      categoryId: "",
      itemTypeId: "",
      baseUnitId: "",
      defaultIssueUnitId: "",
      valuationMethod: "AVERAGE",
      minStock: "0",
      maxStock: "0",
      isActive: true,
      date: new Date().toISOString().split('T')[0],
      sourceType: "PURCHASE",
      sourceRef: "",
      note: "",
      warehouseId: "",
      binId: undefined,
      quantity: "",
      unitCost: "",
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/categories?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const result = await res.json();
      return result.data?.data || [];
    },
  });

  // Fetch item types (filtered by selected category)
  const { data: itemTypesData } = useQuery({
    queryKey: ["item-types-active", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        isActive: "true",
        limit: "100",
        ...(selectedCategory && { categoryId: selectedCategory }),
      });
      const res = await fetch(`/api/pt-pks/material-inventory/item-types?${params}`);
      if (!res.ok) throw new Error("Failed to fetch item types");
      const result = await res.json();
      return result.data?.data || [];
    },
    enabled: !!selectedCategory,
  });

  // Fetch units
  const { data: unitsData } = useQuery({
    queryKey: ["units-active"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/material-inventory/units?isActive=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch units");
      const result = await res.json();
      return result.data?.data || [];
    },
  });

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

  // Fetch bins for selected warehouse
  const { data: binsData } = useQuery({
    queryKey: ["bins-active", selectedWarehouse],
    queryFn: async () => {
      const res = await fetch(`/api/pt-pks/material-inventory/bins?warehouseId=${selectedWarehouse}&limit=100`);
      if (!res.ok) throw new Error("Failed to fetch bins");
      const result = await res.json();
      return result.data?.data || [];
    },
    enabled: !!selectedWarehouse,
  });

  // Auto-generate SKU
  const handleGenerateSKU = async () => {
    setIsGeneratingSKU(true);
    try {
      const response = await fetch("/api/pt-pks/material-inventory/items/generate-sku", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate SKU");
      const result = await response.json();
      if (result.success && result.data?.sku) {
        form.setValue("sku", result.data.sku);
        toast.success("SKU berhasil di-generate");
      }
    } catch (error) {
      toast.error("Gagal generate SKU");
    } finally {
      setIsGeneratingSKU(false);
    }
  };

  // Watch category changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "categoryId") {
        setSelectedCategory(value.categoryId || "");
        form.setValue("itemTypeId", ""); // Reset item type when category changes
      }
      if (name === "warehouseId") {
        setSelectedWarehouse(value.warehouseId || "");
        form.setValue("binId", undefined); // Reset bin when warehouse changes
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (data: BarangMasukFormValues) => {
      // First, create the item with initial stock
      const itemPayload = {
        sku: data.sku,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        itemTypeId: data.itemTypeId,
        baseUnitId: data.baseUnitId,
        defaultIssueUnitId: data.defaultIssueUnitId || undefined,
        valuationMethod: data.valuationMethod,
        minStock: data.minStock ? Number(data.minStock) : 0,
        maxStock: data.maxStock ? Number(data.maxStock) : 0,
        isActive: data.isActive,
        initialStock: {
          warehouseId: data.warehouseId,
          binId: data.binId || undefined,
          quantity: Number(data.quantity),
          unitCost: Number(data.unitCost),
        },
      };

      const response = await fetch("/api/pt-pks/material-inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemPayload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create item");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["goods-receipts"] });
      toast.success("Barang masuk berhasil ditambahkan");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan barang masuk");
    },
  });

  const onSubmit = (data: BarangMasukFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Barang Masuk Baru (Tambah Item Baru)</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Receipt Information */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Informasi Penerimaan</h3>
              <div className="grid grid-cols-3 gap-4">
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
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Sumber</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe sumber" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PURCHASE">Pembelian</SelectItem>
                          <SelectItem value="RETURN">Pengembalian</SelectItem>
                          <SelectItem value="PRODUCTION">Produksi</SelectItem>
                          <SelectItem value="LOAN_RETURN">Pengembalian Pinjaman</SelectItem>
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
                      <FormLabel>Referensi Sumber</FormLabel>
                      <FormControl>
                        <Input placeholder="No. PO / Dokumen" {...field} />
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
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Catatan penerimaan (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Item Master Data */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-sm">Data Master Barang</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="SKU barang" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleGenerateSKU}
                          disabled={isGeneratingSKU}
                        >
                          {isGeneratingSKU ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>Klik tombol untuk auto-generate SKU</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Barang</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama barang" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi barang (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesData?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.code} - {cat.name}
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
                  name="itemTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Barang</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis barang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemTypesData?.map((type: any) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.code} - {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="baseUnitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Satuan Dasar</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih satuan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitsData?.map((unit: any) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.code} - {unit.name}
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
                  name="valuationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Valuasi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVERAGE">Average</SelectItem>
                          <SelectItem value="FIFO">FIFO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-2">
                      <div className="space-y-0.5">
                        <FormLabel>Aktif</FormLabel>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok Minimal</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stok Maksimal</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Stock Entry */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <h3 className="font-semibold text-sm">Stok Awal & Lokasi</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gudang</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih gudang" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="binId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bin/Rak (Opsional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedWarehouse}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bin (opsional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {binsData?.map((bin: any) => (
                            <SelectItem key={bin.id} value={bin.id}>
                              {bin.code} - {bin.name}
                            </SelectItem>
                          ))}
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
                  name="quantity"
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
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Satuan</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan Barang Masuk"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
