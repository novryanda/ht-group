import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { mapAccountToDTO } from "~/server/mappers/pt-pks/account.mapper";
import { accountCreateSchema, accountQuerySchema } from "~/server/schemas/pt-pks/account";
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
  const parsed = accountQuerySchema.safeParse({
    companyId: url.searchParams.get("companyId"),
    tree: url.searchParams.get("tree"),
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    class: url.searchParams.getAll("class") ?? undefined,
    page: url.searchParams.get("page") ?? "1",
    pageSize: url.searchParams.get("pageSize") ?? "50",
  });

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { companyId, tree, search, status, class: classes, page, pageSize } = parsed.data;

  try {
    if (tree) {
      const data = await accountService.tree(companyId);
      return NextResponse.json({
        success: true,
        data: data.map((account) => mapAccountToDTO(account)),
      });
    }

    const result = await accountService.listPaged({
      companyId,
      search,
      status,
      classes,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      items: result.items.map((account) => mapAccountToDTO(account)),
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch accounts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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
    const parsed = accountCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const created = await accountService.create(parsed.data);
    return NextResponse.json({ success: true, data: mapAccountToDTO(created) }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Account code already exists for this company" },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
