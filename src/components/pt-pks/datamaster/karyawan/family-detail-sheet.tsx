"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import type { EmployeeFamilyDTO } from "~/server/types/karyawan";

interface FamilyDetailSheetProps {
  employeeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FamilyDetailSheet({ employeeId, isOpen, onClose }: FamilyDetailSheetProps) {
  const [families, setFamilies] = useState<EmployeeFamilyDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeName, setEmployeeName] = useState<string>("");

  useEffect(() => {
    if (isOpen && employeeId) {
      loadFamilies();
    }
  }, [isOpen, employeeId]);

  const loadFamilies = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      // Load employee detail to get name
      const employeeResponse = await fetch(`/api/pt-pks/karyawan/${employeeId}`);
      const employeeResult = await employeeResponse.json();

      if (employeeResult.success && employeeResult.data) {
        setEmployeeName(employeeResult.data.employee.nama || "");
      }

      // Load families
      const response = await fetch(`/api/pt-pks/karyawan/${employeeId}/keluarga`);
      const result = await response.json();

      if (result.success && result.data) {
        setFamilies(result.data);
      }
    } catch (error) {
      console.error("Error loading families:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID");
  };

  const getHubunganBadge = (hubungan: string) => {
    if (hubungan === "ISTRI") {
      return <Badge variant="default">Istri</Badge>;
    }
    return <Badge variant="secondary">Anak</Badge>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Data Keluarga</SheetTitle>
          <SheetDescription>
            Daftar anggota keluarga dari <strong>{employeeName}</strong>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : families.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada data keluarga
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Hubungan</TableHead>
                    <TableHead>L/P</TableHead>
                    <TableHead>Tgl Lahir</TableHead>
                    <TableHead>Umur</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>BPJS Kesehatan</TableHead>
                    <TableHead>No. HP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {families.map((family) => (
                    <TableRow key={family.id}>
                      <TableCell className="font-medium">{family.nama}</TableCell>
                      <TableCell>{getHubunganBadge(family.hubungan)}</TableCell>
                      <TableCell>{family.jenis_kelamin || "-"}</TableCell>
                      <TableCell>{formatDate(family.tanggal_lahir)}</TableCell>
                      <TableCell>{family.umur || "-"}</TableCell>
                      <TableCell>{family.no_nik_ktp || "-"}</TableCell>
                      <TableCell>{family.no_bpjs_kesehatan || "-"}</TableCell>
                      <TableCell>{family.no_telp_hp || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

