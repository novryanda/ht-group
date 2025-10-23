"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { accountCreateSchema } from "~/server/schemas/pt-pks/account";
import type { AccountDTO } from "~/server/types/pt-pks/account";
import { cn } from "~/lib/utils";

type FormValues = z.infer<typeof accountCreateSchema>;

interface AccountFormDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: AccountDTO | null;
  mode?: "create" | "edit";
}

type AccountTreeNode = AccountDTO & { depth: number };

const NO_PARENT_VALUE = "__NO_PARENT__";
const NO_CURRENCY_VALUE = "__NO_CURRENCY__";

const CURRENCY_OPTIONS = [
  "IDR",
  "USD",
  "EUR",
  "SGD",
  "JPY",
  "CNY",
  "MYR",
  "THB",
  "GBP",
] as const;

function flattenAccounts(nodes: AccountDTO[], depth = 0): AccountTreeNode[] {
  const result: AccountTreeNode[] = [];
  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.children?.length) {
      result.push(...flattenAccounts(node.children, depth + 1));
    }
  }
  return result;
}

function collectDescendantIds(node: AccountDTO | undefined, acc: Set<string>) {
  if (!node?.children) return;
  for (const child of node.children) {
    acc.add(child.id);
    collectDescendantIds(child, acc);
  }
}

function findNode(nodes: AccountDTO[], id: string): AccountDTO | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children ?? [], id);
    if (found) return found;
  }
  return undefined;
}

export function AccountFormDialog({
  companyId,
  open,
  onOpenChange,
  onSuccess,
  initialData,
  mode = "create",
}: AccountFormDialogProps) {
  const [treeData, setTreeData] = useState<AccountDTO[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(accountCreateSchema) as Resolver<FormValues>,
    defaultValues: {
      companyId,
      code: "",
      name: "",
      class: "ASSET",
      normalSide: "DEBIT",
      isPosting: true,
      isCashBank: false,
      taxCode: "NON_TAX",
      currency: "IDR",
      description: undefined,
      status: "AKTIF",
      parentId: null,
    } satisfies FormValues,
  });

  const isEdit = mode === "edit" && !!initialData?.id;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchTree = async () => {
      setIsLoadingParents(true);
      try {
        const res = await fetch(`/api/pt-pks/daftar-akun?companyId=${companyId}&tree=true`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Gagal memuat daftar akun");
        }
        const data = await res.json();
        if (!cancelled) {
          setTreeData(data.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Gagal memuat akun parent");
          setTreeData([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingParents(false);
        }
      }
    };

    fetchTree();
    return () => {
      cancelled = true;
    };
  }, [open, companyId]);

  useEffect(() => {
    if (!open) return;

    form.reset({
      companyId,
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      class: initialData?.class ?? "ASSET",
      normalSide: initialData?.normalSide ?? "DEBIT",
      isPosting: initialData?.isPosting ?? true,
      isCashBank: initialData?.isCashBank ?? false,
      taxCode: initialData?.taxCode ?? "NON_TAX",
      currency: initialData ? initialData.currency ?? null : "IDR",
      description: initialData?.description ?? undefined,
      status: initialData?.status ?? "AKTIF",
      parentId: initialData?.parentId ?? null,
    });
  }, [open, initialData, companyId, form]);

  const descendantIds = useMemo(() => {
    if (!initialData?.id) return new Set<string>();
    const ids = new Set<string>([initialData.id]);
    const node = findNode(treeData, initialData.id);
    collectDescendantIds(node, ids);
    return ids;
  }, [initialData, treeData]);

  const parentCandidates = useMemo(() => {
    const flattened = flattenAccounts(treeData);
    return flattened.filter((node) => !node.isPosting && !descendantIds.has(node.id));
  }, [treeData, descendantIds]);

  async function handleSubmit(values: FormValues) {
    const payload = {
      ...values,
      companyId,
      currency: values.currency ? values.currency.trim().toUpperCase() : null,
      description: values.description?.trim() || null,
      parentId: values.parentId || null,
    };

    const endpoint = isEdit ? `/api/pt-pks/daftar-akun/${initialData?.id}` : `/api/pt-pks/daftar-akun`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...payload, id: initialData?.id } : payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? "Gagal menyimpan akun");
      }

      toast.success(isEdit ? "Akun berhasil diperbarui" : "Akun berhasil dibuat");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan akun");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Akun" : "Buat Akun Baru"}</DialogTitle>
          <DialogDescription>
            Lengkapi detail akun. Parent hanya dapat dipilih dari akun header (non posting).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Akun *</FormLabel>
                    <FormControl>
                      <Input placeholder="1-1101" {...field} />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AKTIF">Aktif</SelectItem>
                        <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Akun *</FormLabel>
                  <FormControl>
                    <Input placeholder="Kas Kecil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Klasifikasi *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih klasifikasi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ASSET">Asset</SelectItem>
                        <SelectItem value="LIABILITY">Liability</SelectItem>
                        <SelectItem value="EQUITY">Equity</SelectItem>
                        <SelectItem value="REVENUE">Revenue</SelectItem>
                        <SelectItem value="COGS">COGS</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="OTHER_INCOME">Other Income</SelectItem>
                        <SelectItem value="OTHER_EXPENSE">Other Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="normalSide"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Normal Side *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sisi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DEBIT">Debit</SelectItem>
                        <SelectItem value="CREDIT">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pajak</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kode pajak" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NON_TAX">Non Pajak</SelectItem>
                        <SelectItem value="PPN_MASUKAN">PPN Masukan</SelectItem>
                        <SelectItem value="PPN_KELUARAN">PPN Keluaran</SelectItem>
                        <SelectItem value="PPH21">PPh 21</SelectItem>
                        <SelectItem value="PPH22">PPh 22</SelectItem>
                        <SelectItem value="PPH23">PPh 23</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Uang</FormLabel>
                    <Select
                      value={field.value ?? NO_CURRENCY_VALUE}
                      onValueChange={(value) => field.onChange(value === NO_CURRENCY_VALUE ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata uang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_CURRENCY_VALUE}>Tanpa mata uang</SelectItem>
                        {CURRENCY_OPTIONS.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
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
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Akun</FormLabel>
                  <Select
                    value={field.value ?? NO_PARENT_VALUE}
                    onValueChange={(value) => field.onChange(value === NO_PARENT_VALUE ? null : value)}
                    disabled={isLoadingParents || parentCandidates.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isLoadingParents ? "Memuat data..." : "Tanpa parent"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_PARENT_VALUE}>Tanpa parent</SelectItem>
                      {parentCandidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          <span
                            className={cn(
                              "flex items-center",
                              candidate.depth > 0 && "text-sm",
                            )}
                            style={{ paddingLeft: candidate.depth * 12 }}
                          >
                            <span className="font-mono mr-2">{candidate.code}</span>
                            <span>{candidate.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 md:flex-row md:gap-6">
              <FormField
                control={form.control}
                name="isPosting"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Posting Account</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Jika dinonaktifkan, akun menjadi header dan dapat memiliki sub-akun.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isCashBank"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Cash / Bank</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Tanda akun sebagai kas atau bank untuk modul treasury.
                      </p>
                    </div>
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
                    <Textarea
                      placeholder="Catatan tambahan atau penjelasan akun"
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? isEdit
                    ? "Menyimpan..."
                    : "Membuat..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Buat Akun"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
