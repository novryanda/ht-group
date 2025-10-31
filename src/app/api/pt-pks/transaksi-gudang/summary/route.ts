import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getPTPKSCompany } from "~/server/lib/company-helpers";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await getPTPKSCompany();
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Count barang keluar (goods issue) bulan ini
    const barangKeluarCount = await db.goodsIssue.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        purpose: { not: "LOAN" }, // Exclude loans
      },
    });

    // Count barang masuk bulan ini
    // Include goods receipts + weighbridge tickets approved this month
    const goodsReceiptCount = await db.goodsReceipt.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const weighbridgeApprovedCount = await db.weighbridgeTicket.count({
      where: {
        companyId: company.id,
        status: "APPROVED",
        updatedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const barangMasukCount = goodsReceiptCount + weighbridgeApprovedCount;

    // Count permintaan pending (item request with status PENDING)
    const permintaanPendingCount = await db.itemRequest.count({
      where: {
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        barangKeluar: barangKeluarCount,
        barangMasuk: barangMasukCount,
        permintaanPending: permintaanPendingCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error in GET /api/pt-pks/transaksi-gudang/summary:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

