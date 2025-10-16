import { db } from "~/server/db";

export interface PTDashboardMetrics {
  companyCode: string;
  companyName: string;
  totalEmployees: number;
  activeEmployees: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalWorkOrders: number;
  pendingWorkOrders: number;
  completedWorkOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  lastUpdated: string;
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
      },
    });

    if (!company) {
      throw new Error(`Company with code ${companyCode} not found`);
    }

    const now = new Date();

    // Employee metrics
    const totalEmployees = company.employees.length;
    const activeEmployees = company.employees.filter(emp =>
      !emp.tgl_terakhir_kerja || emp.tgl_terakhir_kerja > now
    ).length;

    // Since we don't have work orders, jobs, and invoices models yet, we'll use placeholder values
    const totalWorkOrders = 0;
    const pendingWorkOrders = 0;
    const completedWorkOrders = 0;
    const totalJobs = 0;
    const activeJobs = 0;
    const completedJobs = 0;
    const totalRevenue = 0;
    const monthlyRevenue = 0;
    const totalInvoices = 0;
    const paidInvoices = 0;
    const pendingInvoices = 0;

    return {
      companyCode,
      companyName: company.name,
      totalEmployees,
      activeEmployees,
      totalJobs,
      activeJobs,
      completedJobs,
      totalWorkOrders,
      pendingWorkOrders,
      completedWorkOrders,
      totalRevenue,
      monthlyRevenue,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      lastUpdated: new Date().toISOString(),
    };
  }

  static async getRevenueData(companyCode: string, months = 6): Promise<RevenueData[]> {
    // Since we don't have invoices model yet, return mock data
    const revenueData: RevenueData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      // Mock data for demonstration
      const revenue = Math.floor(Math.random() * 100000) + 50000;
      const target = revenue * 0.9;

      revenueData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue,
        target,
      });
    }

    return revenueData;
  }

  static async getWorkOrderTrendData(companyCode: string, months = 6): Promise<WorkOrderTrendData[]> {
    // Since we don't have work orders model yet, return mock data
    const trendData: WorkOrderTrendData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      // Mock data for demonstration
      const completed = Math.floor(Math.random() * 20) + 5;
      const pending = Math.floor(Math.random() * 15) + 3;
      const cancelled = Math.floor(Math.random() * 5);

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
    // Since we don't have units model yet, return mock data
    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
    
    return [
      { name: "Unit A", value: 30, color: colors[0]! },
      { name: "Unit B", value: 25, color: colors[1]! },
      { name: "Unit C", value: 20, color: colors[2]! },
      { name: "Unit D", value: 15, color: colors[3]! },
      { name: "Unit E", value: 10, color: colors[4]! },
    ];
  }

  static async getRecentActivities(companyCode: string, limit = 10): Promise<RecentActivity[]> {
    // Since we don't have work orders model yet, return mock data
    const activities: RecentActivity[] = [
      {
        id: '1',
        user: 'Admin User',
        action: 'Created new supplier',
        time: this.formatTimeAgo(new Date(Date.now() - 1000 * 60 * 5)),
        type: 'other',
      },
      {
        id: '2',
        user: 'Finance Team',
        action: 'Processed payment',
        time: this.formatTimeAgo(new Date(Date.now() - 1000 * 60 * 30)),
        type: 'invoice',
      },
      {
        id: '3',
        user: 'HR Manager',
        action: 'Updated employee records',
        time: this.formatTimeAgo(new Date(Date.now() - 1000 * 60 * 60 * 2)),
        type: 'payroll',
      },
    ];

    return activities.slice(0, limit);
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
