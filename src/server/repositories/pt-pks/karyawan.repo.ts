import { db } from "~/server/db";
import { type Prisma, type Employee, type EmployeeFamily, FamilyRelation } from "@prisma/client";
import {
  type EmployeeListQuery,
  type EmployeeCreateDTO,
  type EmployeeUpdateDTO,
  type EmployeeFamilyCreateDTO,
} from "~/server/types/pt-pks/karyawan";

// ============================================================================
// EMPLOYEE REPOSITORY
// ============================================================================

export class KaryawanRepository {
  /**
   * Find many employees with pagination, search, sort, and filters
   */
  static async findMany(query: EmployeeListQuery) {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = "createdAt",
      sortDir = "desc",
      divisiId,
      jabatanId,
      companyId,
    } = query;

    // Build where clause
    const where: Prisma.EmployeeWhereInput = {
      AND: [
        // Search across multiple fields
        search
          ? {
              OR: [
                { nama: { contains: search, mode: "insensitive" } },
                { no_nik_ktp: { contains: search, mode: "insensitive" } },
                { divisi: { name: { contains: search, mode: "insensitive" } } },
                { jabatan: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {},
        // Filters
        divisiId ? { divisiId } : {},
        jabatanId ? { jabatanId } : {},
        companyId ? { companyId } : {},
      ],
    };

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build orderBy
    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {
      [sortBy]: sortDir,
    };

    // Execute queries in parallel
    const [items, total] = await Promise.all([
      db.employee.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          divisi: true,
          jabatan: true,
          _count: {
            select: {
              EmployeeFamily: true,
            },
          },
        },
      }),
      db.employee.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Find employee by ID with families
   */
  static async findById(id: string) {
    return db.employee.findUnique({
      where: { id_karyawan: id },
      include: {
        divisi: true,
        jabatan: true,
        EmployeeFamily: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  /**
   * Find families by employee ID
   */
  static async findFamilyByEmployeeId(employeeId: string) {
    return db.employeeFamily.findMany({
      where: { employeeId },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Count families by employee ID and relation
   */
  static async countFamilyByRelation(employeeId: string, hubungan: FamilyRelation) {
    return db.employeeFamily.count({
      where: {
        employeeId,
        hubungan,
      },
    });
  }

  /**
   * Create family member
   */
  static async createFamily(employeeId: string, data: EmployeeFamilyCreateDTO) {
    return db.employeeFamily.create({
      data: {
        employeeId,
        nama: data.nama,
        hubungan: data.hubungan,
        jenis_kelamin: data.jenis_kelamin ?? null,
        tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
        umur: data.umur ?? null,
        no_nik_ktp: data.no_nik_ktp ?? null,
        no_bpjs_kesehatan: data.no_bpjs_kesehatan ?? null,
        no_telp_hp: data.no_telp_hp ?? null,
      },
    });
  }

  /**
   * Update family member
   */
  static async updateFamily(id: string, data: Partial<EmployeeFamilyCreateDTO>) {
    return db.employeeFamily.update({
      where: { id },
      data: {
        ...(data.nama && { nama: data.nama }),
        ...(data.hubungan && { hubungan: data.hubungan }),
        ...(data.jenis_kelamin !== undefined && { jenis_kelamin: data.jenis_kelamin }),
        ...(data.tanggal_lahir !== undefined && {
          tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
        }),
        ...(data.umur !== undefined && { umur: data.umur }),
        ...(data.no_nik_ktp !== undefined && { no_nik_ktp: data.no_nik_ktp }),
        ...(data.no_bpjs_kesehatan !== undefined && { no_bpjs_kesehatan: data.no_bpjs_kesehatan }),
        ...(data.no_telp_hp !== undefined && { no_telp_hp: data.no_telp_hp }),
      },
    });
  }

  /**
   * Delete family member
   */
  static async deleteFamily(id: string) {
    return db.employeeFamily.delete({
      where: { id },
    });
  }

  /**
   * Update employee
   */
  static async updateEmployee(id: string, data: EmployeeUpdateDTO) {
    return db.employee.update({
      where: { id_karyawan: id },
      data: {
        ...(data.nama !== undefined && { nama: data.nama }),
        ...(data.status_kk !== undefined && { status_kk: data.status_kk }),
        ...(data.jenis_kelamin !== undefined && { jenis_kelamin: data.jenis_kelamin }),
        ...(data.agama !== undefined && { agama: data.agama }),
        ...(data.suku !== undefined && { suku: data.suku }),
        ...(data.golongan_darah !== undefined && { golongan_darah: data.golongan_darah }),
        ...(data.no_telp_hp !== undefined && { no_telp_hp: data.no_telp_hp }),
        ...(data.tempat_lahir !== undefined && { tempat_lahir: data.tempat_lahir }),
        ...(data.tanggal_lahir !== undefined && {
          tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
        }),
        ...(data.umur !== undefined && { umur: data.umur }),
        ...(data.alamat_rt_rw !== undefined && { alamat_rt_rw: data.alamat_rt_rw }),
        ...(data.alamat_desa !== undefined && { alamat_desa: data.alamat_desa }),
        ...(data.alamat_kecamatan !== undefined && { alamat_kecamatan: data.alamat_kecamatan }),
        ...(data.alamat_kabupaten !== undefined && { alamat_kabupaten: data.alamat_kabupaten }),
        ...(data.alamat_provinsi !== undefined && { alamat_provinsi: data.alamat_provinsi }),
        ...(data.pendidikan_terakhir !== undefined && {
          pendidikan_terakhir: data.pendidikan_terakhir,
        }),
        ...(data.jurusan !== undefined && { jurusan: data.jurusan }),
        ...(data.divisiId !== undefined && {
          divisiId: data.divisiId ?? null,
        }),
        ...(data.jabatanId !== undefined && {
          jabatanId: data.jabatanId ?? null,
        }),
        ...(data.tgl_masuk_kerja !== undefined && {
          tgl_masuk_kerja: data.tgl_masuk_kerja ? new Date(data.tgl_masuk_kerja) : null,
        }),
        ...(data.tgl_terakhir_kerja !== undefined && {
          tgl_terakhir_kerja: data.tgl_terakhir_kerja ? new Date(data.tgl_terakhir_kerja) : null,
        }),
        ...(data.masa_kerja !== undefined && { masa_kerja: data.masa_kerja }),
        ...(data.status_pkwt !== undefined && { status_pkwt: data.status_pkwt }),
        ...(data.no_bpjs_tenaga_kerja !== undefined && {
          no_bpjs_tenaga_kerja: data.no_bpjs_tenaga_kerja,
        }),
        ...(data.no_nik_ktp !== undefined && { no_nik_ktp: data.no_nik_ktp }),
        ...(data.no_bpjs_kesehatan !== undefined && { no_bpjs_kesehatan: data.no_bpjs_kesehatan }),
        ...(data.no_npwp !== undefined && { no_npwp: data.no_npwp }),
        ...(data.status_pajak !== undefined && { status_pajak: data.status_pajak }),
        ...(data.no_rekening_bank !== undefined && { no_rekening_bank: data.no_rekening_bank }),
        ...(data.perusahaan_sebelumnya !== undefined && {
          perusahaan_sebelumnya: data.perusahaan_sebelumnya,
        }),
      },
    });
  }

  /**
   * Check if employee exists
   */
  static async exists(id: string) {
    const count = await db.employee.count({
      where: { id_karyawan: id },
    });
    return count > 0;
  }

  /**
   * Find employee by NIK/KTP (for uniqueness check)
   */
  static async findByNIK(no_nik_ktp: string) {
    return db.employee.findFirst({
      where: { no_nik_ktp },
    });
  }

  /**
   * Create new employee
   */
  static async create(data: EmployeeCreateDTO) {
    return db.employee.create({
      data: {
        nama: data.nama,
        jenis_kelamin: data.jenis_kelamin,
        no_nik_ktp: data.no_nik_ktp,
        status_kk: data.status_kk ?? null,
        agama: data.agama ?? null,
        suku: data.suku ?? null,
        golongan_darah: data.golongan_darah ?? null,
        no_telp_hp: data.no_telp_hp ?? null,
        tempat_lahir: data.tempat_lahir ?? null,
        tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
        umur: data.umur ?? null,
        alamat_rt_rw: data.alamat_rt_rw ?? null,
        alamat_desa: data.alamat_desa ?? null,
        alamat_kecamatan: data.alamat_kecamatan ?? null,
        alamat_kabupaten: data.alamat_kabupaten ?? null,
        alamat_provinsi: data.alamat_provinsi ?? null,
        pendidikan_terakhir: data.pendidikan_terakhir ?? null,
        jurusan: data.jurusan ?? null,
        divisiId: data.divisiId ?? null,
        jabatanId: data.jabatanId ?? null,
        tgl_masuk_kerja: data.tgl_masuk_kerja ? new Date(data.tgl_masuk_kerja) : null,
        tgl_terakhir_kerja: data.tgl_terakhir_kerja ? new Date(data.tgl_terakhir_kerja) : null,
        masa_kerja: data.masa_kerja ?? null,
        status_pkwt: data.status_pkwt ?? null,
        no_bpjs_tenaga_kerja: data.no_bpjs_tenaga_kerja ?? null,
        no_bpjs_kesehatan: data.no_bpjs_kesehatan ?? null,
        no_npwp: data.no_npwp ?? null,
        status_pajak: data.status_pajak ?? null,
        no_rekening_bank: data.no_rekening_bank ?? null,
        perusahaan_sebelumnya: data.perusahaan_sebelumnya ?? null,
        companyId: data.companyId ?? null,
        userId: data.userId ?? null,
      },
    });
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(id: string) {
    return db.employee.delete({
      where: { id_karyawan: id },
    });
  }
}

