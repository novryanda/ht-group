"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EmployeeList } from "./employee-list";
import { AttendanceTracker } from "./attendance-tracker";
import { PayrollManagement } from "./payroll-management";
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  UserCheck,
  Calendar,
  FileText,
  AlertTriangle
} from "lucide-react";

interface HRDashboardProps {
  companyId: string;
}

// Mock HR summary data for different companies
const hrSummaryData = {
  "PT_NILO": {
    totalEmployees: 68,
    activeEmployees: 65,
    onLeave: 2,
    newHires: 3,
    attendanceRate: 94.5,
    avgSalary: 8200000,
    totalPayroll: 531600000,
    pendingPayroll: 2,
  },
  "PT_ZTA": {
    totalEmployees: 35,
    activeEmployees: 34,
    onLeave: 1,
    newHires: 1,
    attendanceRate: 97.2,
    avgSalary: 9750000,
    totalPayroll: 341250000,
    pendingPayroll: 0,
  },
  "PT_TAM": {
    totalEmployees: 28,
    activeEmployees: 27,
    onLeave: 1,
    newHires: 2,
    attendanceRate: 92.8,
    avgSalary: 6800000,
    totalPayroll: 190400000,
    pendingPayroll: 1,
  },
  "PT_HTK": {
    totalEmployees: 25,
    activeEmployees: 24,
    onLeave: 1,
    newHires: 0,
    attendanceRate: 96.1,
    avgSalary: 8900000,
    totalPayroll: 222500000,
    pendingPayroll: 0,
  },
};

export function HRMainDashboard({ companyId }: HRDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const summaryData = hrSummaryData[companyId as keyof typeof hrSummaryData] || hrSummaryData["PT_NILO"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* HR Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.activeEmployees} active, {summaryData.onLeave} on leave
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  This month average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.avgSalary)}</div>
                <p className="text-xs text-muted-foreground">
                  Per employee/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Hires</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.newHires}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payroll Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Monthly Payroll:</span>
                  <span className="text-sm font-medium">{formatCurrency(summaryData.totalPayroll)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Payments:</span>
                  <span className="text-sm font-medium">{summaryData.pendingPayroll} employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Pay Date:</span>
                  <span className="text-sm font-medium">Jan 31, 2024</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Leave Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Annual Leave Taken:</span>
                  <span className="text-sm font-medium">45 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sick Leave:</span>
                  <span className="text-sm font-medium">12 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Requests:</span>
                  <span className="text-sm font-medium">3 requests</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  HR Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-orange-600">Contract Renewals</div>
                  <div className="text-muted-foreground">2 contracts expiring this month</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-blue-600">Performance Reviews</div>
                  <div className="text-muted-foreground">5 reviews due this week</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-green-600">Training</div>
                  <div className="text-muted-foreground">Safety training scheduled</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeeList companyId={companyId} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceTracker companyId={companyId} />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <PayrollManagement companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
