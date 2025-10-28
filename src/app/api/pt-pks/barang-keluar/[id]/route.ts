import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { GoodsIssueAPI } from "~/server/api/pt-pks/goods-issue";

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await GoodsIssueAPI.getById(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in GET /api/pt-pks/barang-keluar/[id]:", error);
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
    const result = await GoodsIssueAPI.delete(id);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in DELETE /api/pt-pks/barang-keluar/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
