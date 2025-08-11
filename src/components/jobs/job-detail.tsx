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
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  AlertTriangle,
  Package,
  Users,
  TrendingUp,
  Target,
} from "lucide-react";

interface JobDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: any;
}

export function JobDetail({ open, onOpenChange, job }: JobDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!job) return null;

  const statusColors = {
    OPEN: "secondary",
    IN_PROGRESS: "default",
    FOR_BILLING: "warning",
    BILLED: "info",
    CLOSED: "outline",
    CANCELLED: "destructive",
  } as const;

  // Mock project milestones
  const milestones = [
    { id: 1, name: "Project Kickoff", date: "2024-01-10", completed: true, description: "Initial project setup and team assignment" },
    { id: 2, name: "Design Phase", date: "2024-01-20", completed: true, description: "Complete design and engineering drawings" },
    { id: 3, name: "Material Procurement", date: "2024-01-25", completed: true, description: "Purchase all required materials and equipment" },
    { id: 4, name: "Fabrication Start", date: "2024-02-01", completed: false, description: "Begin fabrication process" },
    { id: 5, name: "Quality Testing", date: "2024-02-10", completed: false, description: "Quality control and testing phase" },
    { id: 6, name: "Delivery & Installation", date: "2024-02-15", completed: false, description: "Final delivery and installation" },
  ];

  // Mock team members
  const teamMembers = [
    { id: 1, name: "Budi Santoso", role: "Project Manager", avatar: "", hours: 40 },
    { id: 2, name: "Ahmad Rizki", role: "Lead Fabricator", avatar: "", hours: 120 },
    { id: 3, name: "Dedi Kurniawan", role: "Welder", avatar: "", hours: 80 },
    { id: 4, name: "Eko Prasetyo", role: "Quality Inspector", avatar: "", hours: 20 },
  ];

  // Mock materials
  const materials = [
    { id: 1, name: "Steel Plate 10mm", quantity: 50, unit: "sheet", unitCost: 500000, totalCost: 25000000 },
    { id: 2, name: "Welding Rod E7018", quantity: 100, unit: "kg", unitCost: 25000, totalCost: 2500000 },
    { id: 3, name: "Paint Primer", quantity: 20, unit: "liter", unitCost: 75000, totalCost: 1500000 },
    { id: 4, name: "Bolts & Fasteners", quantity: 1, unit: "set", unitCost: 2000000, totalCost: 2000000 },
  ];

  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPercentage = (completedMilestones / milestones.length) * 100;
  const totalMaterialCost = materials.reduce((sum, material) => sum + material.totalCost, 0);
  const totalHours = teamMembers.reduce((sum, member) => sum + member.hours, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {job.jobNumber} - {job.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[job.status as keyof typeof statusColors]}>
                {job.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline">
                {job.progress}% Complete
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Job Number:</span>
                    <span className="text-sm font-medium">{job.jobNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm">{job.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Customer:</span>
                    <span className="text-sm">{job.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm">{job.createdAt}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="text-sm">{job.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">End Date:</span>
                    <span className="text-sm">{job.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="text-sm">36 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Days Remaining:</span>
                    <span className="text-sm font-medium">12 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Milestones</span>
                      <span>{completedMilestones}/{milestones.length}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {job.description || "Comprehensive fabrication project including design, material procurement, manufacturing, quality testing, and installation. The project involves creating custom steel structures according to client specifications with strict quality control measures."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Project Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          milestone.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {milestone.completed && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        {index < milestones.length - 1 && (
                          <div className={`w-0.5 h-8 ${
                            milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            milestone.completed ? 'text-green-700' : ''
                          }`}>
                            {milestone.name}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {milestone.date}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.hours}h</p>
                        <p className="text-xs text-muted-foreground">Total Hours</p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Team Hours:</span>
                    <span>{totalHours} hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Materials & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.quantity} {material.unit} × {formatCurrency(material.unitCost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(material.totalCost)}</p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Material Cost:</span>
                    <span>{formatCurrency(totalMaterialCost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contract Value:</span>
                    <span className="text-sm font-medium">{formatCurrency(job.contractValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                    <span className="text-sm">{formatCurrency(job.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual Cost:</span>
                    <span className="text-sm font-medium">{formatCurrency(job.actualCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Profit:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(job.contractValue - job.actualCost)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Materials:</span>
                    <span className="text-sm">{formatCurrency(totalMaterialCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Labor (260h):</span>
                    <span className="text-sm">{formatCurrency(totalHours * 50000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Overhead:</span>
                    <span className="text-sm">{formatCurrency(5000000)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Cost:</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(totalMaterialCost + (totalHours * 50000) + 5000000)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Edit Job Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
