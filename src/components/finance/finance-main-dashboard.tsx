"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AccountsReceivable } from "./accounts-receivable";
import { AccountsPayable } from "./accounts-payable";
import { GeneralLedger } from "./general-ledger";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calculator,
  FileText,
  AlertTriangle
} from "lucide-react";

interface FinanceDashboardProps {
  companyId: string;
}

// Mock finance summary data for different companies
const financeSummaryData = {
  "PT_NILO": {
    totalRevenue: 285000000,
    totalExpenses: 531600000,
    netIncome: -246600000,
    totalAR: 212500000,
    totalAP: 39000000,
    cashFlow: 45000000,
    grossMargin: 35.2,
    currentRatio: 1.8,
  },
  "PT_ZTA": {
    totalRevenue: 95000000,
    totalExpenses: 341250000,
    netIncome: -246250000,
    totalAR: 0,
    totalAP: 0,
    cashFlow: 25000000,
    grossMargin: 42.1,
    currentRatio: 2.1,
  },
  "PT_TAM": {
    totalRevenue: 30000000,
    totalExpenses: 190400000,
    netIncome: -160400000,
    totalAR: 0,
    totalAP: 0,
    cashFlow: 8000000,
    grossMargin: 28.5,
    currentRatio: 1.5,
  },
  "PT_HTK": {
    totalRevenue: 45000000,
    totalExpenses: 222500000,
    netIncome: -177500000,
    totalAR: 45000000,
    totalAP: 2000000,
    cashFlow: 12000000,
    grossMargin: 31.8,
    currentRatio: 1.9,
  },
};

export function FinanceMainDashboard({ companyId }: FinanceDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const summaryData = financeSummaryData[companyId as keyof typeof financeSummaryData] || financeSummaryData["PT_NILO"];

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
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Finance Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summaryData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summaryData.netIncome)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue - Expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.cashFlow)}</div>
                <p className="text-xs text-muted-foreground">
                  Operating cash flow
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Finance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Financial Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gross Margin:</span>
                  <span className="text-sm font-medium">{summaryData.grossMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Ratio:</span>
                  <span className="text-sm font-medium">{summaryData.currentRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit Margin:</span>
                  <span className={`text-sm font-medium ${summaryData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {((summaryData.netIncome / summaryData.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Receivables & Payables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accounts Receivable:</span>
                  <span className="text-sm font-medium">{formatCurrency(summaryData.totalAR)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Accounts Payable:</span>
                  <span className="text-sm font-medium">{formatCurrency(summaryData.totalAP)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Position:</span>
                  <span className={`text-sm font-medium ${(summaryData.totalAR - summaryData.totalAP) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summaryData.totalAR - summaryData.totalAP)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Finance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-orange-600">Overdue Invoices</div>
                  <div className="text-muted-foreground">1 invoice past due date</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-red-600">Overdue Bills</div>
                  <div className="text-muted-foreground">1 bill payment overdue</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-blue-600">Month End</div>
                  <div className="text-muted-foreground">Closing entries pending</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-6">
          <AccountsReceivable companyId={companyId} />
        </TabsContent>

        <TabsContent value="payables" className="space-y-6">
          <AccountsPayable companyId={companyId} />
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
          <GeneralLedger companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
