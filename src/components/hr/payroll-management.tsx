"use client";

import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  User,
  Calendar
} from "lucide-react";
import type { PayrollRecord } from "~/types/hr";

interface PayrollManagementProps {
  companyId: string;
}

// Mock payroll data
const mockPayrollData: Record<string, PayrollRecord[]> = {
  "PT_NILO": [
    {
      id: "PAY-NILO-001",
      employeeId: "NILO001",
      employeeName: "Ahmad Rizki Pratama",
      name: "Ahmad Rizki Pratama",
      period: "January 2024",
      basicSalary: 8500000,
      allowances: 1500000,
      overtime: 750000,
      grossSalary: 10750000,
      deductions: 850000,
      tax: 765000,
      netSalary: 9135000,
      status: "PAID",
      payDate: "2024-01-31",
      workDays: 22,
      overtimeHours: 15,
    },
    {
      id: "PAY-NILO-002",
      employeeId: "NILO002",
      employeeName: "Siti Nurhaliza",
      name: "Siti Nurhaliza",
      period: "January 2024",
      basicSalary: 12000000,
      allowances: 2000000,
      overtime: 500000,
      grossSalary: 14500000,
      deductions: 1200000,
      tax: 1330000,
      netSalary: 11970000,
      status: "PAID",
      payDate: "2024-01-31",
      workDays: 22,
      overtimeHours: 10,
    },
    {
      id: "PAY-NILO-003",
      employeeId: "NILO003",
      employeeName: "Dedi Kurniawan",
      name: "Dedi Kurniawan",
      period: "January 2024",
      basicSalary: 6500000,
      allowances: 1000000,
      overtime: 600000,
      grossSalary: 8100000,
      deductions: 650000,
      tax: 545000,
      netSalary: 6905000,
      status: "APPROVED",
      payDate: "2024-01-31",
      workDays: 21,
      overtimeHours: 12,
    },
    {
      id: "PAY-NILO-004",
      employeeId: "NILO004",
      employeeName: "Maya Sari Dewi",
      name: "Maya Sari Dewi",
      period: "January 2024",
      basicSalary: 7500000,
      allowances: 1200000,
      overtime: 0,
      grossSalary: 8700000,
      deductions: 750000,
      tax: 695000,
      netSalary: 7255000,
      status: "DRAFT",
      payDate: "2024-01-31",
      workDays: 20,
      overtimeHours: 0,
    },
    {
      id: "PAY-NILO-005",
      employeeId: "NILO005",
      employeeName: "Eko Prasetyo",
      name: "Eko Prasetyo",
      period: "January 2024",
      basicSalary: 8000000,
      allowances: 1300000,
      overtime: 400000,
      grossSalary: 9700000,
      deductions: 800000,
      tax: 790000,
      netSalary: 8110000,
      status: "DRAFT",
      payDate: "2024-01-31",
      workDays: 18,
      overtimeHours: 8,
    },
  ],
  "PT_ZTA": [
    {
      id: "PAY-ZTA-001",
      employeeId: "ZTA001",
      employeeName: "Bambang Wijaya",
      name: "Bambang Wijaya",
      period: "January 2024",
      basicSalary: 9500000,
      allowances: 1800000,
      overtime: 950000,
      grossSalary: 12250000,
      deductions: 950000,
      tax: 1030000,
      netSalary: 10270000,
      status: "PAID",
      payDate: "2024-01-31",
      workDays: 22,
      overtimeHours: 19,
    },
  ],
  "PT_TAM": [
    {
      id: "PAY-TAM-001",
      employeeId: "TAM001",
      employeeName: "Joko Susilo",
      name: "Joko Susilo",
      period: "January 2024",
      basicSalary: 7000000,
      allowances: 1100000,
      overtime: 350000,
      grossSalary: 8450000,
      deductions: 700000,
      tax: 675000,
      netSalary: 7075000,
      status: "PAID",
      payDate: "2024-01-31",
      workDays: 22,
      overtimeHours: 7,
    },
  ],
  "PT_HTK": [
    {
      id: "PAY-HTK-001",
      employeeId: "HTK001",
      employeeName: "Rini Astuti",
      name: "Rini Astuti",
      period: "January 2024",
      basicSalary: 10500000,
      allowances: 2100000,
      overtime: 525000,
      grossSalary: 13125000,
      deductions: 1050000,
      tax: 1207500,
      netSalary: 10867500,
      status: "PAID",
      payDate: "2024-01-31",
      workDays: 22,
      overtimeHours: 10,
    },
  ],
};

const statusColors = {
  PENDING: "warning",
  PROCESSED: "default",
  PAID: "success",
  CANCELLED: "destructive",
} as const;

export function PayrollManagement({ companyId }: PayrollManagementProps) {
  const payrollData = mockPayrollData[companyId as keyof typeof mockPayrollData] || [];

  // Calculate summary statistics
  const totalGrossPay = payrollData.reduce((sum, p) => sum + p.basicSalary + p.allowances + p.overtime, 0);
  const totalDeductions = payrollData.reduce((sum, p) => sum + p.deductions + p.tax, 0);
  const totalNetPay = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
  const totalOvertimePay = payrollData.reduce((sum, p) => sum + p.overtime, 0);
  const paidCount = payrollData.filter(p => p.status === "PAID").length;
  const pendingCount = payrollData.filter(p => p.status === "DRAFT").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<PayrollRecord>[] = [
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium">{value as string}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {row.employeeId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "period",
      label: "Period",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {row.workDays} work days
          </div>
        </div>
      ),
    },
    {
      key: "basicSalary",
      label: "Basic Salary",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value as number)}</div>
          <div className="text-sm text-muted-foreground">
            +{formatCurrency(row.allowances)} allowances
          </div>
        </div>
      ),
    },
    {
      key: "overtime",
      label: "Overtime",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value as number)}</div>
          <div className="text-sm text-muted-foreground">
            {row.overtimeHours}h
          </div>
        </div>
      ),
    },
    {
      key: "deductions",
      label: "Deductions",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <div className="text-red-600 font-medium">-{formatCurrency(value as number)}</div>
          <div className="text-sm text-muted-foreground">
            Tax: {formatCurrency(row.tax)}
          </div>
        </div>
      ),
    },
    {
      key: "netSalary",
      label: "Net Salary",
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className="font-bold text-green-600">{formatCurrency(value as number)}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value, row) => (
        <div>
          <Badge variant={statusColors[value as keyof typeof statusColors]}>
            {value as string}
          </Badge>
          {row.payDate && (
            <div className="text-xs text-muted-foreground mt-1">
              {row.payDate}
            </div>
          )}
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "status" as const,
      label: "Status",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "PROCESSED", label: "Processed" },
        { value: "PAID", label: "Paid" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
    {
      key: "period" as const,
      label: "Period",
      options: [
        { value: "January 2024", label: "January 2024" },
        { value: "December 2023", label: "December 2023" },
        { value: "November 2023", label: "November 2023" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGrossPay)}</div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeductions)}</div>
            <p className="text-xs text-muted-foreground">
              Tax + other deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
            <Calculator className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNetPay)}</div>
            <p className="text-xs text-muted-foreground">
              Final amount to pay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount}/{payrollData.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount} pending payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <DataTable
        data={payrollData}
        columns={columns}
        title="Payroll Management - January 2024"
        searchPlaceholder="Search employee name or ID..."
        filters={filters}
        addButtonText="Process Payroll"
      />
    </div>
  );
}
