"use client";

import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DollarSign,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package
} from "lucide-react";
import type { AccountsPayableItem } from "~/types/finance";

interface AccountsPayableProps {
  companyId: string;
}

// Mock AP data for different companies
const mockAPData: Record<string, AccountsPayableItem[]> = {
  "PT_NILO": [
    {
      id: "AP-NILO-001",
      billNumber: "BILL-2024-001",
      vendorName: "PT Steel Supplier",
      billDate: "2024-01-12",
      dueDate: "2024-02-11",
      amount: 25000000,
      paidAmount: 25000000,
      outstandingAmount: 0,
      status: "PAID",
      paymentDate: "2024-02-08",
      daysOverdue: 0,
      category: "MATERIALS",
      poNumber: "PO-2024-001",
    },
    {
      id: "AP-NILO-002",
      billNumber: "BILL-2024-002",
      vendorName: "CV Welding Supplies",
      billDate: "2024-01-15",
      dueDate: "2024-02-14",
      amount: 2500000,
      paidAmount: 0,
      outstandingAmount: 2500000,
      status: "OUTSTANDING",
      paymentDate: undefined,
      daysOverdue: 0,
      category: "MATERIALS",
      poNumber: "PO-2024-002",
    },
    {
      id: "AP-NILO-003",
      billNumber: "BILL-2024-003",
      vendorName: "PT Utility Services",
      billDate: "2024-01-05",
      dueDate: "2024-02-04",
      amount: 3500000,
      paidAmount: 0,
      outstandingAmount: 3500000,
      status: "OVERDUE",
      paymentDate: undefined,
      daysOverdue: 11,
      category: "UTILITIES",
      poNumber: undefined,
    },
    {
      id: "AP-NILO-004",
      billNumber: "BILL-2024-004",
      vendorName: "PT Equipment Rental",
      billDate: "2024-01-20",
      dueDate: "2024-02-19",
      amount: 8000000,
      paidAmount: 4000000,
      outstandingAmount: 4000000,
      status: "PARTIAL",
      paymentDate: undefined,
      daysOverdue: 0,
      category: "EQUIPMENT",
      poNumber: "PO-2024-003",
    },
  ],
  "PT_ZTA": [
    {
      id: "AP-ZTA-001",
      billNumber: "BILL-ZTA-2024-001",
      vendorName: "PT HVAC Parts",
      billDate: "2024-01-10",
      dueDate: "2024-02-09",
      amount: 15000000,
      paidAmount: 15000000,
      outstandingAmount: 0,
      status: "PAID",
      paymentDate: "2024-02-05",
      daysOverdue: 0,
      category: "MATERIALS",
      poNumber: "PO-ZTA-001",
    },
  ],
  "PT_TAM": [
    {
      id: "AP-TAM-001",
      billNumber: "BILL-TAM-2024-001",
      vendorName: "PT Garden Equipment",
      billDate: "2024-01-14",
      dueDate: "2024-02-13",
      amount: 5000000,
      paidAmount: 5000000,
      outstandingAmount: 0,
      status: "PAID",
      paymentDate: "2024-02-10",
      daysOverdue: 0,
      category: "EQUIPMENT",
      poNumber: "PO-TAM-001",
    },
  ],
  "PT_HTK": [
    {
      id: "AP-HTK-001",
      billNumber: "BILL-HTK-2024-001",
      vendorName: "PT Office Supplies",
      billDate: "2024-01-18",
      dueDate: "2024-02-17",
      amount: 2000000,
      paidAmount: 0,
      outstandingAmount: 2000000,
      status: "OUTSTANDING",
      paymentDate: undefined,
      daysOverdue: 0,
      category: "OFFICE",
      poNumber: "PO-HTK-001",
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

const categoryColors = {
  MATERIALS: "default",
  EQUIPMENT: "secondary",
  UTILITIES: "warning",
  OFFICE: "outline",
  SERVICES: "info",
} as const;

export function AccountsPayable({ companyId }: AccountsPayableProps) {
  const apData = mockAPData[companyId as keyof typeof mockAPData] || [];

  // Calculate summary statistics
  const totalBilled = apData.reduce((sum, ap) => sum + ap.amount, 0);
  const totalPaid = apData.reduce((sum, ap) => sum + ap.paidAmount, 0);
  const totalOutstanding = apData.reduce((sum, ap) => sum + ap.outstandingAmount, 0);
  const overdueAmount = apData.filter(ap => ap.status === "OVERDUE").reduce((sum, ap) => sum + ap.outstandingAmount, 0);
  const overdueCount = apData.filter(ap => ap.status === "OVERDUE").length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<AccountsPayableItem>[] = [
    {
      key: "billNumber",
      label: "Bill",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            {row.poNumber ?? "No PO"}
          </div>
        </div>
      ),
    },
    {
      key: "vendorName",
      label: "Vendor",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {row.billDate}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value) => (
        <Badge variant={categoryColors[value as keyof typeof categoryColors]}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Bill Amount",
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
    {
      key: "category" as const,
      label: "Category",
      options: [
        { value: "MATERIALS", label: "Materials" },
        { value: "EQUIPMENT", label: "Equipment" },
        { value: "UTILITIES", label: "Utilities" },
        { value: "OFFICE", label: "Office Supplies" },
        { value: "SERVICES", label: "Services" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* AP Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBilled)}</div>
            <p className="text-xs text-muted-foreground">
              {apData.length} bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPaid / totalBilled) * 100).toFixed(1)}% payment rate
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
              Pending payment
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
              {overdueCount} overdue bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AP Table */}
      <DataTable
        data={apData}
        columns={columns}
        title="Accounts Payable"
        searchPlaceholder="Search bill number, vendor, or PO number..."
        filters={filters}
        addButtonText="Create Bill"
      />
    </div>
  );
}
