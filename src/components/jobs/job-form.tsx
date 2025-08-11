"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

interface JobFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: any;
  onSubmit: (data: any) => void;
}

export function JobForm({ open, onOpenChange, job, onSubmit }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    description: job?.description || "",
    type: job?.type || "",
    customerName: job?.customerName || "",
    contractValue: job?.contractValue || "",
    estimatedCost: job?.estimatedCost || "",
    startDate: job?.startDate ? new Date(job.startDate) : undefined,
    endDate: job?.endDate ? new Date(job.endDate) : undefined,
    projectManagerId: job?.projectManagerId || "",
    priority: job?.priority || "MEDIUM",
  });

  const [startDate, setStartDate] = useState<Date | undefined>(formData.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(formData.endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate,
      endDate,
      contractValue: parseFloat(formData.contractValue) || 0,
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {job ? "Edit Job Order" : "Create New Job Order"}
          </DialogTitle>
          <DialogDescription>
            {job 
              ? "Update the job order details below."
              : "Fill in the details to create a new job order."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter job title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FABRICATION">Fabrication</SelectItem>
                  <SelectItem value="EFFLUENT_TREATMENT">Effluent Treatment</SelectItem>
                  <SelectItem value="CUTTING_GRASS">Cutting Grass</SelectItem>
                  <SelectItem value="MAINTENANCE_PROJECT">Maintenance Project</SelectItem>
                  <SelectItem value="INSTALLATION">Installation</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractValue">Contract Value (IDR)</Label>
              <Input
                id="contractValue"
                type="number"
                value={formData.contractValue}
                onChange={(e) => handleInputChange("contractValue", e.target.value)}
                placeholder="Enter contract value"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (IDR)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange("estimatedCost", e.target.value)}
                placeholder="Enter estimated cost"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectManager">Project Manager</Label>
            <Select value={formData.projectManagerId} onValueChange={(value) => handleInputChange("projectManagerId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm-001">Budi Santoso (Senior PM)</SelectItem>
                <SelectItem value="pm-002">Siti Nurhaliza (Project Manager)</SelectItem>
                <SelectItem value="pm-003">Dedi Kurniawan (Project Manager)</SelectItem>
                <SelectItem value="pm-004">Maya Sari (Junior PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter job description and requirements"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {job ? "Update Job Order" : "Create Job Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
