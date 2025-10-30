import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";
import { getCompanyByCode } from "~/server/lib/company-helpers";

const VIEW_ROLES = [
  "PT_PKS_ADMIN",
  "FINANCE_AP",
  "FINANCE_AR",
  "GL_ACCOUNTANT",
  "PT_MANAGER",
  "EXECUTIVE",
  "GROUP_VIEWER",
];

const EDIT_ROLES = ["PT_PKS_ADMIN", "FINANCE_AP"];

type RouteParams = { id: string };
type RouteContext = { params: Promise<RouteParams> };

async function resolveCompanyId(request: NextRequest, session: any) {
  const url = new URL(request.url);
  const queryCompanyId = url.searchParams.get("companyId");
  if (queryCompanyId) {
    return queryCompanyId;
  }

  const queryCompanyCode = url.searchParams.get("companyCode");
  const sessionCompanyCode = session?.user?.companyCode as string | undefined;
  const companyCode = queryCompanyCode ?? sessionCompanyCode;

  if (!companyCode) {
    throw new Error("companyCode atau companyId wajib disertakan untuk akses PB Harian");
  }

  const company = await getCompanyByCode(companyCode);
  return company.id;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role as string | undefined;
    if (!role || !VIEW_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Tidak memiliki akses PB Harian" },
        { status: 403 }
      );
    }

    const companyId = await resolveCompanyId(request, session);
    const result = await WeighbridgeAPI.getTicketById(id, companyId);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("wajib disertakan")
      ? 400
      : message.includes("not found") || message.includes("tidak ditemukan")
      ? 404
      : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role as string | undefined;
    if (!role || !EDIT_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Tidak boleh mengubah PB Harian" },
        { status: 403 }
      );
    }

    const companyId = await resolveCompanyId(request, session);
    const body = await request.json();
    const result = await WeighbridgeAPI.updatePBFields(id, body, companyId);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("wajib disertakan")
      ? 400
      : message.includes("not found") || message.includes("tidak ditemukan")
      ? 404
      : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
