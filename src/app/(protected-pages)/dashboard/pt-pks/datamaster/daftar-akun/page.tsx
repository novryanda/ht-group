import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { companyService } from "~/server/services/company.service";
import { DaftarAkunClient } from "~/components/dashboard/pt-pks/datamaster-pks/daftar-akun/coa-client";

export default async function DaftarAkunPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const preferredCodes = [
    (session.user as any)?.companyCode,
    "PT-PKS",
  ].filter(Boolean) as string[];

  let company = null;
  for (const code of preferredCodes) {
    company = await companyService.getByCode(code);
    if (company) break;
  }

  if (!company) {
    const companies = await companyService.listAll();
    company = companies[0] ?? null;
  }

  if (!company) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-start gap-4 py-16">
        <h1 className="text-3xl font-semibold">PT PKS belum dikonfigurasi</h1>
        <p className="text-muted-foreground">
          Sistem belum menemukan entitas perusahaan dengan kode <strong>PT-PKS</strong>. Tambahkan data
          perusahaan terlebih dahulu melalui modul administrasi perusahaan lalu kembali ke halaman ini.
        </p>
        <Link href="/dashboard" className="text-primary underline underline-offset-4">
          Kembali ke dashboard utama
        </Link>
      </div>
    );
  }

  return (
    <DaftarAkunClient
      companyId={company.id}
      companyName={company.name}
      userRole={(session.user as any)?.role ?? null}
    />
  );
}
