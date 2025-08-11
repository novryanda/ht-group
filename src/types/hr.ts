// HR module type definitions

export interface Employee extends Record<string, unknown> {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";
  workType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  lastAttendance?: string;
  attendanceRate: number;
  location: string;
}

export interface AttendanceRecord extends Record<string, unknown> {
  id: string;
  employeeId: string;
  employeeName: string;
  name: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours: number;
  status: "PRESENT" | "LATE" | "ABSENT" | "SICK_LEAVE" | "ANNUAL_LEAVE" | "EMERGENCY_LEAVE";
  overtime?: number;
  notes?: string;
}

export interface PayrollRecord extends Record<string, unknown> {
  id: string;
  employeeId: string;
  employeeName: string;
  name: string;
  period: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  overtimeHours: number;
  grossSalary: number;
  tax: number;
  deductions: number;
  netSalary: number;
  status: "DRAFT" | "APPROVED" | "PAID" | "CANCELLED";
  payDate?: string;
  workDays: number;
}
