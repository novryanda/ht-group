import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { LoanIssueAPI } from "~/server/api/pt-pks/loan-issue";

type Params = Promise<{ id: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = await LoanIssueAPI.processFullReturn(id, body, session.user.id as string);

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error(`Error in POST /api/pt-pks/peminjaman-barang/${(await params).id}/return:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
