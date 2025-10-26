/**
 * Controller for PT-PKS Mutu Produksi API
 * Handles HTTP request/response for production quality data
 */
import { mutuProduksiService } from "~/server/services/pt-pks/mutu-produksi.service";
import { mutuProduksiQuerySchema, sanitizeDateRange } from "~/server/schemas/pt-pks/mutu-produksi";
import type { PksMutuProduksiDto } from "~/server/types/pt-pks/mutu-produksi";

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export class MutuProduksiController {
  /**
   * GET handler for mutu produksi list
   * Supports query params: from, to, shift
   */
  async handleGetList(searchParams: URLSearchParams): Promise<ApiResponse<PksMutuProduksiDto[]>> {
    try {
      // Parse and validate query params
      const rawQuery = {
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        shift: (searchParams.get("shift") ?? "all") as "all" | "1" | "2" | "3",
      };

      const parseResult = mutuProduksiQuerySchema.safeParse(rawQuery);
      if (!parseResult.success) {
        return {
          ok: false,
          error: "Invalid query parameters",
          statusCode: 400,
        };
      }

      // Sanitize date range with defaults
      const filters = sanitizeDateRange(parseResult.data);

      // Fetch data from service
      const data = await mutuProduksiService.getMutuProduksiList(filters);

      return {
        ok: true,
        data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("❌ Error in handleGetList:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }
}

export const mutuProduksiController = new MutuProduksiController();
