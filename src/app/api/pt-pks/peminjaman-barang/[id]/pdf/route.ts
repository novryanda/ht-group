import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { LoanIssueAPI } from "~/server/api/pt-pks/loan-issue";
import { generatePeminjamanBarangPDF } from "~/lib/template-pdf/pt-pks/peminjaman-barang-pdf";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Get loan issue data
    const result = await LoanIssueAPI.getById(id);
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    const loan = result.data;

    // Prepare PDF data
    const pdfData = {
      docNumber: loan.docNumber,
      date: loan.date ? format(new Date(loan.date), "dd MMMM yyyy", { locale: idLocale }) : "-",
      loanReceiver: loan.loanReceiver || "-",
      targetDept: loan.targetDept || "-",
      expectedReturnAt: loan.expectedReturnAt
        ? format(new Date(loan.expectedReturnAt), "dd MMMM yyyy", { locale: idLocale })
        : "-",
      items: (loan.lines || []).map((line: any) => ({
        sku: line.item?.sku || "-",
        name: line.item?.name || "-",
        unit: line.unit?.name || "-",
        qty: Number(line.qty),
        note: line.note || "",
      })),
      pemberiNama: session.user.name || "Admin",
      peminjamNama: loan.loanReceiver || "-",
    };

    // Generate PDF
    const pdf = generatePeminjamanBarangPDF(pdfData);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Peminjaman-${loan.docNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error(`Error in GET /api/pt-pks/peminjaman-barang/${(await params).id}/pdf:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
