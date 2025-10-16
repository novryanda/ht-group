"use client";

import { useForm } from "react-hook-form";
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

const transferSchema = z.object({
  materialId: z.string().min(1, "Material wajib dipilih"),
  fromLocationId: z.string().min(1, "Lokasi asal wajib dipilih"),
  toLocationId: z.string().min(1, "Lokasi tujuan wajib dipilih"),
  qty: z.coerce.number().positive("Qty harus lebih dari 0"),
  uomId: z.string().min(1, "UoM wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  note: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TransferFormDialog({ open, onClose }: TransferFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      materialId: "",
      fromLocationId: "",
      toLocationId: "",
      qty: 0,
      uomId: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
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

  // Fetch locations
  const { data: locationsData } = useQuery({
    queryKey: ["locations-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/locations?pageSize=100&isActive=true");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
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
    mutationFn: async (data: TransferFormData) => {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create transfer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast({
        title: "Success",
        description: "Transfer created successfully",
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

  const onSubmit = (data: TransferFormData) => {
    if (data.fromLocationId === data.toLocationId) {
      toast({
        title: "Error",
        description: "Lokasi asal dan tujuan tidak boleh sama",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buat Stock Transfer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="materialId"
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dari Lokasi *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lokasi asal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationsData?.data?.items?.map((loc: any) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.warehouse?.name} - {loc.name}
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
                name="toLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ke Lokasi *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lokasi tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationsData?.data?.items?.map((loc: any) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.warehouse?.name} - {loc.name}
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
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qty *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uomId"
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

