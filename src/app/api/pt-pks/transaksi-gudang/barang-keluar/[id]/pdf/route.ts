import { NextRequest, NextResponse } from "next/server";
import { generateBarangKeluarPDF } from "~/lib/pdf-generator";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Fetch outbound data with full relations
    const outbound = await db.goodsIssue.findUnique({
      where: { id },
      include: {
        warehouse: true,
        lines: {
          include: {
            item: {
              include: {
                category: true,
                itemType: true,
              },
            },
            unit: true,
          },
        },
      },
    });

    if (!outbound) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare PDF data
    // Map enum to label (harus sama dengan frontend)
    const purposeLabels: Record<string, string> = {
      LOAN: "Peminjaman",
      ISSUE: "Pengeluaran",
      PROD: "Produksi",
      SCRAP: "Scrap",
    };

    const pdfData = {
      docNumber: outbound.docNumber,
      date: outbound.date.toISOString(),
      targetDept: outbound.targetDept || "-",
      purpose: purposeLabels[outbound.purpose] || outbound.purpose || undefined,
      pickerName: outbound.pickerName || undefined,
      lines: outbound.lines.map((line) => ({
        itemName: line.item.name,
        kategoriName: line.item.category?.name,
        jenisName: line.item.itemType?.name,
        unitName: line.unit.name,
        qty: parseFloat(line.qty.toString()),
      })),
    };

    // Generate PDF
    const pdf = generateBarangKeluarPDF(pdfData);
    const pdfBuffer = pdf.output("arraybuffer");

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Barang-Keluar-${outbound.docNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return NextResponse.json(
      { error: "Gagal membuat PDF" },
      { status: 500 }
    );
  }
}
