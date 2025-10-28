import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { ItemRequestAPI } from "~/server/api/pt-pks/item-request";

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await ItemRequestAPI.getById(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/pt-pks/pengajuan-barang/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await ItemRequestAPI.delete(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in DELETE /api/pt-pks/pengajuan-barang/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
