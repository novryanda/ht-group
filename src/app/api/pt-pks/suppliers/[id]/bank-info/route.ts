import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const updateBankInfoSchema = z.object({
  bankName: z.string().min(1, "Nama bank wajib diisi"),
  bankAccountNo: z.string().min(1, "Nomor rekening wajib diisi"),
  bankAccountName: z.string().min(1, "Atas nama wajib diisi"),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateBankInfoSchema.parse(body);

    // Check if supplier exists
    const existingSupplier = await db.supplierTBS.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        {
          success: false,
          error: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Update bank information
    const updatedSupplier = await db.supplierTBS.update({
      where: { id },
      data: {
        bankName: validatedData.bankName,
        bankAccountNo: validatedData.bankAccountNo,
        bankAccountName: validatedData.bankAccountName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedSupplier,
        message: "Informasi bank berhasil disimpan",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating bank info:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Gagal menyimpan informasi bank",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
