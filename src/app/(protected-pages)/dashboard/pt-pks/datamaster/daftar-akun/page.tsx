import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { getPTPKSCompany } from "~/server/lib/company-helpers";
import { DaftarAkunClient } from "~/components/dashboard/pt-pks/datamaster-pks/daftar-akun/coa-client";

export default async function DaftarAkunPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let company = null;
  try {
    company = await getPTPKSCompany();
  } catch (error) {
    console.error("Failed to get PT PKS company:", error);
  }

  if (!company) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col items-start gap-4 py-16">
        <h1 className="text-3xl font-semibold">PT PKS belum dikonfigurasi</h1>
        <p className="text-muted-foreground">
          Sistem belum menemukan entitas perusahaan <strong>PT Perkebunan Sawit</strong>. Pastikan data
          perusahaan sudah ditambahkan melalui seed database.
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
