import { auth } from "~/server/auth";
import { getPTPKSCompany } from "~/server/lib/company-helpers";
import { ApprovePBTable } from "~/components/dashboard/pt-pks/timbangan-supplier/approve-pb/ApprovePBTable";

export default async function ApprovePBPage() {
  const session = await auth();
  if (!session?.user) return null;

  let company: { id: string; name: string; code: string | null } | null = null;
  try {
    company = await getPTPKSCompany();
  } catch (e) {
    console.error("Failed to resolve PT PKS company for Approve PB page", e);
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approve PB</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data perusahaan PT Perkebunan Sawit tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approve PB</h1>
        <p className="mt-1 text-sm text-muted-foreground">Persetujuan data timbangan yang sudah diposting</p>
      </div>
      <ApprovePBTable companyId={company.id} />
    </div>
  );
}


