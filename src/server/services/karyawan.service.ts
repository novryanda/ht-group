import { FamilyRelation } from "@prisma/client";
import { KaryawanRepository } from "~/server/repositories/karyawan.repo";
import {
  type EmployeeListQuery,
  type EmployeeListItemDTO,
  type EmployeeDTO,
  type EmployeeCreateDTO,
  type EmployeeFamilyDTO,
  type EmployeeFamilyCreateDTO,
  type EmployeeUpdateDTO,
  type Pagination,
} from "~/server/types/karyawan";

// ============================================================================
// RESULT TYPES
// ============================================================================

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// ============================================================================
// KARYAWAN SERVICE
// ============================================================================

export class KaryawanService {
  /**
   * Get list of employees with pagination
   */
  static async getEmployeeList(
    query: EmployeeListQuery
  ): Promise<ServiceResult<{ items: EmployeeListItemDTO[]; pagination: Pagination }>> {
    try {
      const result = await KaryawanRepository.findMany(query);

      // Map to DTO with familyCount
      const items: EmployeeListItemDTO[] = result.items.map((emp) => ({
        id_karyawan: emp.id_karyawan,
        nama: emp.nama,
        status_kk: emp.status_kk,
        jenis_kelamin: emp.jenis_kelamin,
        agama: emp.agama,
        suku: emp.suku,
        golongan_darah: emp.golongan_darah,
        no_telp_hp: emp.no_telp_hp,
        tempat_lahir: emp.tempat_lahir,
        tanggal_lahir: emp.tanggal_lahir,
        umur: emp.umur,
        alamat_rt_rw: emp.alamat_rt_rw,
        alamat_desa: emp.alamat_desa,
        alamat_kecamatan: emp.alamat_kecamatan,
        alamat_kabupaten: emp.alamat_kabupaten,
        alamat_provinsi: emp.alamat_provinsi,
        pendidikan_terakhir: emp.pendidikan_terakhir,
        jurusan: emp.jurusan,
        jabatan: emp.jabatan,
        devisi: emp.devisi,
        level: emp.level,
        tgl_masuk_kerja: emp.tgl_masuk_kerja,
        tgl_terakhir_kerja: emp.tgl_terakhir_kerja,
        masa_kerja: emp.masa_kerja,
        status_pkwt: emp.status_pkwt,
        no_bpjs_tenaga_kerja: emp.no_bpjs_tenaga_kerja,
        no_nik_ktp: emp.no_nik_ktp,
        no_bpjs_kesehatan: emp.no_bpjs_kesehatan,
        no_npwp: emp.no_npwp,
        status_pajak: emp.status_pajak,
        no_rekening_bank: emp.no_rekening_bank,
        perusahaan_sebelumnya: emp.perusahaan_sebelumnya,
        familyCount: (emp as any)._count.EmployeeFamily,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      const pagination: Pagination = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };

      return {
        success: true,
        data: { items, pagination },
      };
    } catch (error) {
      console.error("Error getting employee list:", error);
      return {
        success: false,
        error: "Failed to get employee list",
      };
    }
  }

  /**
   * Get employee detail with families
   */
  static async getEmployeeDetail(
    id: string
  ): Promise<ServiceResult<{ employee: EmployeeDTO; families: EmployeeFamilyDTO[] }>> {
    try {
      const employee = await KaryawanRepository.findById(id);

      if (!employee) {
        return {
          success: false,
          error: "Employee not found",
          code: "NOT_FOUND",
        };
      }

      // Map to DTO
      const employeeDTO: EmployeeDTO = {
        id_karyawan: employee.id_karyawan,
        nama: employee.nama,
        status_kk: employee.status_kk,
        jenis_kelamin: employee.jenis_kelamin,
        agama: employee.agama,
        suku: employee.suku,
        golongan_darah: employee.golongan_darah,
        no_telp_hp: employee.no_telp_hp,
        tempat_lahir: employee.tempat_lahir,
        tanggal_lahir: employee.tanggal_lahir,
        umur: employee.umur,
        alamat_rt_rw: employee.alamat_rt_rw,
        alamat_desa: employee.alamat_desa,
        alamat_kecamatan: employee.alamat_kecamatan,
        alamat_kabupaten: employee.alamat_kabupaten,
        alamat_provinsi: employee.alamat_provinsi,
        pendidikan_terakhir: employee.pendidikan_terakhir,
        jurusan: employee.jurusan,
        jabatan: employee.jabatan,
        devisi: employee.devisi,
        level: employee.level,
        tgl_masuk_kerja: employee.tgl_masuk_kerja,
        tgl_terakhir_kerja: employee.tgl_terakhir_kerja,
        masa_kerja: employee.masa_kerja,
        status_pkwt: employee.status_pkwt,
        no_bpjs_tenaga_kerja: employee.no_bpjs_tenaga_kerja,
        no_nik_ktp: employee.no_nik_ktp,
        no_bpjs_kesehatan: employee.no_bpjs_kesehatan,
        no_npwp: employee.no_npwp,
        status_pajak: employee.status_pajak,
        no_rekening_bank: employee.no_rekening_bank,
        perusahaan_sebelumnya: employee.perusahaan_sebelumnya,
        companyId: employee.companyId,
        userId: employee.userId,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      };

      const families: EmployeeFamilyDTO[] = (employee as any).EmployeeFamily.map((fam: any) => ({
        id: fam.id,
        employeeId: fam.employeeId,
        nama: fam.nama,
        hubungan: fam.hubungan,
        jenis_kelamin: fam.jenis_kelamin,
        tanggal_lahir: fam.tanggal_lahir,
        umur: fam.umur,
        no_nik_ktp: fam.no_nik_ktp,
        no_bpjs_kesehatan: fam.no_bpjs_kesehatan,
        no_telp_hp: fam.no_telp_hp,
        createdAt: fam.createdAt,
        updatedAt: fam.updatedAt,
      }));

      return {
        success: true,
        data: { employee: employeeDTO, families },
      };
    } catch (error) {
      console.error("Error getting employee detail:", error);
      return {
        success: false,
        error: "Failed to get employee detail",
      };
    }
  }

  /**
   * Get families by employee ID
   */
  static async getFamilies(employeeId: string): Promise<ServiceResult<EmployeeFamilyDTO[]>> {
    try {
      // Check if employee exists
      const exists = await KaryawanRepository.exists(employeeId);
      if (!exists) {
        return {
          success: false,
          error: "Employee not found",
          code: "NOT_FOUND",
        };
      }

      const families = await KaryawanRepository.findFamilyByEmployeeId(employeeId);

      const familiesDTO: EmployeeFamilyDTO[] = families.map((fam) => ({
        id: fam.id,
        employeeId: fam.employeeId,
        nama: fam.nama,
        hubungan: fam.hubungan,
        jenis_kelamin: fam.jenis_kelamin,
        tanggal_lahir: fam.tanggal_lahir,
        umur: fam.umur,
        no_nik_ktp: fam.no_nik_ktp,
        no_bpjs_kesehatan: fam.no_bpjs_kesehatan,
        no_telp_hp: fam.no_telp_hp,
        createdAt: fam.createdAt,
        updatedAt: fam.updatedAt,
      }));

      return {
        success: true,
        data: familiesDTO,
      };
    } catch (error) {
      console.error("Error getting families:", error);
      return {
        success: false,
        error: "Failed to get families",
      };
    }
  }

  /**
   * Add family member with business rules validation
   * Business Rule: Only 1 ISTRI allowed per employee, ANAK can be multiple
   */
  static async addFamily(
    employeeId: string,
    data: EmployeeFamilyCreateDTO
  ): Promise<ServiceResult<EmployeeFamilyDTO>> {
    try {
      // Check if employee exists
      const exists = await KaryawanRepository.exists(employeeId);
      if (!exists) {
        return {
          success: false,
          error: "Employee not found",
          code: "NOT_FOUND",
        };
      }

      // Business Rule: Only 1 ISTRI allowed
      if (data.hubungan === FamilyRelation.ISTRI) {
        const istriCount = await KaryawanRepository.countFamilyByRelation(
          employeeId,
          FamilyRelation.ISTRI
        );

        if (istriCount > 0) {
          return {
            success: false,
            error: "Karyawan sudah memiliki data ISTRI. Hanya 1 ISTRI yang diperbolehkan.",
            code: "ISTRI_ALREADY_EXISTS",
          };
        }
      }

      // Create family member
      const family = await KaryawanRepository.createFamily(employeeId, data);

      const familyDTO: EmployeeFamilyDTO = {
        id: family.id,
        employeeId: family.employeeId,
        nama: family.nama,
        hubungan: family.hubungan,
        jenis_kelamin: family.jenis_kelamin,
        tanggal_lahir: family.tanggal_lahir,
        umur: family.umur,
        no_nik_ktp: family.no_nik_ktp,
        no_bpjs_kesehatan: family.no_bpjs_kesehatan,
        no_telp_hp: family.no_telp_hp,
        createdAt: family.createdAt,
        updatedAt: family.updatedAt,
      };

      return {
        success: true,
        data: familyDTO,
      };
    } catch (error) {
      console.error("Error adding family:", error);
      return {
        success: false,
        error: "Failed to add family member",
      };
    }
  }

  /**
   * Create new employee
   * Business Rule: no_nik_ktp must be unique
   */
  static async createKaryawan(data: EmployeeCreateDTO): Promise<ServiceResult<EmployeeDTO>> {
    try {
      // Business Rule: Check NIK uniqueness
      const existingEmployee = await KaryawanRepository.findByNIK(data.no_nik_ktp);

      if (existingEmployee) {
        return {
          success: false,
          error: `NIK/KTP ${data.no_nik_ktp} sudah terdaftar atas nama ${existingEmployee.nama}`,
          code: "NIK_ALREADY_EXISTS",
        };
      }

      // Create employee
      const employee = await KaryawanRepository.create(data);

      const employeeDTO: EmployeeDTO = {
        id_karyawan: employee.id_karyawan,
        nama: employee.nama,
        status_kk: employee.status_kk,
        jenis_kelamin: employee.jenis_kelamin,
        agama: employee.agama,
        suku: employee.suku,
        golongan_darah: employee.golongan_darah,
        no_telp_hp: employee.no_telp_hp,
        tempat_lahir: employee.tempat_lahir,
        tanggal_lahir: employee.tanggal_lahir,
        umur: employee.umur,
        alamat_rt_rw: employee.alamat_rt_rw,
        alamat_desa: employee.alamat_desa,
        alamat_kecamatan: employee.alamat_kecamatan,
        alamat_kabupaten: employee.alamat_kabupaten,
        alamat_provinsi: employee.alamat_provinsi,
        pendidikan_terakhir: employee.pendidikan_terakhir,
        jurusan: employee.jurusan,
        jabatan: employee.jabatan,
        devisi: employee.devisi,
        level: employee.level,
        tgl_masuk_kerja: employee.tgl_masuk_kerja,
        tgl_terakhir_kerja: employee.tgl_terakhir_kerja,
        masa_kerja: employee.masa_kerja,
        status_pkwt: employee.status_pkwt,
        no_bpjs_tenaga_kerja: employee.no_bpjs_tenaga_kerja,
        no_nik_ktp: employee.no_nik_ktp,
        no_bpjs_kesehatan: employee.no_bpjs_kesehatan,
        no_npwp: employee.no_npwp,
        status_pajak: employee.status_pajak,
        no_rekening_bank: employee.no_rekening_bank,
        perusahaan_sebelumnya: employee.perusahaan_sebelumnya,
        companyId: employee.companyId,
        userId: employee.userId,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      };

      return {
        success: true,
        data: employeeDTO,
      };
    } catch (error) {
      console.error("Error creating employee:", error);
      return {
        success: false,
        error: "Failed to create employee",
      };
    }
  }

  /**
   * Update employee
   */
  static async updateEmployee(
    id: string,
    data: EmployeeUpdateDTO
  ): Promise<ServiceResult<EmployeeDTO>> {
    try {
      // Check if employee exists
      const exists = await KaryawanRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          error: "Employee not found",
          code: "NOT_FOUND",
        };
      }

      const employee = await KaryawanRepository.updateEmployee(id, data);

      const employeeDTO: EmployeeDTO = {
        id_karyawan: employee.id_karyawan,
        nama: employee.nama,
        status_kk: employee.status_kk,
        jenis_kelamin: employee.jenis_kelamin,
        agama: employee.agama,
        suku: employee.suku,
        golongan_darah: employee.golongan_darah,
        no_telp_hp: employee.no_telp_hp,
        tempat_lahir: employee.tempat_lahir,
        tanggal_lahir: employee.tanggal_lahir,
        umur: employee.umur,
        alamat_rt_rw: employee.alamat_rt_rw,
        alamat_desa: employee.alamat_desa,
        alamat_kecamatan: employee.alamat_kecamatan,
        alamat_kabupaten: employee.alamat_kabupaten,
        alamat_provinsi: employee.alamat_provinsi,
        pendidikan_terakhir: employee.pendidikan_terakhir,
        jurusan: employee.jurusan,
        jabatan: employee.jabatan,
        devisi: employee.devisi,
        level: employee.level,
        tgl_masuk_kerja: employee.tgl_masuk_kerja,
        tgl_terakhir_kerja: employee.tgl_terakhir_kerja,
        masa_kerja: employee.masa_kerja,
        status_pkwt: employee.status_pkwt,
        no_bpjs_tenaga_kerja: employee.no_bpjs_tenaga_kerja,
        no_nik_ktp: employee.no_nik_ktp,
        no_bpjs_kesehatan: employee.no_bpjs_kesehatan,
        no_npwp: employee.no_npwp,
        status_pajak: employee.status_pajak,
        no_rekening_bank: employee.no_rekening_bank,
        perusahaan_sebelumnya: employee.perusahaan_sebelumnya,
        companyId: employee.companyId,
        userId: employee.userId,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      };

      return {
        success: true,
        data: employeeDTO,
      };
    } catch (error) {
      console.error("Error updating employee:", error);
      return {
        success: false,
        error: "Failed to update employee",
      };
    }
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(id: string): Promise<ServiceResult<{ id: string }>> {
    try {
      // Check if employee exists
      const exists = await KaryawanRepository.exists(id);
      if (!exists) {
        return {
          success: false,
          error: "Employee not found",
          code: "NOT_FOUND",
        };
      }

      await KaryawanRepository.deleteEmployee(id);

      return {
        success: true,
        data: { id },
      };
    } catch (error) {
      console.error("Error deleting employee:", error);
      return {
        success: false,
        error: "Failed to delete employee",
      };
    }
  }
}

