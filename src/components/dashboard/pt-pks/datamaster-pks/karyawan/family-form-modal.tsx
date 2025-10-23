"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FamilyRelation } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface FamilyFormModalProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * ✅ CORRECT: Zod schema for family form
 *
 * Key points:
 * 1. Required fields: nama, hubungan
 * 2. Optional fields use .optional().nullable() to accept undefined/null
 * 3. NO .transform() that could produce empty string
 */
const familyFormSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  hubungan: z.nativeEnum(FamilyRelation),
  jenis_kelamin: z.string().regex(/^[LP]$/, "Jenis kelamin harus L atau P").optional().nullable(),
  tanggal_lahir: z.string().optional().nullable(),
  umur: z.coerce.number().int().min(0).max(150).optional().nullable(),
  no_nik_ktp: z.string().max(20).optional().nullable(),
  no_bpjs_kesehatan: z.string().max(50).optional().nullable(),
  no_telp_hp: z.string().max(20).optional().nullable(),
});

type FamilyFormData = z.infer<typeof familyFormSchema>;

export function FamilyFormModal({ employeeId, isOpen, onClose, onSuccess }: FamilyFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeName, setEmployeeName] = useState<string>("");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      nama: "",
      // ✅ FIX: Use undefined for required enum, not a default value
      hubungan: undefined as unknown as FamilyRelation,
      jenis_kelamin: undefined,
      tanggal_lahir: undefined,
      umur: undefined,
      no_nik_ktp: undefined,
      no_bpjs_kesehatan: undefined,
      no_telp_hp: undefined,
    },
  });

  useEffect(() => {
    if (isOpen && employeeId) {
      loadEmployeeName();
      form.reset();
    }
  }, [isOpen, employeeId]);

  const loadEmployeeName = async () => {
    if (!employeeId) return;

    try {
      const response = await fetch(`/api/pt-pks/karyawan/${employeeId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setEmployeeName(result.data.employee.nama || "");
      }
    } catch (error) {
      console.error("Error loading employee:", error);
    }
  };

  const onSubmit = async (data: FamilyFormData) => {
    if (!employeeId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/pt-pks/karyawan/${employeeId}/keluarga`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Data keluarga berhasil ditambahkan",
        });
        onSuccess();
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menambahkan data keluarga",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding family:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan data keluarga",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Keluarga</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Tambah data keluarga untuk <strong>{employeeName}</strong>
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nama - Required */}
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hubungan - Required */}
            <FormField
              control={form.control}
              name="hubungan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hubungan <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hubungan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={FamilyRelation.ISTRI}>Istri</SelectItem>
                      <SelectItem value={FamilyRelation.ANAK}>Anak</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jenis Kelamin - Optional */}
            <FormField
              control={form.control}
              name="jenis_kelamin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanggal Lahir - Optional */}
            <FormField
              control={form.control}
              name="tanggal_lahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Umur - Optional */}
            <FormField
              control={form.control}
              name="umur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Umur</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Umur"
                      {...field}
                      value={typeof field.value === 'number' ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NIK/KTP - Optional */}
            <FormField
              control={form.control}
              name="no_nik_ktp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK/KTP</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor NIK/KTP" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BPJS Kesehatan - Optional */}
            <FormField
              control={form.control}
              name="no_bpjs_kesehatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. BPJS Kesehatan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nomor BPJS Kesehatan"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* No. HP - Optional */}
            <FormField
              control={form.control}
              name="no_telp_hp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. HP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nomor HP"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

