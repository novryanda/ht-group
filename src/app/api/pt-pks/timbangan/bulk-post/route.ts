import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ticketIds } = body as { ticketIds: string[] };

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ success: false, error: "ticketIds required" }, { status: 400 });
    }

    const result = await WeighbridgeAPI.bulkPostTickets(ticketIds);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/timbangan/bulk-post:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

