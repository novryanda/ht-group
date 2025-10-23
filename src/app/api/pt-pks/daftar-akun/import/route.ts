import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { accountService } from "~/server/services/pt-pks/account.service";

const WRITE_ROLES = ["PT_PKS_ADMIN", "GL_ACCOUNTANT"] as const;

// Body: { companyId: string; rows: Array<{ code,name,class,normalSide,isPosting,isCashBank,taxCode,parentCode?,currency?,description?,status? }> }
// parentCode akan diresolve di controller menjadi parentId bila ada.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (!role || !WRITE_ROLES.includes(role as (typeof WRITE_ROLES)[number])) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { companyId, rows } = body as { companyId?: string; rows?: unknown };

    if (!companyId || !Array.isArray(rows)) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const mapped = rows.map((r: any) => ({
      companyId,
      code: r.code,
      name: r.name,
      class: r.class,
      normalSide: r.normalSide,
      isPosting: r.isPosting ?? true,
      isCashBank: r.isCashBank ?? false,
      taxCode: r.taxCode ?? "NON_TAX",
      currency: r.currency ?? null,
      description: r.description ?? null,
      status: r.status ?? "AKTIF",
      parentCode: r.parentCode ?? null,
    }));

    await accountService.importMany(mapped);
    return NextResponse.json({ success: true, imported: mapped.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
