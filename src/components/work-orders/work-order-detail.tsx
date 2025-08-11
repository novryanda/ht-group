"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  FileText,
  CheckCircle,
  AlertTriangle,
  Settings,
  Package,
} from "lucide-react";

interface WorkOrderDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: any;
}

export function WorkOrderDetail({ open, onOpenChange, workOrder }: WorkOrderDetailProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!workOrder) return null;

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

  // Mock checklist data
  const checklist = [
    { id: 1, item: "Check air filter condition", completed: true, notes: "Filter replaced" },
    { id: 2, item: "Inspect refrigerant levels", completed: true, notes: "Levels normal" },
    { id: 3, item: "Clean condenser coils", completed: false, notes: "" },
    { id: 4, item: "Check electrical connections", completed: false, notes: "" },
    { id: 5, item: "Test thermostat operation", completed: false, notes: "" },
  ];

  // Mock parts data
  const parts = [
    { id: 1, partCode: "FILTER-001", name: "Air Filter Standard", quantity: 2, unitPrice: 50000, total: 100000 },
    { id: 2, partCode: "COOLANT-001", name: "Refrigerant R410A", quantity: 1, unitPrice: 150000, total: 150000 },
  ];

  // Mock timesheet data
  const timesheet = [
    { id: 1, date: "2024-01-15", technician: "Ahmad Rizki", startTime: "08:00", endTime: "12:00", hours: 4, description: "Initial inspection and filter replacement" },
    { id: 2, date: "2024-01-16", technician: "Ahmad Rizki", startTime: "09:00", endTime: "11:30", hours: 2.5, description: "Refrigerant level check and coil cleaning preparation" },
  ];

  const completedItems = checklist.filter(item => item.completed).length;
  const progressPercentage = (completedItems / checklist.length) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {workOrder.woNumber} - {workOrder.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[workOrder.status as keyof typeof statusColors]}>
                {workOrder.status.replace("_", " ")}
              </Badge>
              <Badge variant={priorityColors[workOrder.priority as keyof typeof priorityColors]}>
                {workOrder.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Work Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">WO Number:</span>
                    <span className="text-sm font-medium">{workOrder.woNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm">{workOrder.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Asset:</span>
                    <span className="text-sm">{workOrder.assetCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm">{workOrder.createdAt}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignment & Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assigned To:</span>
                    <span className="text-sm font-medium">{workOrder.assignedTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scheduled Date:</span>
                    <span className="text-sm">{workOrder.scheduledDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Hours:</span>
                    <span className="text-sm">4.0 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual Hours:</span>
                    <span className="text-sm font-medium">6.5 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Routine preventive maintenance for AC Rittal Unit 1. Includes filter replacement, 
                  refrigerant level check, condenser coil cleaning, electrical connection inspection, 
                  and thermostat operation testing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Maintenance Checklist
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {completedItems} of {checklist.length} completed
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 border rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.item}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Notes: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Parts & Materials Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{part.name}</p>
                        <p className="text-xs text-muted-foreground">Code: {part.partCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Qty: {part.quantity}</p>
                        <p className="text-sm font-medium">{formatCurrency(part.total)}</p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Parts Cost:</span>
                    <span>{formatCurrency(parts.reduce((sum, part) => sum + part.total, 0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timesheet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timesheet.map((entry) => (
                    <div key={entry.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.hours} hours</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {entry.technician} • {entry.startTime} - {entry.endTime}
                      </p>
                      <p className="text-sm">{entry.description}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Hours:</span>
                    <span>{timesheet.reduce((sum, entry) => sum + entry.hours, 0)} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Edit Work Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
