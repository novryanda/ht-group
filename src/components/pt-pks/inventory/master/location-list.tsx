"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { LocationFormDialog } from "./location-form-dialog";
import type { LocationDTO } from "~/server/types/inventory";

export function LocationList() {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationDTO | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch warehouses for filter
  const { data: warehousesData } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/warehouses?pageSize=100");
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return res.json();
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["locations", { search, warehouseFilter, typeFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(search && { search }),
        ...(warehouseFilter && { warehouseId: warehouseFilter }),
        ...(typeFilter && { type: typeFilter }),
      });
      const res = await fetch(`/api/inventory/locations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/locations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete location");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({ title: "Success", description: "Location deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (location: LocationDTO) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const getLocationTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      ZONE: "default",
      RACK: "secondary",
      BIN: "outline",
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lokasi Penyimpanan</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Lokasi
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={warehouseFilter || "all"}
            onValueChange={(value) => setWarehouseFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Gudang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gudang</SelectItem>
              {warehousesData?.data?.map((wh: any) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="ZONE">ZONE</SelectItem>
              <SelectItem value="RACK">RACK</SelectItem>
              <SelectItem value="BIN">BIN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((location: LocationDTO) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.code}</TableCell>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{location.warehouse?.name}</TableCell>
                    <TableCell>{getLocationTypeBadge(location.type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {location.parent?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.isActive ? "default" : "secondary"}>
                        {location.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data?.data?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada data lokasi
              </div>
            )}

            {data?.pagination && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Halaman {data.pagination.page} dari {data.pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <LocationFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        location={editingLocation}
      />
    </Card>
  );
}

