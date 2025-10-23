import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { FiscalPeriodAPI } from "~/server/api/pt-pks/fiscal-period";

const READ_ROLES = new Set(["PT_PKS_ADMIN", "GL_ACCOUNTANT", "EXECUTIVE"]);
const WRITE_ROLES = new Set(["PT_PKS_ADMIN", "GL_ACCOUNTANT"]);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!READ_ROLES.has(session.user.role ?? "")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const isClosedParam = url.searchParams.get("isClosed");

  const query: Record<string, string | undefined> = {
    companyId: url.searchParams.get("companyId") ?? undefined,
    year: yearParam ?? undefined,
    isClosed: isClosedParam ?? undefined,
  };

  const result = await FiscalPeriodAPI.list(query);
  return NextResponse.json(result, { status: result.statusCode });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!WRITE_ROLES.has(session.user.role ?? "")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const result = await FiscalPeriodAPI.create(body);
  return NextResponse.json(result, { status: result.statusCode });
}
