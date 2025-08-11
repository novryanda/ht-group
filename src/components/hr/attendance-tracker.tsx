"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { DataTable, type Column } from "~/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import type { AttendanceRecord } from "~/types/hr";

interface AttendanceTrackerProps {
  companyId: string;
}

// Mock attendance data
const mockAttendanceData: Record<string, AttendanceRecord[]> = {
  "PT_NILO": [
    {
      id: "ATT-001",
      employeeId: "NILO001",
      employeeName: "Ahmad Rizki Pratama",
      name: "Ahmad Rizki Pratama",
      date: "2024-01-15",
      checkIn: "08:00",
      checkOut: "17:00",
      workHours: 8.0,
      status: "PRESENT",
      overtime: 0,
      notes: "",
    },
    {
      id: "ATT-002",
      employeeId: "NILO002",
      employeeName: "Siti Nurhaliza",
      name: "Siti Nurhaliza",
      date: "2024-01-15",
      checkIn: "08:15",
      checkOut: "17:30",
      workHours: 8.25,
      status: "LATE",
      overtime: 0.5,
      notes: "Traffic jam",
    },
    {
      id: "ATT-003",
      employeeId: "NILO003",
      employeeName: "Dedi Kurniawan",
      name: "Dedi Kurniawan",
      date: "2024-01-15",
      checkIn: "08:00",
      checkOut: "19:00",
      workHours: 10.0,
      status: "PRESENT",
      overtime: 2.0,
      notes: "Project deadline",
    },
    {
      id: "ATT-004",
      employeeId: "NILO004",
      employeeName: "Maya Sari Dewi",
      name: "Maya Sari Dewi",
      date: "2024-01-15",
      checkIn: "-",
      checkOut: "-",
      workHours: 0,
      status: "SICK_LEAVE",
      overtime: 0,
      notes: "Medical certificate provided",
    },
    {
      id: "ATT-005",
      employeeId: "NILO005",
      employeeName: "Eko Prasetyo",
      name: "Eko Prasetyo",
      date: "2024-01-15",
      checkIn: "-",
      checkOut: "-",
      workHours: 0,
      status: "ANNUAL_LEAVE",
      overtime: 0,
      notes: "Approved vacation",
    },
  ],
  "PT_ZTA": [
    {
      id: "ATT-ZTA-001",
      employeeId: "ZTA001",
      employeeName: "Bambang Wijaya",
      name: "Bambang Wijaya",
      date: "2024-01-15",
      checkIn: "07:45",
      checkOut: "16:45",
      workHours: 8.0,
      status: "PRESENT",
      overtime: 0,
      notes: "",
    },
    {
      id: "ATT-ZTA-002",
      employeeId: "ZTA002",
      employeeName: "Indira Sari",
      name: "Indira Sari",
      date: "2024-01-15",
      checkIn: "08:00",
      checkOut: "17:00",
      workHours: 8.0,
      status: "PRESENT",
      overtime: 0,
      notes: "",
    },
  ],
  "PT_TAM": [
    {
      id: "ATT-TAM-001",
      employeeId: "TAM001",
      employeeName: "Joko Susilo",
      name: "Joko Susilo",
      date: "2024-01-15",
      checkIn: "06:00",
      checkOut: "14:00",
      workHours: 8.0,
      status: "PRESENT",
      overtime: 0,
      notes: "Early shift for landscaping",
    },
  ],
  "PT_HTK": [
    {
      id: "ATT-HTK-001",
      employeeId: "HTK001",
      employeeName: "Rini Astuti",
      name: "Rini Astuti",
      date: "2024-01-15",
      checkIn: "08:30",
      checkOut: "17:30",
      workHours: 8.0,
      status: "LATE",
      overtime: 0,
      notes: "Client meeting",
    },
  ],
};

const statusColors = {
  PRESENT: "success",
  LATE: "warning",
  ABSENT: "destructive", 
  SICK_LEAVE: "secondary",
  ANNUAL_LEAVE: "outline",
  EMERGENCY_LEAVE: "warning",
} as const;

export function AttendanceTracker({ companyId }: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  
  const attendanceData = mockAttendanceData[companyId as keyof typeof mockAttendanceData] || [];

  // Calculate summary statistics
  const totalEmployees = attendanceData.length;
  const presentCount = attendanceData.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
  const absentCount = attendanceData.filter(a => a.status === "ABSENT").length;
  const leaveCount = attendanceData.filter(a => a.status.includes("LEAVE")).length;
  const lateCount = attendanceData.filter(a => a.status === "LATE").length;
  const totalOvertimeHours = attendanceData.reduce((sum, a) => sum + (a.overtime ?? 0), 0);

  const columns: Column<AttendanceRecord>[] = [
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
      key: "checkIn",
      label: "Check In/Out",
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-green-500" />
            <span className="text-sm">{(value as string) ?? "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-red-500" />
            <span className="text-sm">{row.checkOut ?? "-"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "workHours",
      label: "Work Hours",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value as number}h</div>
          {(row.overtime ?? 0) > 0 && (
            <div className="text-sm text-orange-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{row.overtime}h OT
            </div>
          )}
        </div>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {(value as string) ?? "-"}
        </span>
      ),
    },
  ];

  const filters = [
    {
      key: "status" as const,
      label: "Status",
      options: [
        { value: "PRESENT", label: "Present" },
        { value: "LATE", label: "Late" },
        { value: "ABSENT", label: "Absent" },
        { value: "SICK_LEAVE", label: "Sick Leave" },
        { value: "ANNUAL_LEAVE", label: "Annual Leave" },
        { value: "EMERGENCY_LEAVE", label: "Emergency Leave" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {((presentCount / totalEmployees) * 100).toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateCount}</div>
            <p className="text-xs text-muted-foreground">
              {((lateCount / totalEmployees) * 100).toFixed(1)}% late rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveCount}</div>
            <p className="text-xs text-muted-foreground">
              Various leave types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOvertimeHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total overtime today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <DataTable
        data={attendanceData}
        columns={columns}
        title={`Daily Attendance - ${selectedDate}`}
        searchPlaceholder="Search employee name or ID..."
        filters={filters}
        addButtonText="Mark Attendance"
      />
    </div>
  );
}
