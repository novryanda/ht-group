"use client";

import { EmployeeList } from "~/components/pt-pks/datamaster-pks/karyawan/employee-list";

export default function PKSKaryawanPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Data Master Karyawan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data karyawan dan keluarga
          </p>
        </div>
      </div>

      <EmployeeList />
    </div>
  );
}
