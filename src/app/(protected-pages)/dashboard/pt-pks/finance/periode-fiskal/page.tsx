import { auth } from "~/server/auth";
import { companyService } from "~/server/services/company.service";
import { FiscalPeriodPageClient } from "~/components/dashboard/pt-pks/finance/periode-fiskal";

export default async function PeriodeFiskalPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
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
    const fallback = await companyService.listAll();
    company = fallback.find((item) => item.code === "PT-PKS") ?? fallback[0] ?? null;
  }
  if (!company) {
    return (
      <div className="container mx-auto py-12">
        <div className="rounded-md border p-8 text-center">
          <h1 className="text-2xl font-semibold">Perusahaan tidak ditemukan</h1>
          <p className="mt-2 text-muted-foreground">
            Tambahkan data perusahaan PT-PKS terlebih dahulu sebelum mengelola periode fiskal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <FiscalPeriodPageClient
        companyId={company.id}
        companyName={company.name}
        userRole={(session.user as any)?.role}
      />
    </div>
  );
}
