"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { WorkOrderForm } from "./work-order-form";
import { WorkOrderDetail } from "./work-order-detail";
import { Eye, Edit, Trash2, Calendar, User } from "lucide-react";
import type { WorkOrder } from "~/types/operations";

interface WorkOrderListProps {
  unitType: string;
  companyId?: string;
}

// Enhanced mock data with company-specific information
const mockWorkOrders: Record<string, WorkOrder[]> = {
  "PT_NILO": [
    {
      id: "1",
      woNumber: "WO-NILO-2024-001",
      title: "PM AC Rittal Unit 1",
      assetCode: "AC-RTL-001",
      type: "PREVENTIVE_MAINTENANCE",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      assignedTo: "Ahmad Rizki",
      scheduledDate: "2024-01-15",
      createdAt: "2024-01-10",
      estimatedHours: 4,
      actualHours: 2.5,
      description: "Routine preventive maintenance including filter replacement and system inspection",
    },
    {
      id: "2",
      woNumber: "WO-NILO-2024-002",
      title: "Perbaikan Kompresor AC Rittal Unit 2",
      assetCode: "AC-RTL-002",
      type: "CORRECTIVE_MAINTENANCE",
      priority: "HIGH",
      status: "WAITING_REVIEW",
      assignedTo: "Budi Santoso",
      scheduledDate: "2024-01-16",
      createdAt: "2024-01-12",
      estimatedHours: 6,
      actualHours: 8,
      description: "Compressor repair due to unusual noise and reduced cooling efficiency",
    },
    {
      id: "3",
      woNumber: "WO-NILO-2024-003",
      title: "Inspeksi Rutin AC Split Unit 1",
      assetCode: "AC-SPL-001",
      type: "INSPECTION",
      priority: "LOW",
      status: "APPROVED",
      assignedTo: "Dedi Kurniawan",
      scheduledDate: "2024-01-18",
      createdAt: "2024-01-14",
      estimatedHours: 2,
      actualHours: 0,
      description: "Monthly inspection of AC Split unit performance and safety checks",
    },
    {
      id: "4",
      woNumber: "WO-NILO-2024-004",
      title: "Instalasi AC Split Baru",
      assetCode: "AC-SPL-005",
      type: "INSTALLATION",
      priority: "MEDIUM",
      status: "DRAFT",
      assignedTo: "Eko Prasetyo",
      scheduledDate: "2024-01-20",
      createdAt: "2024-01-15",
      estimatedHours: 8,
      actualHours: 0,
      description: "Installation of new split AC unit in server room B",
    },
  ],
  "PT_ZTA": [
    {
      id: "1",
      woNumber: "WO-ZTA-2024-001",
      title: "PM AC Rittal Unit ZTA-1",
      assetCode: "AC-RTL-ZTA-001",
      type: "PREVENTIVE_MAINTENANCE",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assignedTo: "Bambang Wijaya",
      scheduledDate: "2024-01-16",
      createdAt: "2024-01-12",
      estimatedHours: 6,
      actualHours: 4,
      description: "Comprehensive preventive maintenance for critical HVAC Rittal unit in Surabaya facility",
    },
    {
      id: "2",
      woNumber: "WO-ZTA-2024-002",
      title: "Upgrade Sistem Kontrol AC Rittal",
      assetCode: "AC-RTL-ZTA-002",
      type: "UPGRADE",
      priority: "MEDIUM",
      status: "APPROVED",
      assignedTo: "Indira Sari",
      scheduledDate: "2024-01-22",
      createdAt: "2024-01-18",
      estimatedHours: 12,
      actualHours: 0,
      description: "Upgrade control system for improved efficiency and monitoring capabilities",
    },
    {
      id: "3",
      woNumber: "WO-ZTA-2024-003",
      title: "Emergency Repair Cooling System",
      assetCode: "AC-RTL-ZTA-003",
      type: "REPAIR",
      priority: "URGENT",
      status: "CLOSED",
      assignedTo: "Bambang Wijaya",
      scheduledDate: "2024-01-10",
      createdAt: "2024-01-10",
      estimatedHours: 8,
      actualHours: 10,
      description: "Emergency repair of cooling system failure in main production area",
    },
  ],
};

const statusColors = {
  DRAFT: "secondary",
  IN_PROGRESS: "default",
  WAITING_REVIEW: "warning",
  APPROVED: "success",
  BILLED: "info",
  CLOSED: "outline",
  CANCELLED: "destructive",
} as const;

const priorityColors = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
} as const;

export function WorkOrderList({ unitType, companyId = "PT_NILO" }: WorkOrderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  // Get company-specific work orders
  const workOrderData = mockWorkOrders[companyId as keyof typeof mockWorkOrders] || mockWorkOrders["PT_NILO"] || [];

  const handleView = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowDetail(true);
  };

  const handleEdit = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowForm(true);
  };

  const handleDelete = (workOrder: any) => {
    // In a real app, this would show a confirmation dialog
    console.log("Delete work order:", workOrder.woNumber);
  };

  const handleAdd = () => {
    setSelectedWorkOrder(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted:", data);
    // In a real app, this would call an API
  };

  const columns: Column<WorkOrder>[] = [
    {
      key: "woNumber",
      label: "WO Number",
      sortable: true,
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {row.scheduledDate}
          </div>
        </div>
      ),
    },
    {
      key: "assetCode",
      label: "Asset",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="text-sm">{(value as string).replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value) => (
        <Badge variant={priorityColors[value as keyof typeof priorityColors]}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={statusColors[value as keyof typeof statusColors]}>
          {(value as string).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (value) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value as string}</span>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "status" as const,
      label: "Status",
      options: [
        { value: "DRAFT", label: "Draft" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "WAITING_REVIEW", label: "Waiting Review" },
        { value: "APPROVED", label: "Approved" },
        { value: "BILLED", label: "Billed" },
        { value: "CLOSED", label: "Closed" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
    {
      key: "priority" as const,
      label: "Priority",
      options: [
        { value: "LOW", label: "Low" },
        { value: "MEDIUM", label: "Medium" },
        { value: "HIGH", label: "High" },
        { value: "URGENT", label: "Urgent" },
      ],
    },
    {
      key: "type" as const,
      label: "Type",
      options: [
        { value: "PREVENTIVE_MAINTENANCE", label: "Preventive Maintenance" },
        { value: "CORRECTIVE_MAINTENANCE", label: "Corrective Maintenance" },
        { value: "INSPECTION", label: "Inspection" },
        { value: "REPAIR", label: "Repair" },
        { value: "INSTALLATION", label: "Installation" },
      ],
    },
  ];

  return (
    <>
      <DataTable
        data={workOrderData}
        columns={columns}
        title="Work Orders"
        searchPlaceholder="Search WO Number, Title, Asset, or Technician..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Create Work Order"
        filters={filters}
      />

      <WorkOrderForm
        open={showForm}
        onOpenChange={setShowForm}
        workOrder={selectedWorkOrder}
        onSubmit={handleFormSubmit}
      />

      <WorkOrderDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        workOrder={selectedWorkOrder}
      />
    </>
  );
}
