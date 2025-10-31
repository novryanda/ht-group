import { PBHarianTable } from "~/components/dashboard/pt-pks/timbangan-supplier/pb-harian/PBHarianTable";
import { auth } from "~/server/auth";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

export default async function PBHarianPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  let company: { id: string; name: string; code: string | null } | null = null;
  try {
    company = await getPTPKSCompany();
  } catch (error) {
    console.error("Failed to resolve PT PKS company for PB Harian page", error);
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timbangan Supplier</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data perusahaan PT Perkebunan Sawit tidak ditemukan. Pastikan database telah di-seed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PB Harian</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Input data timbangan supplier (Phase 1 - Weighing)
        </p>
      </div>

      <PBHarianTable companyId={company.id} />
    </div>
  );
}
