import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { InventoryAPI } from "~/server/api/inventory";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = {
      materialId: searchParams.get("materialId") ?? undefined,
      locationId: searchParams.get("locationId") ?? undefined,
      warehouseId: searchParams.get("warehouseId") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      pageSize: parseInt(searchParams.get("pageSize") ?? "50"),
    };

    const result = await InventoryAPI.getStockList(query);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("GET /api/inventory/stock error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

