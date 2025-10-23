"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";

const createSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2200),
  month: z.coerce.number().int().min(1).max(12),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

const editSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isClosed: z.boolean().optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

type Props =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSubmit: (values: CreateValues) => Promise<void>;
      defaultValues?: Partial<CreateValues>;
      isSubmitting?: boolean;
    }
  | {
      mode: "edit";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSubmit: (values: EditValues) => Promise<void>;
      defaultValues?: Partial<EditValues>;
      isSubmitting?: boolean;
      disableClosedToggle?: boolean;
    };

function toDateInput(date: string | Date | undefined): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return format(value, "yyyy-MM-dd");
}

export function FiscalPeriodFormDialog(props: Props) {
  const { open, onOpenChange, isSubmitting } = props;

  const form = useForm<any>({
    resolver: zodResolver(props.mode === "create" ? createSchema : editSchema),
    defaultValues: props.mode === "create"
      ? {
          year: props.defaultValues?.year ?? new Date().getFullYear(),
          month: props.defaultValues?.month ?? new Date().getMonth() + 1,
          startDate: toDateInput(props.defaultValues?.startDate ?? new Date()),
          endDate: toDateInput(
            props.defaultValues?.endDate ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          ),
        }
      : {
          startDate: toDateInput(props.defaultValues?.startDate),
          endDate: toDateInput(props.defaultValues?.endDate),
          isClosed: props.defaultValues?.isClosed ?? false,
        },
  });

  useEffect(() => {
    if (props.mode !== "create") return;
    const subscription = form.watch((value, { name }) => {
      if (!name) return;
      if (name === "month" || name === "year") {
        const year = Number(value.year);
        const month = Number(value.month);
        if (Number.isNaN(year) || Number.isNaN(month)) return;
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        form.setValue("startDate", format(start, "yyyy-MM-dd"));
        form.setValue("endDate", format(end, "yyyy-MM-dd"));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, props.mode]);

  useEffect(() => {
    if (!open) {
      form.reset(props.defaultValues);
    }
  }, [open, props.defaultValues, form]);

  async function handleSubmit(values: any) {
    if (props.mode === "create") {
      await props.onSubmit({
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });
    } else {
      await props.onSubmit({
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        isClosed: values.isClosed,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Tambah Periode Fiskal" : "Ubah Periode Fiskal"}</DialogTitle>
          <DialogDescription>
            {props.mode === "create"
              ? "Buat periode fiskal baru untuk perusahaan."
              : "Perbarui tanggal dan status periode fiskal."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {props.mode === "create" ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun</FormLabel>
                        <FormControl>
                          <Input type="number" min={1900} max={2200} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bulan</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={12} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {props.mode === "edit" ? (
              <FormField
                control={form.control}
                name="isClosed"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Status Periode</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Tandai sebagai ditutup apabila periode telah selesai.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={props.disableClosedToggle} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : props.mode === "create" ? "Simpan" : "Perbarui"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
