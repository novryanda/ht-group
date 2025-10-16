"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";

const stockCountSchema = z.object({
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().optional(),
  lines: z.array(
    z.object({
      materialId: z.string().min(1, "Material wajib dipilih"),
      locationId: z.string().min(1, "Lokasi wajib dipilih"),
      systemQty: z.coerce.number().min(0, "System qty tidak boleh negatif"),
      countedQty: z.coerce.number().min(0, "Counted qty tidak boleh negatif"),
      note: z.string().optional(),
    })
  ).min(1, "Minimal 1 item"),
});

type StockCountFormData = z.infer<typeof stockCountSchema>;

interface StockCountFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StockCountFormDialog({ open, onClose }: StockCountFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StockCountFormData>({
    resolver: zodResolver(stockCountSchema),
    defaultValues: {
      warehouseId: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
      lines: [{ materialId: "", locationId: "", systemQty: 0, countedQty: 0, note: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const selectedWarehouseId = form.watch("warehouseId");

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/warehouses?pageSize=100&isActive=true");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  // Fetch materials
  const { data: materialsData } = useQuery({
    queryKey: ["materials-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/materials?pageSize=100&isActive=true");
      if (!res.ok) throw new Error("Failed to fetch materials");
      return res.json();
    },
  });

  // Fetch locations for selected warehouse
  const { data: locationsData } = useQuery({
    queryKey: ["locations-by-warehouse", selectedWarehouseId],
    queryFn: async () => {
      if (!selectedWarehouseId) return null;
      const res = await fetch(`/api/inventory/locations?warehouseId=${selectedWarehouseId}&isActive=true&pageSize=100`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: !!selectedWarehouseId,
  });

  // Fetch stock data
  const { data: stockData } = useQuery({
    queryKey: ["stock-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/stock?pageSize=500");
      if (!res.ok) throw new Error("Failed to fetch stock");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: StockCountFormData) => {
      const res = await fetch("/api/inventory/stock-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create stock count");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-counts"] });
      toast({
        title: "Success",
        description: "Stock count created successfully (status: OPEN)",
      });
      form.reset();
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

  const onSubmit = (data: StockCountFormData) => {
    mutation.mutate(data);
  };

  // Auto-fill system qty when material and location are selected
  const handleMaterialLocationChange = (index: number, materialId: string, locationId: string) => {
    if (materialId && locationId && stockData?.data?.items) {
      const stock = stockData.data.items.find(
        (s: any) => s.materialId === materialId && s.locationId === locationId
      );
      if (stock) {
        form.setValue(`lines.${index}.systemQty`, stock.qtyOnHand);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Stock Count</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gudang *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehousesData?.data?.items?.map((wh: any) => (
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Lines *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ materialId: "", locationId: "", systemQty: 0, countedQty: 0, note: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Line
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Line {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.materialId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const locationId = form.getValues(`lines.${index}.locationId`);
                              handleMaterialLocationChange(index, value, locationId);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materialsData?.data?.items?.map((mat: any) => (
                                <SelectItem key={mat.id} value={mat.id}>
                                  {mat.name}
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
                      name={`lines.${index}.locationId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokasi *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const materialId = form.getValues(`lines.${index}.materialId`);
                              handleMaterialLocationChange(index, materialId, value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih lokasi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locationsData?.data?.items?.map((loc: any) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name}
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
                      name={`lines.${index}.systemQty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Qty</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} disabled />
                          </FormControl>
                          <FormDescription>Auto-filled dari stock</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.countedQty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Counted Qty *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormDescription>Hasil perhitungan fisik</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`lines.${index}.note`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Line</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Catatan untuk line ini" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan (Status: OPEN)"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

