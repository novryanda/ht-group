import { type NextRequest, NextResponse } from "next/server";
import { SupplierAPI } from "~/server/api/suppliers";

/**
 * GET /api/suppliers
 * Get all suppliers with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const filter = {
      typeSupplier: (searchParams.get('typeSupplier') ?? undefined) as any,
      namaPemilik: searchParams.get('namaPemilik') ?? undefined,
      namaPerusahaan: searchParams.get('namaPerusahaan') ?? undefined,
      sertifikasiISPO: searchParams.get('sertifikasiISPO') ? searchParams.get('sertifikasiISPO') === 'true' : undefined,
      sertifikasiRSPO: searchParams.get('sertifikasiRSPO') ? searchParams.get('sertifikasiRSPO') === 'true' : undefined,
      search: searchParams.get('search') ?? undefined,
    };

    // Extract pagination parameters
    const pagination = {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '10'),
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    };

    const result = await SupplierAPI.getSuppliers(filter, pagination);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/suppliers
 * Create new supplier
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const result = await SupplierAPI.createSupplier(body);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
