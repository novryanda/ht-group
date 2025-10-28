import { auth } from "~/server/auth";
import { getPTPKSCompany } from "~/server/lib/company-helpers";
import { SaldoAwalPageClient } from "~/components/dashboard/pt-pks/finance/saldo-awal-akun";

export default async function SaldoAwalAkunPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  let company = null;
  try {
    company = await getPTPKSCompany();
  } catch (error) {
    console.error("Failed to get PT PKS company:", error);
  }

  if (!company) {
    return (
      <div className="container mx-auto py-12">
        <div className="rounded-md border p-8 text-center">
          <h1 className="text-2xl font-semibold">Perusahaan tidak ditemukan</h1>
          <p className="mt-2 text-muted-foreground">
            Pastikan data perusahaan PT Perkebunan Sawit sudah ditambahkan melalui seed database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <SaldoAwalPageClient
        companyId={company.id}
        companyName={company.name}
        userRole={(session.user as any)?.role}
      />
    </div>
  );
}
