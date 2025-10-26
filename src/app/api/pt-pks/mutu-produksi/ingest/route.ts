/**
 * API Route: POST /api/pt-pks/mutu-produksi/ingest
 * Ingest production quality data from Google Sheets Apps Script
 */

import { NextRequest, NextResponse } from "next/server";
import { BulkIngestSchema } from "~/server/schemas/pt-pks/mutu-produksi";
import { ingestBulk } from "~/server/services/pt-pks/mutu-produksi.service";
import { env } from "~/env";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate API Key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== env.SHEETS_INGEST_KEY) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const json = await req.json();
    const parsed = BulkIngestSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "Validation failed",
          details: parsed.error.flatten() 
        },
        { status: 400 }
      );
    }

    // 3. Process bulk ingest
    const { rows } = parsed.data;
    const result = await ingestBulk(rows);

    // 4. Return success response
    return NextResponse.json(
      { 
        ok: true, 
        ...result 
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Ingest error:", err);
    return NextResponse.json(
      { 
        ok: false, 
        error: err?.message ?? "Internal error" 
      },
      { status: 500 }
    );
  }
}
