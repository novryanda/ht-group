"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign
} from "lucide-react";
import type { Employee } from "~/types/hr";

interface EmployeeListProps {
  companyId: string;
}

// Mock employee data for different companies
const mockEmployees: Record<string, Employee[]> = {
  "PT_NILO": [
    {
      id: "EMP-NILO-001",
      employeeId: "NILO001",
      name: "Ahmad Rizki Pratama",
      email: "ahmad.rizki@ptnilo.com",
      phone: "081234567890",
      position: "Senior HVAC Technician",
      department: "Technical Operations",
      status: "ACTIVE",
      hireDate: "2022-03-15",
      salary: 8500000,
      location: "Jakarta",
      supervisor: "Budi Santoso",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 95,
    },
    {
      id: "EMP-NILO-002", 
      employeeId: "NILO002",
      name: "Siti Nurhaliza",
      email: "siti.nurhaliza@ptnilo.com",
      phone: "081234567891",
      position: "Project Manager",
      department: "Project Management",
      status: "ACTIVE",
      hireDate: "2021-08-20",
      salary: 12000000,
      location: "Jakarta",
      supervisor: "Direktur Operasional",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 98,
    },
    {
      id: "EMP-NILO-003",
      employeeId: "NILO003", 
      name: "Dedi Kurniawan",
      email: "dedi.kurniawan@ptnilo.com",
      phone: "081234567892",
      position: "HVAC Technician",
      department: "Technical Operations",
      status: "ACTIVE",
      hireDate: "2023-01-10",
      salary: 6500000,
      location: "Jakarta",
      supervisor: "Ahmad Rizki Pratama",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 92,
    },
    {
      id: "EMP-NILO-004",
      employeeId: "NILO004",
      name: "Maya Sari Dewi",
      email: "maya.sari@ptnilo.com", 
      phone: "081234567893",
      position: "HR Specialist",
      department: "Human Resources",
      status: "ACTIVE",
      hireDate: "2022-11-05",
      salary: 7500000,
      location: "Jakarta",
      supervisor: "Head of HR",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 97,
    },
    {
      id: "EMP-NILO-005",
      employeeId: "NILO005",
      name: "Eko Prasetyo",
      email: "eko.prasetyo@ptnilo.com",
      phone: "081234567894", 
      position: "Finance Officer",
      department: "Finance",
      status: "ON_LEAVE",
      hireDate: "2021-05-12",
      salary: 8000000,
      location: "Jakarta",
      supervisor: "Finance Manager",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-10",
      attendanceRate: 89,
    },
  ],
  "PT_ZTA": [
    {
      id: "EMP-ZTA-001",
      employeeId: "ZTA001",
      name: "Bambang Wijaya",
      email: "bambang.wijaya@ptzta.com",
      phone: "081234567895",
      position: "Senior HVAC Engineer",
      department: "Engineering",
      status: "ACTIVE", 
      hireDate: "2020-02-15",
      salary: 9500000,
      location: "Surabaya",
      supervisor: "Engineering Manager",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 96,
    },
    {
      id: "EMP-ZTA-002",
      employeeId: "ZTA002",
      name: "Indira Sari",
      email: "indira.sari@ptzta.com",
      phone: "081234567896",
      position: "HR Manager",
      department: "Human Resources",
      status: "ACTIVE",
      hireDate: "2019-09-10",
      salary: 11000000,
      location: "Surabaya",
      supervisor: "General Manager",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 99,
    },
  ],
  "PT_TAM": [
    {
      id: "EMP-TAM-001",
      employeeId: "TAM001",
      name: "Joko Susilo",
      email: "joko.susilo@pttam.com",
      phone: "081234567897",
      position: "Landscaping Supervisor",
      department: "Operations",
      status: "ACTIVE",
      hireDate: "2021-06-20",
      salary: 7000000,
      location: "Bandung",
      supervisor: "Operations Manager",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 94,
    },
  ],
  "PT_HTK": [
    {
      id: "EMP-HTK-001",
      employeeId: "HTK001",
      name: "Rini Astuti",
      email: "rini.astuti@pthtk.com",
      phone: "081234567898",
      position: "Finance Manager",
      department: "Finance",
      status: "ACTIVE",
      hireDate: "2020-12-01",
      salary: 10500000,
      location: "Medan",
      supervisor: "General Manager",
      workType: "FULL_TIME",
      lastAttendance: "2024-01-15",
      attendanceRate: 98,
    },
  ],
};

const statusColors = {
  ACTIVE: "success",
  ON_LEAVE: "warning", 
  INACTIVE: "secondary",
  TERMINATED: "destructive",
} as const;

export function EmployeeList({ companyId }: EmployeeListProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const employees = mockEmployees[companyId as keyof typeof mockEmployees] || [];

  const handleView = (employee: any) => {
    setSelectedEmployee(employee);
    setShowDetail(true);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (employee: any) => {
    console.log("Delete employee:", employee.employeeId);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<Employee>[] = [
    {
      key: "name",
      label: "Employee",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(value as string).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
      key: "position",
      label: "Position & Department",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {row.department}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={statusColors[value as keyof typeof statusColors]}>
          {(value as string).replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "salary",
      label: "Salary",
      sortable: true,
      render: (value) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(value as number)}</div>
        </div>
      ),
    },
    {
      key: "attendanceRate",
      label: "Attendance",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as number}%</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {row.lastAttendance ?? "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Contact & Location",
      render: (value, row) => (
        <div>
          <div className="text-sm flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {row.email}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {value as string}
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
        { value: "ACTIVE", label: "Active" },
        { value: "ON_LEAVE", label: "On Leave" },
        { value: "INACTIVE", label: "Inactive" },
        { value: "TERMINATED", label: "Terminated" },
      ],
    },
    {
      key: "department" as const,
      label: "Department",
      options: [
        { value: "Technical Operations", label: "Technical Operations" },
        { value: "Project Management", label: "Project Management" },
        { value: "Human Resources", label: "Human Resources" },
        { value: "Finance", label: "Finance" },
        { value: "Engineering", label: "Engineering" },
        { value: "Operations", label: "Operations" },
      ],
    },
    {
      key: "workType" as const,
      label: "Work Type",
      options: [
        { value: "FULL_TIME", label: "Full Time" },
        { value: "PART_TIME", label: "Part Time" },
        { value: "CONTRACT", label: "Contract" },
        { value: "INTERN", label: "Intern" },
      ],
    },
  ];

  return (
    <DataTable
      data={employees}
      columns={columns}
      title="Employee Management"
      searchPlaceholder="Search employee name, ID, position, or email..."
      onAdd={handleAdd}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonText="Add Employee"
      filters={filters}
    />
  );
}
