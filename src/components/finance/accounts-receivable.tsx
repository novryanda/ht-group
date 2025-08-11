"use client";

import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import type { AccountsReceivableItem } from "~/types/finance";

interface AccountsReceivableProps {
  companyId: string;
}

// Mock AR data for different companies
const mockARData: Record<string, AccountsReceivableItem[]> = {
  "PT_NILO": [
    {
      id: "AR-NILO-001",
      invoiceNumber: "INV-NILO-2024-001",
      customerName: "PT ABC Industries",
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-14",
      amount: 60000000,
      paidAmount: 60000000,
      outstandingAmount: 0,
      status: "PAID",
      paymentDate: "2024-02-10",
      daysOverdue: 0,
      jobNumber: "JOB-2024-001",
    },
    {
      id: "AR-NILO-002",
      invoiceNumber: "INV-NILO-2024-002",
      customerName: "CV Maju Jaya",
      invoiceDate: "2024-01-20",
      dueDate: "2024-02-19",
      amount: 85000000,
      paidAmount: 42500000,
      outstandingAmount: 42500000,
      status: "PARTIAL",
      paymentDate: undefined,
      daysOverdue: 0,
      jobNumber: "JOB-2024-002",
    },
    {
      id: "AR-NILO-003",
      invoiceNumber: "INV-NILO-2024-003",
      customerName: "PT Green Environment",
      invoiceDate: "2024-01-10",
      dueDate: "2024-02-09",
      amount: 140000000,
      paidAmount: 0,
      outstandingAmount: 140000000,
      status: "OVERDUE",
      paymentDate: undefined,
      daysOverdue: 6,
      jobNumber: "JOB-2024-003",
    },
    {
      id: "AR-NILO-004",
      invoiceNumber: "INV-NILO-2024-004",
      customerName: "PT Industrial Complex",
      invoiceDate: "2024-01-25",
      dueDate: "2024-02-24",
      amount: 30000000,
      paidAmount: 0,
      outstandingAmount: 30000000,
      status: "OUTSTANDING",
      paymentDate: undefined,
      daysOverdue: 0,
      jobNumber: "JOB-2024-004",
    },
  ],
  "PT_ZTA": [
    {
      id: "AR-ZTA-001",
      invoiceNumber: "INV-ZTA-2024-001",
      customerName: "PT Manufacturing Plus",
      invoiceDate: "2024-01-12",
      dueDate: "2024-02-11",
      amount: 95000000,
      paidAmount: 95000000,
      outstandingAmount: 0,
      status: "PAID",
      paymentDate: "2024-02-08",
      daysOverdue: 0,
      jobNumber: "JOB-ZTA-001",
    },
  ],
  "PT_TAM": [
    {
      id: "AR-TAM-001",
      invoiceNumber: "INV-TAM-2024-001",
      customerName: "PT Industrial Complex",
      invoiceDate: "2024-01-18",
      dueDate: "2024-02-17",
      amount: 30000000,
      paidAmount: 30000000,
      outstandingAmount: 0,
      status: "PAID",
      paymentDate: "2024-02-15",
      daysOverdue: 0,
      jobNumber: "JOB-TAM-001",
    },
  ],
  "PT_HTK": [
    {
      id: "AR-HTK-001",
      invoiceNumber: "INV-HTK-2024-001",
      customerName: "PT Landscape Services",
      invoiceDate: "2024-01-22",
      dueDate: "2024-02-21",
      amount: 45000000,
      paidAmount: 0,
      outstandingAmount: 45000000,
      status: "OUTSTANDING",
      paymentDate: undefined,
      daysOverdue: 0,
      jobNumber: "JOB-HTK-001",
    },
  ],
};

const statusColors = {
  PAID: "success",
  PARTIAL: "warning",
  OUTSTANDING: "default",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
} as const;

export function AccountsReceivable({ companyId }: AccountsReceivableProps) {
  const arData = mockARData[companyId as keyof typeof mockARData] || [];

  // Calculate summary statistics
  const totalInvoiced = arData.reduce((sum, ar) => sum + ar.amount, 0);
  const totalPaid = arData.reduce((sum, ar) => sum + ar.paidAmount, 0);
  const totalOutstanding = arData.reduce((sum, ar) => sum + ar.outstandingAmount, 0);
  const overdueAmount = arData.filter(ar => ar.status === "OVERDUE").reduce((sum, ar) => sum + ar.outstandingAmount, 0);
  const overdueCount = arData.filter(ar => ar.status === "OVERDUE").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<AccountsReceivableItem>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {row.jobNumber}
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {row.invoiceDate}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Invoice Amount",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value as number)}</div>
          {row.paidAmount > 0 && (
            <div className="text-sm text-green-600">
              Paid: {formatCurrency(row.paidAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "outstandingAmount",
      label: "Outstanding",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <div className={`font-medium ${(value as number) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(value as number)}
          </div>
          {(row.daysOverdue ?? 0) > 0 && (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {row.daysOverdue} days overdue
            </div>
          )}
        </div>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm">{value as string}</div>
          {row.paymentDate && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Paid: {row.paymentDate}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={statusColors[value as keyof typeof statusColors]}>
          {value as string}
        </Badge>
      ),
    },
  ];

  const filters = [
    {
      key: "status" as const,
      label: "Status",
      options: [
        { value: "PAID", label: "Paid" },
        { value: "PARTIAL", label: "Partial Payment" },
        { value: "OUTSTANDING", label: "Outstanding" },
        { value: "OVERDUE", label: "Overdue" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* AR Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
            <p className="text-xs text-muted-foreground">
              {arData.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPaid / totalInvoiced) * 100).toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              Pending collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {overdueCount} overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AR Table */}
      <DataTable
        data={arData}
        columns={columns}
        title="Accounts Receivable"
        searchPlaceholder="Search invoice number, customer, or job number..."
        filters={filters}
        addButtonText="Create Invoice"
      />
    </div>
  );
}
