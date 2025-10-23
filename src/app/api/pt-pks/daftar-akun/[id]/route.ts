import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { mapAccountToDTO } from "~/server/mappers/pt-pks/account.mapper";
import { accountUpdateSchema } from "~/server/schemas/pt-pks/account";
import { accountService } from "~/server/services/pt-pks/account.service";

const WRITE_ROLES = ["PT_PKS_ADMIN", "GL_ACCOUNTANT"] as const;

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    const { id } = await context.params;
    const parsed = accountUpdateSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await accountService.update(parsed.data);
    return NextResponse.json({ success: true, data: mapAccountToDTO(updated) });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Account code already exists for this company" },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (!role || !WRITE_ROLES.includes(role as (typeof WRITE_ROLES)[number])) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const deleted = await accountService.delete(id);
    return NextResponse.json({ success: true, data: mapAccountToDTO(deleted) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    const status = message.includes("sub-akun") ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
