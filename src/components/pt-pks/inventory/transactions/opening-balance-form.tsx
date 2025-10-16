"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";

const openingBalanceSchema = z.object({
  lines: z.array(
    z.object({
      materialId: z.string().min(1, "Material wajib dipilih"),
      locationId: z.string().min(1, "Lokasi wajib dipilih"),
      qty: z.coerce.number().positive("Qty harus lebih dari 0"),
    })
  ).min(1, "Minimal 1 item"),
});

type OpeningBalanceFormData = z.infer<typeof openingBalanceSchema>;

export function OpeningBalanceForm() {
  const { toast } = useToast();

  const form = useForm<OpeningBalanceFormData>({
    resolver: zodResolver(openingBalanceSchema),
    defaultValues: {
      lines: [{ materialId: "", locationId: "", qty: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
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

  const mutation = useMutation({
    mutationFn: async (data: OpeningBalanceFormData) => {
      const res = await fetch("/api/inventory/opening-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to post opening balance");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opening balance posted successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OpeningBalanceFormData) => {
    if (confirm("Are you sure you want to post opening balance? This action cannot be undone.")) {
      mutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posting Saldo Awal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start border p-4 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.materialId`}
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
                      name={`lines.${index}.locationId`}
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
                      name={`lines.${index}.qty`}
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
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mt-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ materialId: "", locationId: "", qty: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Posting..." : "Post Saldo Awal"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

