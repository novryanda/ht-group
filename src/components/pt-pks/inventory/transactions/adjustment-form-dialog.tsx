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

const adjustmentSchema = z.object({
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  reason: z.string().min(1, "Alasan wajib diisi"),
  note: z.string().optional(),
  items: z.array(
    z.object({
      materialId: z.string().min(1, "Material wajib dipilih"),
      locationId: z.string().min(1, "Lokasi wajib dipilih"),
      qtyDiff: z.coerce.number().refine((val) => val !== 0, "Qty diff tidak boleh 0"),
      uomId: z.string().min(1, "UoM wajib dipilih"),
      note: z.string().optional(),
    })
  ).min(1, "Minimal 1 item"),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface AdjustmentFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AdjustmentFormDialog({ open, onClose }: AdjustmentFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      warehouseId: "",
      date: new Date().toISOString().split("T")[0],
      reason: "",
      note: "",
      items: [{ materialId: "", locationId: "", qtyDiff: 0, uomId: "", note: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
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

  // Fetch UoMs
  const { data: uomsData } = useQuery({
    queryKey: ["uoms-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/uom?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch UoMs");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AdjustmentFormData) => {
      const res = await fetch("/api/inventory/adjustment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create adjustment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast({
        title: "Success",
        description: "Adjustment created successfully",
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

  const onSubmit = (data: AdjustmentFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Stock Adjustment</DialogTitle>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Kerusakan, Kehilangan, Koreksi, dll" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                <FormLabel>Items * (Qty Diff: positif = tambah, negatif = kurang)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ materialId: "", locationId: "", qtyDiff: 0, uomId: "", note: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Item {index + 1}</span>
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
                      name={`items.${index}.materialId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                      name={`items.${index}.locationId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokasi *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                      name={`items.${index}.qtyDiff`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty Diff * (+/-)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} placeholder="10 atau -5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.uomId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UoM *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih UoM" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {uomsData?.data?.items?.map((uom: any) => (
                                <SelectItem key={uom.id} value={uom.id}>
                                  {uom.name}
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
                    name={`items.${index}.note`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Item</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Catatan untuk item ini" />
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
                {mutation.isPending ? "Menyimpan..." : "Simpan & Posting"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

