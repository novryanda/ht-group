/**
 * Supplier & Timbangan - Import PB Excel
 * Server Component with auth/role check
 */

import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { hasRole } from "~/server/auth/role";
import { PbImportClient } from "~/components/pt-pks/transaksipks/pb-import/pb-import-client";

export default async function PKSSupplierTimbanganPage() {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  // Role check - read access
  const allowedRoles = [
    "PT_PKS_ADMIN",
    "EXECUTIVE",
    "UNIT_SUPERVISOR",
    "GROUP_VIEWER",
  ] as const;

  if (!hasRole(session.user.role, allowedRoles)) {
    redirect("/dashboard");
  }

  // Check write permission
  const canWrite = hasRole(session.user.role, ["PT_PKS_ADMIN", "EXECUTIVE"]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Supplier & Timbangan</h1>
        <p className="text-muted-foreground">
          Import data PB (Penerimaan Buah) dari Excel
        </p>
      </div>

      <PbImportClient canWrite={canWrite} userId={session.user.id} />
    </div>
  );
}
