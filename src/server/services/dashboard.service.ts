
import { db } from "~/server/db";

export interface PTDashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  activeWorkOrders: number;
  completedWorkOrdersThisMonth: number;
  overdueWorkOrders: number;
  activeJobs: number;
  completedJobsThisMonth: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalAssets: number;
  assetsUnderMaintenance: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface WorkOrderTrendData {
  month: string;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface UnitDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'work_order' | 'job' | 'invoice' | 'payroll' | 'other';
}

export class DashboardService {
  static async getPTMetrics(companyCode: string): Promise<PTDashboardMetrics> {
    const company = await db.company.findUnique({
      where: { code: companyCode },
      include: {
        employees: true,
        workOrders: true,
        jobs: true,
        invoices: true,
        units: {
          include: {
            assets: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error(`Company with code ${companyCode} not found`);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Employee metrics
    const totalEmployees = company.employees.length;
    const activeEmployees = company.employees.filter(emp => emp.isActive).length;

    // Work Order metrics
    const activeWorkOrders = company.workOrders.filter(wo => 
      wo.status === 'IN_PROGRESS' || wo.status === 'WAITING_REVIEW' || wo.status === 'APPROVED'
    ).length;

    const completedWorkOrdersThisMonth = company.workOrders.filter(wo => 
      wo.status === 'CLOSED' && wo.endDate && wo.endDate >= startOfMonth
    ).length;

    const overdueWorkOrders = company.workOrders.filter(wo => 
      wo.scheduledDate && wo.scheduledDate < now && 
      (wo.status !== 'CLOSED' && wo.status !== 'CANCELLED')
    ).length;

    // Job metrics
    const activeJobs = company.jobs.filter(job => 
      job.status === 'IN_PROGRESS' || job.status === 'OPEN'
    ).length;

    const completedJobsThisMonth = company.jobs.filter(job => 
      job.status === 'CLOSED' && job.endDate && job.endDate >= startOfMonth
    ).length;

    // Revenue metrics (from invoices)
    const thisMonthInvoices = company.invoices.filter(inv => 
      inv.createdAt >= startOfMonth && inv.status === 'PAID'
    );
    const lastMonthInvoices = company.invoices.filter(inv => 
      inv.createdAt >= startOfLastMonth && inv.createdAt <= endOfLastMonth && inv.status === 'PAID'
    );

    const monthlyRevenue = thisMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const revenueGrowth = lastMonthRevenue > 0 ? 
      ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Asset metrics
    const allAssets = company.units.flatMap(unit => unit.assets);
    const totalAssets = allAssets.length;
    const assetsUnderMaintenance = allAssets.filter(asset => 
      asset.status === 'MAINTENANCE'
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      activeWorkOrders,
      completedWorkOrdersThisMonth,
      overdueWorkOrders,
      activeJobs,
      completedJobsThisMonth,
      monthlyRevenue,
      revenueGrowth,
      totalAssets,
      assetsUnderMaintenance,
    };
  }

  static async getRevenueData(companyCode: string, months = 6): Promise<RevenueData[]> {
    const company = await db.company.findUnique({
      where: { code: companyCode },
      include: {
        invoices: {
          where: {
            status: 'PAID',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - months + 1, 1),
            },
          },
        },
      },
    });

    if (!company) {
      throw new Error(`Company with code ${companyCode} not found`);
    }

    const revenueData: RevenueData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthInvoices = company.invoices.filter(inv => 
        inv.createdAt >= monthDate && inv.createdAt < nextMonthDate
      );

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      // Mock target - in real implementation, this would come from business targets
      const target = revenue * 0.9; // Assume target is 90% of actual for demo

      revenueData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue,
        target,
      });
    }

    return revenueData;
  }

  static async getWorkOrderTrendData(companyCode: string, months = 6): Promise<WorkOrderTrendData[]> {
    const company = await db.company.findUnique({
      where: { code: companyCode },
      include: {
        workOrders: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - months + 1, 1),
            },
          },
        },
      },
    });

    if (!company) {
      throw new Error(`Company with code ${companyCode} not found`);
    }

    const trendData: WorkOrderTrendData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthWorkOrders = company.workOrders.filter(wo => 
        wo.createdAt >= monthDate && wo.createdAt < nextMonthDate
      );

      const completed = monthWorkOrders.filter(wo => wo.status === 'CLOSED').length;
      const pending = monthWorkOrders.filter(wo => 
        wo.status === 'IN_PROGRESS' || wo.status === 'WAITING_REVIEW' || wo.status === 'APPROVED'
      ).length;
      const cancelled = monthWorkOrders.filter(wo => wo.status === 'CANCELLED').length;

      trendData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        completed,
        pending,
        cancelled,
      });
    }

    return trendData;
  }

  static async getUnitDistribution(companyCode: string): Promise<UnitDistribution[]> {
    const company = await db.company.findUnique({
      where: { code: companyCode },
      include: {
        units: {
          include: {
            workOrders: {
              where: {
                status: { not: 'CANCELLED' },
              },
            },
            jobs: {
              where: {
                status: { not: 'CANCELLED' },
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new Error(`Company with code ${companyCode} not found`);
    }

    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
    
    return company.units.map((unit, index) => {
      const workOrderCount = unit.workOrders.length;
      const jobCount = unit.jobs.length;
      const totalActivity = workOrderCount + jobCount;

      return {
        name: unit.name,
        value: totalActivity,
        color: colors[index % colors.length] || "#8884d8",
      };
    });
  }

  static async getRecentActivities(companyCode: string, limit = 10): Promise<RecentActivity[]> {
    const company = await db.company.findUnique({
      where: { code: companyCode },
      include: {
        workOrders: {
          include: {
            createdBy: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: limit,
        },
        jobs: {
          orderBy: {
            updatedAt: 'desc',
          },
          take: limit,
        },
        invoices: {
          orderBy: {
            updatedAt: 'desc',
          },
          take: limit,
        },
      },
    });

    if (!company) {
      throw new Error(`Company with code ${companyCode} not found`);
    }

    const activities: RecentActivity[] = [];

    // Add work order activities
    company.workOrders.forEach(wo => {
      activities.push({
        id: wo.id,
        user: wo.createdBy?.name || 'Unknown User',
        action: `Updated work order ${wo.woNumber}`,
        time: this.formatTimeAgo(wo.updatedAt),
        type: 'work_order',
      });
    });

    // Add job activities
    company.jobs.forEach(job => {
      activities.push({
        id: job.id,
        user: 'System', // Jobs don't have direct user relation in current schema
        action: `Updated job ${job.jobNumber}`,
        time: this.formatTimeAgo(job.updatedAt),
        type: 'job',
      });
    });

    // Add invoice activities
    company.invoices.forEach(invoice => {
      activities.push({
        id: invoice.id,
        user: 'Finance Team',
        action: `Updated invoice ${invoice.invoiceNumber}`,
        time: this.formatTimeAgo(invoice.updatedAt),
        type: 'invoice',
      });
    });

    // Sort by most recent and limit
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  }

  private static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}
