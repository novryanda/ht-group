import type { Divisi, Jabatan } from "@prisma/client";
import type {
  DivisiDTO,
  JabatanDTO,
} from "~/server/types/pt-pks/divisi";

export function mapDivisiToDTO(
  divisi: Divisi & {
    _count?: { jabatan?: number; employees?: number };
  }
): DivisiDTO {
  return {
    id: divisi.id,
    code: divisi.code,
    name: divisi.name,
    description: divisi.description ?? undefined,
    isActive: divisi.isActive,
    createdAt: divisi.createdAt.toISOString(),
    updatedAt: divisi.updatedAt.toISOString(),
    jabatanCount: divisi._count?.jabatan,
    employeesCount: divisi._count?.employees,
  };
}

export function mapJabatanToDTO(
  jabatan: Jabatan & {
    divisi?: { name: string };
    _count?: { employees?: number };
  }
): JabatanDTO {
  return {
    id: jabatan.id,
    divisiId: jabatan.divisiId,
    divisiName: jabatan.divisi?.name,
    code: jabatan.code,
    name: jabatan.name,
    description: jabatan.description ?? undefined,
    isActive: jabatan.isActive,
    createdAt: jabatan.createdAt.toISOString(),
    updatedAt: jabatan.updatedAt.toISOString(),
    employeesCount: jabatan._count?.employees,
  };
}

