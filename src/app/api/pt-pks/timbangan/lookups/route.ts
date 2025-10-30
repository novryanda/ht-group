/**
 * API Route: Weighbridge Lookups
 * GET: Get vehicles, suppliers, items for dropdowns
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { WeighbridgeAPI } from "~/server/api/pt-pks/weighbridge";

const VIEW_ROLES = [
  "PT_PKS_ADMIN",
  "OPERATOR",
  "FINANCE_AP",
  "FINANCE_AR",
  "GL_ACCOUNTANT",
  "PT_MANAGER",
  "EXECUTIVE",
  "GROUP_VIEWER",
];

/**
 * GET: Get lookup data for dropdowns
 * Query params: ?type=vehicles|suppliers|items
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;
    if (!role || !VIEW_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let result;
    switch (type) {
      case "vehicles":
        result = await WeighbridgeAPI.getVehicles();
        break;
      case "suppliers":
        result = await WeighbridgeAPI.getSuppliers();
        break;
      case "items":
        result = await WeighbridgeAPI.getItems();
        break;
        case "noSeri": {
          const companyId = searchParams.get("companyId");
          const tanggal = searchParams.get("tanggal");
          if (!companyId || !tanggal) {
            return NextResponse.json(
              {
                success: false,
                error: "Parameter companyId dan tanggal wajib diisi",
              },
              { status: 400 }
            );
          }
          result = await WeighbridgeAPI.generateNoSeri(companyId, tanggal);
          break;
        }
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Type parameter required: vehicles|suppliers|items",
          },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: result.statusCode });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

