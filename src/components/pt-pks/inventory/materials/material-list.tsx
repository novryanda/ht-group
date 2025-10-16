"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { MaterialFormDialog } from "./material-form-dialog";
import { Skeleton } from "~/components/ui/skeleton";

interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: {
    id: string;
    code: string;
    name: string;
  };
  baseUom: {
    id: string;
    code: string;
    name: string;
  };
  isActive: boolean;
  minStock?: number;
  maxStock?: number;
  createdAt: string;
}

interface MaterialListResponse {
  success: boolean;
  data: Material[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function MaterialList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const { data, isLoading, refetch } = useQuery<MaterialListResponse>({
    queryKey: ["materials", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/inventory/materials?${params}`);
      if (!res.ok) throw new Error("Failed to fetch materials");
      return res.json();
    },
  });

  const handleCreate = () => {
    setSelectedMaterial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedMaterial(null);
    void refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base">Daftar Material</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari material..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleCreate} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Material</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead>Min/Max Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.code}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{material.name}</div>
                              {material.description && (
                                <div className="text-xs text-muted-foreground">
                                  {material.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{material.category.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {material.category.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{material.baseUom.code}</TableCell>
                          <TableCell>
                            {material.minStock !== null && material.maxStock !== null ? (
                              <span className="text-sm">
                                {material.minStock} / {material.maxStock}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={material.isActive ? "default" : "secondary"}>
                              {material.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(material)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Tidak ada data material
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Halaman {data.pagination.page} dari {data.pagination.totalPages} (
                    {data.pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pagination.totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <MaterialFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        material={selectedMaterial}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

