"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { DataTable, type Column } from "~/components/ui/data-table";
import { JobForm } from "./job-form";
import { JobDetail } from "./job-detail";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import type { JobOrder } from "~/types/operations";

interface JobListProps {
  unitType: string;
  companyId?: string;
}

// Enhanced mock data with company-specific project information
const mockJobs: Record<string, JobOrder[]> = {
  "PT_NILO": [
  {
    id: "1",
    jobNumber: "JOB-2024-001",
    title: "Fabrikasi Tangki Air 5000L",
    type: "FABRICATION",
    status: "IN_PROGRESS",
    customerName: "PT ABC Industries",
    startDate: "2024-01-10",
    endDate: "2024-02-15",
    estimatedCost: 50000000,
    actualCost: 35000000,
    contractValue: 60000000,
    progress: 70,
    createdAt: "2024-01-08",
    projectManager: "Budi Santoso",
    priority: "HIGH",
    description: "Fabrication of 5000L water tank with custom specifications including pressure testing and quality certification.",
  },
  {
    id: "2",
    jobNumber: "JOB-2024-002",
    title: "Pembuatan Struktur Baja Gudang",
    type: "FABRICATION",
    status: "FOR_BILLING",
    customerName: "CV Maju Jaya",
    startDate: "2024-01-15",
    endDate: "2024-01-30",
    estimatedCost: 75000000,
    actualCost: 72000000,
    contractValue: 85000000,
    progress: 95,
    createdAt: "2024-01-12",
    projectManager: "Siti Nurhaliza",
    priority: "MEDIUM",
    description: "Complete steel structure fabrication for warehouse including foundation bolts and installation guidance.",
  },
  {
    id: "3",
    jobNumber: "JOB-2024-003",
    title: "Instalasi Sistem Efluen",
    type: "EFFLUENT_TREATMENT",
    status: "OPEN",
    customerName: "PT Green Environment",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    estimatedCost: 120000000,
    actualCost: 0,
    contractValue: 140000000,
    progress: 5,
    createdAt: "2024-01-20",
    projectManager: "Dedi Kurniawan",
    priority: "HIGH",
    description: "Complete effluent treatment system installation including piping, pumps, and control systems.",
  },
  {
    id: "4",
    jobNumber: "JOB-2024-004",
    title: "Maintenance Cutting Grass Area Pabrik",
    type: "CUTTING_GRASS",
    status: "IN_PROGRESS",
    customerName: "PT Industrial Complex",
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    estimatedCost: 25000000,
    actualCost: 15000000,
    contractValue: 30000000,
    progress: 60,
    createdAt: "2024-01-12",
    projectManager: "Maya Sari",
    priority: "LOW",
    description: "Monthly grass cutting and landscaping maintenance for industrial complex covering 5 hectares.",
  },
  {
    id: "5",
    jobNumber: "JOB-2024-005",
    title: "Instalasi Conveyor System",
    type: "INSTALLATION",
    status: "CLOSED",
    customerName: "PT Manufacturing Plus",
    startDate: "2023-12-01",
    endDate: "2024-01-10",
    estimatedCost: 80000000,
    actualCost: 78000000,
    contractValue: 95000000,
    progress: 100,
    createdAt: "2023-11-25",
    projectManager: "Budi Santoso",
    priority: "URGENT",
    description: "Complete conveyor system installation with automated controls and safety features.",
  },
  ],
  "PT_TAM": [
    {
      id: "1",
      jobNumber: "JOB-TAM-2024-001",
      title: "Maintenance Cutting Grass Area Pabrik",
      type: "CUTTING_GRASS",
      status: "IN_PROGRESS",
      customerName: "PT Industrial Complex",
      startDate: "2024-01-15",
      endDate: "2024-02-28",
      estimatedCost: 25000000,
      actualCost: 15000000,
      contractValue: 30000000,
      progress: 60,
      createdAt: "2024-01-12",
      projectManager: "Joko Susilo",
      priority: "MEDIUM",
      description: "Monthly grass cutting and landscaping maintenance for industrial complex covering 5 hectares.",
    },
    {
      id: "2",
      jobNumber: "JOB-TAM-2024-002",
      title: "Landscaping Taman Kota Bandung",
      type: "CUTTING_GRASS",
      status: "OPEN",
      customerName: "Pemkot Bandung",
      startDate: "2024-02-01",
      endDate: "2024-03-30",
      estimatedCost: 45000000,
      actualCost: 0,
      contractValue: 55000000,
      progress: 5,
      createdAt: "2024-01-20",
      projectManager: "Joko Susilo",
      priority: "HIGH",
      description: "Complete landscaping and grass maintenance for city park covering 10 hectares with irrigation system.",
    },
    {
      id: "3",
      jobNumber: "JOB-TAM-2024-003",
      title: "Pemeliharaan Taman Perumahan Elite",
      type: "CUTTING_GRASS",
      status: "CLOSED",
      customerName: "PT Property Developer",
      startDate: "2023-12-01",
      endDate: "2024-01-15",
      estimatedCost: 18000000,
      actualCost: 17500000,
      contractValue: 22000000,
      progress: 100,
      createdAt: "2023-11-25",
      projectManager: "Joko Susilo",
      priority: "LOW",
      description: "Regular maintenance of residential complex gardens and green areas.",
    },
  ],
  "PT_HTK": [
    {
      id: "1",
      jobNumber: "JOB-HTK-2024-001",
      title: "Cutting Grass Kawasan Industri Medan",
      type: "CUTTING_GRASS",
      status: "IN_PROGRESS",
      customerName: "PT Kawasan Industri Medan",
      startDate: "2024-01-10",
      endDate: "2024-02-25",
      estimatedCost: 35000000,
      actualCost: 20000000,
      contractValue: 42000000,
      progress: 65,
      createdAt: "2024-01-05",
      projectManager: "Rini Astuti",
      priority: "HIGH",
      description: "Comprehensive grass cutting and landscape maintenance for industrial estate covering 8 hectares.",
    },
    {
      id: "2",
      jobNumber: "JOB-HTK-2024-002",
      title: "Maintenance Lapangan Golf Medan",
      type: "CUTTING_GRASS",
      status: "FOR_BILLING",
      customerName: "Medan Golf Club",
      startDate: "2024-01-05",
      endDate: "2024-01-31",
      estimatedCost: 28000000,
      actualCost: 27000000,
      contractValue: 35000000,
      progress: 95,
      createdAt: "2024-01-02",
      projectManager: "Rini Astuti",
      priority: "MEDIUM",
      description: "Professional golf course maintenance including precision grass cutting and green care.",
    },
  ],
};

const statusColors = {
  OPEN: "secondary",
  IN_PROGRESS: "default",
  FOR_BILLING: "warning",
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

export function JobList({ unitType, companyId = "PT_NILO" }: JobListProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Get company-specific job data
  const jobData = mockJobs[companyId as keyof typeof mockJobs] || mockJobs["PT_NILO"] || [];

  const handleView = (job: any) => {
    setSelectedJob(job);
    setShowDetail(true);
  };

  const handleEdit = (job: any) => {
    setSelectedJob(job);
    setShowForm(true);
  };

  const handleDelete = (job: any) => {
    console.log("Delete job:", job.jobNumber);
  };

  const handleAdd = () => {
    setSelectedJob(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<JobOrder>[] = [
    {
      key: "jobNumber",
      label: "Job Number",
      sortable: true,
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      key: "title",
      label: "Project Title",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {row.customerName}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <span className="text-sm">{(value as string).replace(/_/g, " ")}</span>
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
      key: "progress",
      label: "Progress",
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{value as number}%</span>
            <Badge variant={priorityColors[row.priority as keyof typeof priorityColors]} className="text-xs">
              {row.priority}
            </Badge>
          </div>
          <Progress value={value as number} className="h-2" />
        </div>
      ),
    },
    {
      key: "contractValue",
      label: "Contract Value",
      sortable: true,
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value as number)}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Profit: {formatCurrency((value as number) - row.actualCost)}
          </div>
        </div>
      ),
    },
    {
      key: "endDate",
      label: "Timeline",
      render: (value, row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{row.startDate}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{value as string}</span>
          </div>
        </div>
      ),
    },
  ];

  const filters = [
    {
      key: "status" as const,
      label: "Status",
      options: [
        { value: "OPEN", label: "Open" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "FOR_BILLING", label: "For Billing" },
        { value: "BILLED", label: "Billed" },
        { value: "CLOSED", label: "Closed" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
    {
      key: "type" as const,
      label: "Type",
      options: [
        { value: "FABRICATION", label: "Fabrication" },
        { value: "EFFLUENT_TREATMENT", label: "Effluent Treatment" },
        { value: "CUTTING_GRASS", label: "Cutting Grass" },
        { value: "MAINTENANCE_PROJECT", label: "Maintenance Project" },
        { value: "INSTALLATION", label: "Installation" },
        { value: "OTHER", label: "Other" },
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
  ];

  return (
    <>
      <DataTable
        data={jobData}
        columns={columns}
        title="Job Orders"
        searchPlaceholder="Search Job Number, Title, Customer, or Project Manager..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Create Job Order"
        filters={filters}
      />

      <JobForm
        open={showForm}
        onOpenChange={setShowForm}
        job={selectedJob}
        onSubmit={handleFormSubmit}
      />

      <JobDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        job={selectedJob}
      />
    </>
  );
}
