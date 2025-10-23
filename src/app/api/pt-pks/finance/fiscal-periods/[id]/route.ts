import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { FiscalPeriodAPI } from "~/server/api/pt-pks/fiscal-period";

const WRITE_ROLES = new Set(["PT_PKS_ADMIN", "GL_ACCOUNTANT"]);

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!WRITE_ROLES.has(session.user.role ?? "")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const result = await FiscalPeriodAPI.update({ ...body, id });
  return NextResponse.json(result, { status: result.statusCode });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!WRITE_ROLES.has(session.user.role ?? "")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const result = await FiscalPeriodAPI.delete(id);
  return NextResponse.json(result, { status: result.statusCode });
}
