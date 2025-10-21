import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DashboardService } from "~/server/services/pt-pks/dashboard.service";
import { auth } from "~/server/auth";
import { validateCompanyAccess } from "~/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyCode } = await params;
    
    // Validate company code format
    if (!companyCode?.startsWith('PT-')) {
      return NextResponse.json({ error: "Invalid company code" }, { status: 400 });
    }

    // Validate user has access to this company
    try {
      validateCompanyAccess(session, companyCode);
    } catch (error) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') ?? 'metrics';

    switch (dataType) {
      case 'metrics':
        const metrics = await DashboardService.getPTMetrics(companyCode);
        return NextResponse.json(metrics);

      case 'revenue':
        const months = parseInt(searchParams.get('months') ?? '6');
        const revenueData = await DashboardService.getRevenueData(companyCode, months);
        return NextResponse.json(revenueData);

      case 'workorders':
        const woMonths = parseInt(searchParams.get('months') ?? '6');
        const workOrderData = await DashboardService.getWorkOrderTrendData(companyCode, woMonths);
        return NextResponse.json(workOrderData);

      case 'units':
        const unitDistribution = await DashboardService.getUnitDistribution(companyCode);
        return NextResponse.json(unitDistribution);

      case 'activities':
        const limit = parseInt(searchParams.get('limit') ?? '10');
        const activities = await DashboardService.getRecentActivities(companyCode, limit);
        return NextResponse.json(activities);

      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 });
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
