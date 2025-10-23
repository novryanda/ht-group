"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import type { AccountDTO } from "~/server/types/pt-pks/account";

interface AccountTableProps {
  accounts: AccountDTO[];
  onEdit?: (account: AccountDTO) => void;
  onDelete?: (account: AccountDTO) => void;
  isLoading?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  canManage?: boolean;
}

export function AccountTable({
  accounts,
  onEdit,
  onDelete,
  isLoading,
  page = 1,
  pageSize = 50,
  total = 0,
  onPageChange,
  canManage = false,
}: AccountTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showActions = canManage && (onEdit || onDelete);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/40 border-t-transparent" />
          <span>Memuat daftar akun...</span>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center text-muted-foreground">
        Belum ada akun untuk filter saat ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Kode</TableHead>
              <TableHead>Nama Akun</TableHead>
              <TableHead className="w-[140px]">Klasifikasi</TableHead>
              <TableHead className="w-[100px]">Normal</TableHead>
              <TableHead className="w-[110px]">Posting</TableHead>
              <TableHead className="w-[130px]">Cash/Bank</TableHead>
              <TableHead className="w-[130px]">Kode Pajak</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              {showActions && <TableHead className="w-[80px] text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono text-sm">{account.code}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{account.name}</span>
                    {account.parentId && (
                      <span className="text-xs text-muted-foreground">Parent: {account.parentId}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs uppercase tracking-wide">
                    {account.class.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={account.normalSide === "DEBIT" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {account.normalSide}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={account.isPosting ? "default" : "secondary"} className="text-xs">
                    {account.isPosting ? "Posting" : "Header"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {account.isCashBank ? (
                    <Badge variant="outline" className="text-xs">
                      Kas / Bank
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {account.taxCode === "NON_TAX" ? (
                    <span className="text-sm text-muted-foreground">-</span>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {account.taxCode.replace("_", " ")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={account.status === "AKTIF" ? "default" : "secondary"} className="text-xs">
                    {account.status}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(account)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(account)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, total)} dari {total} akun
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
