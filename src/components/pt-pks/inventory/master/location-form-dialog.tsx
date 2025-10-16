"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import type { LocationDTO } from "~/server/types/inventory";

const locationSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  code: z.string().min(1, "Kode wajib diisi").max(20, "Kode maksimal 20 karakter"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  type: z.enum(["ZONE", "RACK", "BIN"]),
  isActive: z.boolean(),
  parentId: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  location?: LocationDTO | null;
}

export function LocationFormDialog({ open, onClose, location }: LocationFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!location;

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name ?? "",
      code: location?.code ?? "",
      warehouseId: location?.warehouseId ?? "",
      type: (location?.type as "ZONE" | "RACK" | "BIN") ?? "ZONE",
      isActive: location?.isActive ?? false,
      parentId: location?.parentId ?? undefined,
    },
  });

  const selectedWarehouseId = form.watch("warehouseId");
  const selectedType = form.watch("type");

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/warehouses?pageSize=100&isActive=true");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  // Fetch parent locations (only if type is RACK or BIN)
  const { data: parentLocationsData } = useQuery({
    queryKey: ["parent-locations", selectedWarehouseId, selectedType],
    queryFn: async () => {
      if (!selectedWarehouseId) return null;
      const parentType = selectedType === "RACK" ? "ZONE" : selectedType === "BIN" ? "RACK" : null;
      if (!parentType) return null;
      
      const params = new URLSearchParams({
        warehouseId: selectedWarehouseId,
        type: parentType,
        isActive: "true",
        pageSize: "100",
      });
      const res = await fetch(`/api/inventory/locations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch parent locations");
      return res.json();
    },
    enabled: !!selectedWarehouseId && (selectedType === "RACK" || selectedType === "BIN"),
  });

  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name ?? "",
        code: location.code ?? "",
        warehouseId: location.warehouseId ?? "",
        type: (location.type as "ZONE" | "RACK" | "BIN") ?? "ZONE",
        isActive: location.isActive ?? false,
        parentId: location.parentId ?? undefined,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        warehouseId: "",
        type: "ZONE",
        isActive: false,
        parentId: undefined,
      });
    }
  }, [location, form]);

  const mutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const url = isEdit ? `/api/inventory/locations/${location.id}` : "/api/inventory/locations";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          parentId: data.parentId || undefined,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Success",
        description: `Location ${isEdit ? "updated" : "created"} successfully`,
      });
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

  const onSubmit: SubmitHandler<LocationFormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ZONE">ZONE</SelectItem>
                      <SelectItem value="RACK">RACK</SelectItem>
                      <SelectItem value="BIN">BIN</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Hierarchy: ZONE → RACK → BIN
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(selectedType === "RACK" || selectedType === "BIN") && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Location</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada parent</SelectItem>
                        {parentLocationsData?.data?.map((loc: any) => (
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
            )}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ZONE-A" disabled={isEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Zone A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Aktif</FormLabel>
                    <FormDescription>
                      Lokasi aktif dapat digunakan untuk transaksi
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

