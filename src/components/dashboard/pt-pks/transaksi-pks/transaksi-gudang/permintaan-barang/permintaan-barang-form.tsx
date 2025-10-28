"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const schema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  requestDept: z.string().min(2, "Dept/Unit pemohon wajib diisi"),
  reason: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "APPROVED"]),
});

type PermintaanFormValues = z.infer<typeof schema>;

export default function PermintaanBarangForm({ onSubmit }: { onSubmit: (data: PermintaanFormValues) => void }) {
  const form = useForm<PermintaanFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      requestDept: '',
      reason: '',
      status: 'DRAFT',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Permintaan</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="requestDept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dept/Unit Pemohon</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan dept/unit pemohon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alasan/Keterangan</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan alasan permintaan (opsional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: Add dynamic item lines with barang, qty, satuan */}
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm text-muted-foreground">
            Daftar barang yang diminta akan ditambahkan di sini (TODO: implement dynamic lines)
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Form>
  );
}
