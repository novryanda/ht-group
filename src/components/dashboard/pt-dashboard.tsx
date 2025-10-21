"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Building2,
  Users,
  Wrench,
  Calculator,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

interface PTDashboardProps {
  companyId: string;
  companyName: string;
  companyCode: string;
}

interface DashboardData {
  metrics: any;
  revenueData: any[];
  workOrderData: any[];
  unitDistribution: any[];
  activities: any[];
}

interface LoadingState {
  metrics: boolean;
  charts: boolean;
  activities: boolean;
}

interface ErrorState {
  metrics: string | null;
  charts: string | null;
  activities: string | null;
}

// Mock data structure for each PT
const ptData = {
  "PT_NILO": {
    metrics: {
      totalEmployees: 45,
      activeWorkOrders: 23,
      completedThisMonth: 67,
      monthlyRevenue: 2800000000,
      revenueGrowth: 12.5,
      activeJobs: 8,
      overdueWorkOrders: 3,
    },
    units: ["HVAC Rittal", "HVAC Split", "Fabrikasi", "Efluen"],
    revenueData: [
      { month: "Jan", revenue: 2400000000, target: 2200000000 },
      { month: "Feb", revenue: 1800000000, target: 2200000000 },
      { month: "Mar", revenue: 2600000000, target: 2200000000 },
      { month: "Apr", revenue: 2200000000, target: 2200000000 },
      { month: "May", revenue: 2800000000, target: 2200000000 },
      { month: "Jun", revenue: 3200000000, target: 2200000000 },
    ],
    workOrderData: [
      { month: "Jan", completed: 15, pending: 4, cancelled: 1 },
      { month: "Feb", completed: 18, pending: 3, cancelled: 1 },
      { month: "Mar", revenue: 16, pending: 5, cancelled: 2 },
      { month: "Apr", completed: 21, pending: 3, cancelled: 0 },
      { month: "May", completed: 19, pending: 6, cancelled: 1 },
      { month: "Jun", completed: 23, pending: 5, cancelled: 1 },
    ],
    unitDistribution: [
      { name: "HVAC Rittal", value: 35, color: "#0088FE" },
      { name: "HVAC Split", value: 25, color: "#00C49F" },
      { name: "Fabrikasi", value: 25, color: "#FFBB28" },
      { name: "Efluen", value: 15, color: "#FF8042" },
    ],
  },
  "PT_ZTA": {
    metrics: {
      totalEmployees: 28,
      activeWorkOrders: 15,
      completedThisMonth: 42,
      monthlyRevenue: 1800000000,
      revenueGrowth: 8.3,
      activeJobs: 5,
      overdueWorkOrders: 2,
    },
    units: ["HVAC Rittal", "HVAC Split"],
    revenueData: [
      { month: "Jan", revenue: 1600000000, target: 1500000000 },
      { month: "Feb", revenue: 1400000000, target: 1500000000 },
      { month: "Mar", revenue: 1700000000, target: 1500000000 },
      { month: "Apr", revenue: 1500000000, target: 1500000000 },
      { month: "May", revenue: 1800000000, target: 1500000000 },
      { month: "Jun", revenue: 2000000000, target: 1500000000 },
    ],
    workOrderData: [
      { month: "Jan", completed: 12, pending: 3, cancelled: 0 },
      { month: "Feb", completed: 14, pending: 2, cancelled: 1 },
      { month: "Mar", completed: 11, pending: 4, cancelled: 1 },
      { month: "Apr", completed: 16, pending: 2, cancelled: 0 },
      { month: "May", completed: 13, pending: 5, cancelled: 1 },
      { month: "Jun", completed: 15, pending: 4, cancelled: 0 },
    ],
    unitDistribution: [
      { name: "HVAC Rittal", value: 60, color: "#0088FE" },
      { name: "HVAC Split", value: 40, color: "#00C49F" },
    ],
  },
  "PT_TAM": {
    metrics: {
      totalEmployees: 32,
      activeWorkOrders: 0,
      completedThisMonth: 0,
      monthlyRevenue: 2200000000,
      revenueGrowth: 15.2,
      activeJobs: 12,
      overdueWorkOrders: 0,
    },
    units: ["Fabrikasi"],
    revenueData: [
      { month: "Jan", revenue: 1800000000, target: 2000000000 },
      { month: "Feb", revenue: 1600000000, target: 2000000000 },
      { month: "Mar", revenue: 2100000000, target: 2000000000 },
      { month: "Apr", revenue: 1900000000, target: 2000000000 },
      { month: "May", revenue: 2200000000, target: 2000000000 },
      { month: "Jun", revenue: 2500000000, target: 2000000000 },
    ],
    workOrderData: [
      { month: "Jan", completed: 0, pending: 0, cancelled: 0 },
      { month: "Feb", completed: 0, pending: 0, cancelled: 0 },
      { month: "Mar", completed: 0, pending: 0, cancelled: 0 },
      { month: "Apr", completed: 0, pending: 0, cancelled: 0 },
      { month: "May", completed: 0, pending: 0, cancelled: 0 },
      { month: "Jun", completed: 0, pending: 0, cancelled: 0 },
    ],
    unitDistribution: [
      { name: "Fabrikasi", value: 100, color: "#0088FE" },
    ],
  },
  "PT_HTK": {
    metrics: {
      totalEmployees: 18,
      activeWorkOrders: 0,
      completedThisMonth: 0,
      monthlyRevenue: 800000000,
      revenueGrowth: 5.8,
      activeJobs: 6,
      overdueWorkOrders: 0,
    },
    units: ["Cutting Grass"],
    revenueData: [
      { month: "Jan", revenue: 700000000, target: 750000000 },
      { month: "Feb", revenue: 650000000, target: 750000000 },
      { month: "Mar", revenue: 780000000, target: 750000000 },
      { month: "Apr", revenue: 720000000, target: 750000000 },
      { month: "May", revenue: 800000000, target: 750000000 },
      { month: "Jun", revenue: 850000000, target: 750000000 },
    ],
    workOrderData: [
      { month: "Jan", completed: 0, pending: 0, cancelled: 0 },
      { month: "Feb", completed: 0, pending: 0, cancelled: 0 },
      { month: "Mar", completed: 0, pending: 0, cancelled: 0 },
      { month: "Apr", completed: 0, pending: 0, cancelled: 0 },
      { month: "May", completed: 0, pending: 0, cancelled: 0 },
      { month: "Jun", completed: 0, pending: 0, cancelled: 0 },
    ],
    unitDistribution: [
      { name: "Cutting Grass", value: 100, color: "#0088FE" },
    ],
  },
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function PTDashboard({ companyId, companyName, companyCode }: PTDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: null,
    revenueData: [],
    workOrderData: [],
    unitDistribution: [],
    activities: [],
  });

  const [loading, setLoading] = useState<LoadingState>({
    metrics: true,
    charts: true,
    activities: true,
  });

  const [errors, setErrors] = useState<ErrorState>({
    metrics: null,
    charts: null,
    activities: null,
  });

  // Fallback to mock data if API fails
  const fallbackData = ptData[companyId as keyof typeof ptData] || ptData["PT_NILO"];

  const fetchDashboardData = async () => {
    try {
      // Reset loading states
      setLoading({ metrics: true, charts: true, activities: true });
      setErrors({ metrics: null, charts: null, activities: null });

      // Fetch metrics
      try {
        const metricsResponse = await fetch(`/api/dashboard/${companyCode}?type=metrics`);
        if (metricsResponse.ok) {
          const metrics = await metricsResponse.json();
          setDashboardData(prev => ({ ...prev, metrics }));
        } else {
          throw new Error('Failed to fetch metrics');
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setErrors(prev => ({ ...prev, metrics: 'Failed to load metrics' }));
        // Use fallback data
        setDashboardData(prev => ({ ...prev, metrics: fallbackData.metrics }));
      } finally {
        setLoading(prev => ({ ...prev, metrics: false }));
      }

      // Fetch chart data
      try {
        const [revenueResponse, workOrderResponse, unitResponse] = await Promise.all([
          fetch(`/api/dashboard/${companyCode}?type=revenue`),
          fetch(`/api/dashboard/${companyCode}?type=workorders`),
          fetch(`/api/dashboard/${companyCode}?type=units`),
        ]);

        const revenueData = revenueResponse.ok ? await revenueResponse.json() : fallbackData.revenueData;
        const workOrderData = workOrderResponse.ok ? await workOrderResponse.json() : fallbackData.workOrderData;
        const unitDistribution = unitResponse.ok ? await unitResponse.json() : fallbackData.unitDistribution;

        setDashboardData(prev => ({
          ...prev,
          revenueData,
          workOrderData,
          unitDistribution,
        }));
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setErrors(prev => ({ ...prev, charts: 'Failed to load chart data' }));
        // Use fallback data
        setDashboardData(prev => ({
          ...prev,
          revenueData: fallbackData.revenueData,
          workOrderData: fallbackData.workOrderData,
          unitDistribution: fallbackData.unitDistribution,
        }));
      } finally {
        setLoading(prev => ({ ...prev, charts: false }));
      }

      // Fetch activities
      try {
        const activitiesResponse = await fetch(`/api/dashboard/${companyCode}?type=activities`);
        if (activitiesResponse.ok) {
          const activities = await activitiesResponse.json();
          setDashboardData(prev => ({ ...prev, activities }));
        } else {
          throw new Error('Failed to fetch activities');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setErrors(prev => ({ ...prev, activities: 'Failed to load recent activities' }));
        // Use empty array as fallback for activities
        setDashboardData(prev => ({ ...prev, activities: [] }));
      } finally {
        setLoading(prev => ({ ...prev, activities: false }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [companyCode]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    }
    return formatCurrency(amount);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <div className="flex items-center gap-4">
          <Building2 className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-gray-600">Dashboard Overview - {companyCode}</p>
            <div className="flex gap-2 mt-2">
              {fallbackData.units.map((unit) => (
                <Badge key={unit} variant="secondary" className="text-xs">
                  {unit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 transition-colors"
          disabled={loading.metrics || loading.charts}
        >
          <RefreshCw className={`h-4 w-4 ${loading.metrics || loading.charts ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Alerts */}
      {(errors.metrics || errors.charts || errors.activities) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some data could not be loaded. Showing cached or sample data.
            {errors.metrics && <div>• {errors.metrics}</div>}
            {errors.charts && <div>• {errors.charts}</div>}
            {errors.activities && <div>• {errors.activities}</div>}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading.metrics ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData.metrics?.totalEmployees || fallbackData.metrics.totalEmployees}
                </div>
                <p className="text-xs text-muted-foreground">Active employees</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading.metrics ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCompactCurrency(dashboardData.metrics?.monthlyRevenue || fallbackData.metrics.monthlyRevenue)}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {(dashboardData.metrics?.revenueGrowth || fallbackData.metrics.revenueGrowth) > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={(dashboardData.metrics?.revenueGrowth || fallbackData.metrics.revenueGrowth) > 0 ? "text-green-600" : "text-red-600"}>
                    {(dashboardData.metrics?.revenueGrowth || fallbackData.metrics.revenueGrowth) > 0 ? "+" : ""}
                    {(dashboardData.metrics?.revenueGrowth || fallbackData.metrics.revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {((dashboardData.metrics?.activeWorkOrders || fallbackData.metrics.activeWorkOrders) > 0) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
              <Wrench className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loading.metrics ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {dashboardData.metrics?.activeWorkOrders || fallbackData.metrics.activeWorkOrders}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {dashboardData.metrics?.completedThisMonth || fallbackData.metrics.completedThisMonth} completed
                    </Badge>
                    {(dashboardData.metrics?.overdueWorkOrders || fallbackData.metrics.overdueWorkOrders) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {dashboardData.metrics?.overdueWorkOrders || fallbackData.metrics.overdueWorkOrders} overdue
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {loading.metrics ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData.metrics?.activeJobs || fallbackData.metrics.activeJobs}
                </div>
                <p className="text-xs text-muted-foreground">Projects in progress</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.charts ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="space-y-4 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.revenueData.length > 0 ? dashboardData.revenueData : fallbackData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCompactCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => [formatCompactCurrency(value), ""]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Actual Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stackId="2"
                      stroke="#ff7300"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.charts ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="space-y-4 w-full">
                  <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.unitDistribution.length > 0 ? dashboardData.unitDistribution : fallbackData.unitDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const { name, percent } = props;
                        const pct = typeof percent === "number" ? (percent * 100).toFixed(0) : "0";
                        return `${name ?? ""} ${pct}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData.unitDistribution.length > 0 ? dashboardData.unitDistribution : fallbackData.unitDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
