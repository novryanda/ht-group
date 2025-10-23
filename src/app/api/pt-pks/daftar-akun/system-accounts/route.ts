import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { systemAccountMapSetSchema } from "~/server/schemas/pt-pks/account";
import { accountService } from "~/server/services/pt-pks/account.service";

const READ_ROLES = ["PT_PKS_ADMIN", "GL_ACCOUNTANT", "EXECUTIVE"] as const;
const WRITE_ROLES = ["PT_PKS_ADMIN", "GL_ACCOUNTANT"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (!role || !READ_ROLES.includes(role as (typeof READ_ROLES)[number])) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ success: false, error: "companyId is required" }, { status: 400 });
  }

  try {
    const mappings = await accountService.getSystemMappings(companyId);
    return NextResponse.json({ success: true, data: mappings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch mappings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const parsed = systemAccountMapSetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    await accountService.setSystemMappings(parsed.data.companyId, parsed.data.mappings);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update mapping failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
