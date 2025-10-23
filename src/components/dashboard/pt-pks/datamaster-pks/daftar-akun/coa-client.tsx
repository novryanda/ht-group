"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, FileUp } from "lucide-react";

import {
  AccountFilters,
  AccountFormDialog,
  AccountTable,
  AccountTree,
  ImportDialog,
  SystemMappingForm,
} from ".";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { AccountDTO } from "~/server/types/pt-pks/account";

type UserRole =
  | "GROUP_VIEWER"
  | "EXECUTIVE"
  | "PT_MANAGER"
  | "PT_NILO_ADMIN"
  | "PT_ZTA_ADMIN"
  | "PT_TAM_ADMIN"
  | "PT_HTK_ADMIN"
  | "PT_PKS_ADMIN"
  | "UNIT_SUPERVISOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "HR"
  | "FINANCE_AR"
  | "FINANCE_AP"
  | "GL_ACCOUNTANT";

type FiltersState = {
  search?: string;
  classes?: string[];
  status?: "AKTIF" | "NONAKTIF";
};

interface DaftarAkunClientProps {
  companyId: string;
  companyName: string;
  userRole?: UserRole | null;
}

const PAGE_SIZE = 50;

export function DaftarAkunClient({ companyId, companyName, userRole }: DaftarAkunClientProps) {
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const [filters, setFilters] = useState<FiltersState>({});
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [treeData, setTreeData] = useState<AccountDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDTO | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountDTO | null>(null);
  const [activeTab, setActiveTab] = useState<"accounts" | "mapping">("accounts");

  const canManage = useMemo(
    () => userRole === "PT_PKS_ADMIN" || userRole === "GL_ACCOUNTANT",
    [userRole],
  );

  const canRead = useMemo(
    () => ["PT_PKS_ADMIN", "GL_ACCOUNTANT", "EXECUTIVE"].includes(userRole ?? ""),
    [userRole],
  );

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        companyId,
        page: page.toString(),
        pageSize: PAGE_SIZE.toString(),
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      filters.classes?.forEach((cls) => params.append("class", cls));

      const res = await fetch(`/api/pt-pks/daftar-akun?${params.toString()}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? "Gagal memuat daftar akun");
      }
      const data = await res.json();
      setAccounts(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat daftar akun");
      setAccounts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, page, filters]);

  const fetchTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ companyId, tree: "true" });
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/pt-pks/daftar-akun?${params.toString()}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? "Gagal memuat tree akun");
      }
      const data = await res.json();
      setTreeData(data.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat tree akun");
      setTreeData([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filters]);

  useEffect(() => {
    if (!canRead) return;
    if (viewMode === "list") {
      fetchList();
    } else {
      fetchTree();
    }
  }, [viewMode, fetchList, fetchTree, canRead]);

  const handleFilterChange = (nextFilters: FiltersState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleToggleView = (isTree: boolean) => {
    setViewMode(isTree ? "tree" : "list");
    setPage(1);
  };

  const handleEdit = (account: AccountDTO) => {
    setSelectedAccount(account);
    setFormOpen(true);
  };

  const handleDelete = (account: AccountDTO) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      const res = await fetch(`/api/pt-pks/daftar-akun/${accountToDelete.id}`, { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result?.error ?? "Gagal menghapus akun");
      }
      toast.success("Akun berhasil dihapus");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      if (viewMode === "list") {
        fetchList();
      } else {
        fetchTree();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus akun");
    }
  };

  const handleFormSuccess = () => {
    if (viewMode === "list") {
      fetchList();
    } else {
      fetchTree();
    }
  };

  const handleImportSuccess = () => {
    if (viewMode === "list") {
      fetchList();
    } else {
      fetchTree();
    }
  };

  if (!canRead) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-semibold">Akses ditolak</h1>
        <p className="mt-2 text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses modul Daftar Akun PT PKS.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Daftar Akun PT PKS</h1>
        <p className="text-muted-foreground">
          Kelola Chart of Accounts untuk {companyName}. Gunakan filter dan mapping sistem untuk menjaga konsistensi transaksi.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "accounts" | "mapping")}>
        <TabsList>
          <TabsTrigger value="accounts">Daftar Akun</TabsTrigger>
          <TabsTrigger value="mapping">System Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Data Akun</CardTitle>
                <CardDescription>
                  Tambahkan, perbarui, dan kelola akun. Toggle untuk melihat struktur tree.
                </CardDescription>
              </div>
              {canManage && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                  <Button size="sm" onClick={() => { setSelectedAccount(null); setFormOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Akun
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <AccountFilters
                onFilterChange={handleFilterChange}
                onViewToggle={handleToggleView}
                isTreeView={viewMode === "tree"}
              />

              {viewMode === "tree" ? (
                isLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Memuat struktur tree akun...
                  </div>
                ) : (
                  <AccountTree
                    data={treeData}
                    onEdit={canManage ? handleEdit : undefined}
                    onDelete={canManage ? handleDelete : undefined}
                    canManage={canManage}
                  />
                )
              ) : (
                <AccountTable
                  accounts={accounts}
                  onEdit={canManage ? handleEdit : undefined}
                  onDelete={canManage ? handleDelete : undefined}
                  isLoading={isLoading}
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  onPageChange={(nextPage) => setPage(nextPage)}
                  canManage={canManage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <SystemMappingForm companyId={companyId} disabled={!canManage} />
        </TabsContent>
      </Tabs>

      <AccountFormDialog
        companyId={companyId}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={selectedAccount}
        onSuccess={handleFormSuccess}
        mode={selectedAccount ? "edit" : "create"}
      />

      <ImportDialog
        companyId={companyId}
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={handleImportSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus akun {accountToDelete?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pastikan akun tidak memiliki sub-akun sebelum menghapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
