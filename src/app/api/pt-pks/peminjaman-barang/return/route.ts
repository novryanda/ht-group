import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { LoanIssueAPI } from "~/server/api/pt-pks/loan-issue";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await LoanIssueAPI.processReturn(body, session.user.id as string);
    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    console.error("Error in POST /api/pt-pks/peminjaman-barang/return:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
