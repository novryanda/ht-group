import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { GoodsReceiptAPI } from "~/server/api/pt-pks/goods-receipt";
import { getPTPKSCompany } from "~/server/lib/company-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await getPTPKSCompany();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      search: searchParams.get("search") || undefined,
      warehouseId: searchParams.get("warehouseId") || undefined,
      sourceType: searchParams.get("sourceType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
    };

    const result = await GoodsReceiptAPI.list(query, company.id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/pt-pks/barang-masuk:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await GoodsReceiptAPI.create(body, session.user.id as string);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/barang-masuk:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
