import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";

type RouteParams = { id: string };
type RouteContext = { params: Promise<RouteParams> };

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const result = await WeighbridgeAPI.postTicket(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/timbangan/[id]/post:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}


