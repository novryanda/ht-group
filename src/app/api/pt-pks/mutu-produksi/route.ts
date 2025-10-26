/**
 * API Route: GET /api/pt-pks/mutu-produksi
 * Returns list of mutu produksi data filtered by date range and shift
 */
import { NextRequest, NextResponse } from "next/server";
import { mutuProduksiController } from "~/server/api/pt-pks/mutu-produksi.controller";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const response = await mutuProduksiController.handleGetList(searchParams);

  return NextResponse.json(response, { status: response.statusCode });
}
