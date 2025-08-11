"use client";

import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  BarChart3,
  PieChart
} from "lucide-react";
import type { GeneralLedgerItem } from "~/types/finance";

interface GeneralLedgerProps {
  companyId: string;
}

// Mock GL data for different companies
const mockGLData: Record<string, GeneralLedgerItem[]> = {
  "PT_NILO": [
    {
      id: "GL-NILO-001",
      entryNumber: "JE-2024-001",
      date: "2024-01-15",
      description: "Revenue from Job JOB-2024-001",
      accountCode: "4000",
      accountName: "Revenue - Fabrication",
      debit: 0,
      credit: 60000000,
      balance: 60000000,
      reference: "INV-NILO-2024-001",
      entryType: "REVENUE",
    },
    {
      id: "GL-NILO-002",
      entryNumber: "JE-2024-001",
      date: "2024-01-15",
      description: "Accounts Receivable from Job JOB-2024-001",
      accountCode: "1200",
      accountName: "Accounts Receivable",
      debit: 60000000,
      credit: 0,
      balance: 60000000,
      reference: "INV-NILO-2024-001",
      entryType: "ASSET",
    },
    {
      id: "GL-NILO-003",
      entryNumber: "JE-2024-002",
      date: "2024-01-12",
      description: "Material Purchase - Steel Plates",
      accountCode: "1300",
      accountName: "Inventory - Raw Materials",
      debit: 25000000,
      credit: 0,
      balance: 25000000,
      reference: "BILL-2024-001",
      entryType: "ASSET",
    },
    {
      id: "GL-NILO-004",
      entryNumber: "JE-2024-002",
      date: "2024-01-12",
      description: "Accounts Payable - Steel Supplier",
      accountCode: "2100",
      accountName: "Accounts Payable",
      debit: 0,
      credit: 25000000,
      balance: 25000000,
      reference: "BILL-2024-001",
      entryType: "LIABILITY",
    },
    {
      id: "GL-NILO-005",
      entryNumber: "JE-2024-003",
      date: "2024-01-31",
      description: "Salary Expense - January 2024",
      accountCode: "6100",
      accountName: "Salary Expense",
      debit: 531600000,
      credit: 0,
      balance: 531600000,
      reference: "PAY-2024-01",
      entryType: "EXPENSE",
    },
  ],
  "PT_ZTA": [
    {
      id: "GL-ZTA-001",
      entryNumber: "JE-ZTA-2024-001",
      date: "2024-01-12",
      description: "Revenue from HVAC Services",
      accountCode: "4100",
      accountName: "Revenue - HVAC Services",
      debit: 0,
      credit: 95000000,
      balance: 95000000,
      reference: "INV-ZTA-2024-001",
      entryType: "REVENUE",
    },
  ],
  "PT_TAM": [
    {
      id: "GL-TAM-001",
      entryNumber: "JE-TAM-2024-001",
      date: "2024-01-18",
      description: "Revenue from Landscaping Services",
      accountCode: "4200",
      accountName: "Revenue - Landscaping",
      debit: 0,
      credit: 30000000,
      balance: 30000000,
      reference: "INV-TAM-2024-001",
      entryType: "REVENUE",
    },
  ],
  "PT_HTK": [
    {
      id: "GL-HTK-001",
      entryNumber: "JE-HTK-2024-001",
      date: "2024-01-22",
      description: "Revenue from Cutting Grass Services",
      accountCode: "4300",
      accountName: "Revenue - Maintenance Services",
      debit: 0,
      credit: 45000000,
      balance: 45000000,
      reference: "INV-HTK-2024-001",
      entryType: "REVENUE",
    },
  ],
};

const entryTypeColors = {
  ASSET: "default",
  LIABILITY: "warning",
  EQUITY: "info",
  REVENUE: "success",
  EXPENSE: "destructive",
} as const;

export function GeneralLedger({ companyId }: GeneralLedgerProps) {
  const glData = mockGLData[companyId as keyof typeof mockGLData] || [];

  // Calculate summary statistics
  const totalDebits = glData.reduce((sum, gl) => sum + gl.debit, 0);
  const totalCredits = glData.reduce((sum, gl) => sum + gl.credit, 0);
  const totalRevenue = glData.filter(gl => gl.entryType === "REVENUE").reduce((sum, gl) => sum + gl.credit, 0);
  const totalExpenses = glData.filter(gl => gl.entryType === "EXPENSE").reduce((sum, gl) => sum + gl.debit, 0);
  const netIncome = totalRevenue - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<GeneralLedgerItem>[] = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {row.entryNumber}
          </div>
        </div>
      ),
    },
    {
      key: "accountCode",
      label: "Account",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground">{row.accountName}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground">Ref: {row.reference}</div>
        </div>
      ),
    },
    {
      key: "entryType",
      label: "Type",
      sortable: true,
      render: (value) => (
        <Badge variant={entryTypeColors[value as keyof typeof entryTypeColors]}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: "debit",
      label: "Debit",
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className={`font-medium ${(value as number) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {(value as number) > 0 ? formatCurrency(value as number) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "credit",
      label: "Credit",
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className={`font-medium ${(value as number) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {(value as number) > 0 ? formatCurrency(value as number) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value as number)}</div>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "entryType" as const,
      label: "Entry Type",
      options: [
        { value: "ASSET", label: "Asset" },
        { value: "LIABILITY", label: "Liability" },
        { value: "EQUITY", label: "Equity" },
        { value: "REVENUE", label: "Revenue" },
        { value: "EXPENSE", label: "Expense" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* GL Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              All debit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              All credit entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <PieChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Trial Balance Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Debits:</span>
              <span className="text-sm font-medium">{formatCurrency(totalDebits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Credits:</span>
              <span className="text-sm font-medium">{formatCurrency(totalCredits)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Difference:</span>
              <span className={`text-sm font-medium ${totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalDebits - totalCredits))}
              </span>
            </div>
            <div className="text-center">
              <Badge variant={totalDebits === totalCredits ? "success" : "destructive"}>
                {totalDebits === totalCredits ? "BALANCED" : "OUT OF BALANCE"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Period Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Period:</span>
              <span className="text-sm font-medium">January 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Entries:</span>
              <span className="text-sm font-medium">{glData.length} transactions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Entry:</span>
              <span className="text-sm font-medium">2024-01-31</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Account Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Assets:</span>
              <span className="text-sm font-medium">
                {glData.filter(gl => gl.entryType === "ASSET").length} entries
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue:</span>
              <span className="text-sm font-medium">
                {glData.filter(gl => gl.entryType === "REVENUE").length} entries
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expenses:</span>
              <span className="text-sm font-medium">
                {glData.filter(gl => gl.entryType === "EXPENSE").length} entries
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GL Table */}
      <DataTable
        data={glData}
        columns={columns}
        title="General Ledger Entries"
        searchPlaceholder="Search entry number, account, description, or reference..."
        filters={filters}
        addButtonText="Create Journal Entry"
      />
    </div>
  );
}
