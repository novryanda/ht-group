import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { ItemRequestAPI } from "~/server/api/pt-pks/item-request";

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await ItemRequestAPI.submit(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/pengajuan-barang/[id]/submit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
