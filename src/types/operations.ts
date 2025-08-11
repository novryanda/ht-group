// Operations module type definitions

export interface WorkOrder extends Record<string, unknown> {
  id: string;
  woNumber: string;
  title: string;
  assetCode: string;
  type: "PREVENTIVE_MAINTENANCE" | "CORRECTIVE_MAINTENANCE" | "INSPECTION" | "REPAIR" | "INSTALLATION" | "UPGRADE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "DRAFT" | "IN_PROGRESS" | "WAITING_REVIEW" | "APPROVED" | "BILLED" | "CLOSED" | "CANCELLED";
  assignedTo: string;
  scheduledDate: string;
  createdAt: string;
  estimatedHours: number;
  actualHours: number;
  description: string;
}

export interface JobOrder extends Record<string, unknown> {
  id: string;
  jobNumber: string;
  title: string;
  type: "FABRICATION" | "EFFLUENT_TREATMENT" | "CUTTING_GRASS" | "HVAC_SERVICES" | "MAINTENANCE" | "INSTALLATION";
  status: "OPEN" | "IN_PROGRESS" | "FOR_BILLING" | "CLOSED" | "CANCELLED";
  customerName: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  actualCost: number;
  contractValue: number;
  progress: number;
  createdAt: string;
  projectManager: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  description: string;
}
