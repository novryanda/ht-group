"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  loanIssueId: z.string().min(1, "Transaksi pinjaman wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  warehouseId: z.string().min(1, "Gudang wajib dipilih"),
  note: z.string().optional(),
  lines: z
    .array(
      z.object({
        loanIssueLineId: z.string().min(1),
        itemId: z.string().min(1),
        itemName: z.string(),
        qtyLoan: z.number(),
        qtyReturned: z.number(),
        qtyReturn: z.number().min(0, "Jumlah tidak boleh negatif"),
        note: z.string().optional(),
      })
    )
    .min(1, "Minimal 1 item harus dikembalikan"),
}).refine(
  (data) => {
    // At least one item must have qtyReturn > 0
    return data.lines.some((line) => line.qtyReturn > 0);
  },
  {
    message: "Minimal 1 item harus memiliki jumlah pengembalian > 0",
    path: ["lines"],
  }
);

type FormValues = z.infer<typeof formSchema>;

interface LoanReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoanReturnDialog({
  open,
  onOpenChange,
  onSuccess,
}: LoanReturnDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanIssueId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      warehouseId: "",
      note: "",
      lines: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Fetch active loans
  const { data: loansData, isLoading: isLoadingLoans } = useQuery({
    queryKey: ["active-loans"],
    queryFn: async () => {
      const res = await fetch("/api/pt-pks/transaksi-gudang/active-loans?limit=100");
      if (!res.ok) throw new Error("Failed to fetch active loans");
      return res.json();
    },
    enabled: open,
  });

  // Fetch selected loan details
  const { data: loanDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["loan-details", selectedLoanId],
    queryFn: async () => {
      if (!selectedLoanId) return null;
      const res = await fetch(`/api/pt-pks/transaksi-gudang/barang-keluar/${selectedLoanId}`);
      if (!res.ok) throw new Error("Failed to fetch loan details");
      return res.json();
    },
    enabled: !!selectedLoanId && open,
  });

  // Populate lines when loan is selected
  useEffect(() => {
    if (loanDetails?.data) {
      const loan = loanDetails.data;
      form.setValue("warehouseId", loan.warehouseId);
      
      const lines = loan.lines.map((line: any) => ({
        loanIssueLineId: line.id,
        itemId: line.itemId,
        itemName: line.itemName || "",
        qtyLoan: line.qty,
        qtyReturned: line.qtyReturned || 0,
        qtyReturn: 0,
        note: "",
      }));
      
      replace(lines);
    }
  }, [loanDetails, form, replace]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Filter only lines with qtyReturn > 0
      const returnLines = values.lines
        .filter((line) => line.qtyReturn > 0)
        .map((line) => ({
          loanIssueLineId: line.loanIssueLineId,
          itemId: line.itemId,
          qtyReturned: line.qtyReturn,
          note: line.note,
        }));

      const payload = {
        loanIssueId: values.loanIssueId,
        date: values.date,
        warehouseId: values.warehouseId,
        note: values.note,
        lines: returnLines,
      };

      const res = await fetch("/api/pt-pks/transaksi-gudang/loan-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        form.reset();
        setSelectedLoanId("");
        onSuccess?.();
      } else {
        alert(result.error || "Gagal memproses pengembalian");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setSelectedLoanId("");
      onOpenChange(false);
    }
  };

  const handleLoanSelect = (loanId: string) => {
    setSelectedLoanId(loanId);
    form.setValue("loanIssueId", loanId);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pengembalian Barang Pinjaman</DialogTitle>
          <DialogDescription>
            Catat pengembalian barang yang dipinjam
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loanIssueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaksi Pinjaman *</FormLabel>
                    <Select
                      onValueChange={handleLoanSelect}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih transaksi pinjaman" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLoans && (
                          <div className="p-2 text-sm text-muted-foreground">
                            Loading...
                          </div>
                        )}
                        {loansData?.data?.map((loan: any) => (
                          <SelectItem key={loan.id} value={loan.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{loan.docNumber}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(loan.date), "dd/MM/yyyy")} - {loan.loanReceiver}
                              </span>
                            </div>
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
                    <FormLabel>Tanggal Pengembalian *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {loanDetails?.data && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Info Peminjaman</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Peminjam:</span>{" "}
                    <span className="font-medium">{loanDetails.data.loanReceiver}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Dept:</span>{" "}
                    <span className="font-medium">{loanDetails.data.targetDept}</span>
                  </div>
                  {loanDetails.data.expectedReturnAt && (
                    <div>
                      <span className="text-muted-foreground">Jatuh Tempo:</span>{" "}
                      <span className="font-medium">
                        {format(new Date(loanDetails.data.expectedReturnAt), "dd/MM/yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan pengembalian..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items to return */}
            {fields.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Item yang Dikembalikan</h4>
                
                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const qtyLoan = form.watch(`lines.${index}.qtyLoan`);
                    const qtyReturned = form.watch(`lines.${index}.qtyReturned`);
                    const qtyRemaining = qtyLoan - qtyReturned;
                    
                    return (
                      <div key={field.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{field.itemName}</p>
                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                              <span>Dipinjam: {qtyLoan}</span>
                              <span>Sudah Kembali: {qtyReturned}</span>
                              <Badge variant={qtyRemaining > 0 ? "destructive" : "success"}>
                                Sisa: {qtyRemaining}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {qtyRemaining > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`lines.${index}.qtyReturn`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Jumlah Dikembalikan</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        const maxReturn = qtyRemaining;
                                        field.onChange(Math.min(value, maxReturn));
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                  <p className="text-xs text-muted-foreground">
                                    Max: {qtyRemaining}
                                  </p>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`lines.${index}.note`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Catatan</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Kondisi, dll..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {qtyRemaining === 0 && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Item ini sudah dikembalikan semua</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!selectedLoanId && (
              <div className="text-center py-8 text-muted-foreground">
                Pilih transaksi pinjaman untuk melihat item yang dapat dikembalikan
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedLoanId || fields.length === 0}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengembalian
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
