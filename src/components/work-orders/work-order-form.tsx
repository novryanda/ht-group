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

interface WorkOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: any;
  onSubmit: (data: any) => void;
}

export function WorkOrderForm({ open, onOpenChange, workOrder, onSubmit }: WorkOrderFormProps) {
  const [formData, setFormData] = useState({
    title: workOrder?.title || "",
    description: workOrder?.description || "",
    type: workOrder?.type || "",
    priority: workOrder?.priority || "",
    assetId: workOrder?.assetId || "",
    assignedToId: workOrder?.assignedToId || "",
    scheduledDate: workOrder?.scheduledDate ? new Date(workOrder.scheduledDate) : undefined,
    estimatedHours: workOrder?.estimatedHours || "",
  });

  const [date, setDate] = useState<Date | undefined>(formData.scheduledDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      scheduledDate: date,
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {workOrder ? "Edit Work Order" : "Create New Work Order"}
          </DialogTitle>
          <DialogDescription>
            {workOrder 
              ? "Update the work order details below."
              : "Fill in the details to create a new work order."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter work order title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREVENTIVE_MAINTENANCE">Preventive Maintenance</SelectItem>
                  <SelectItem value="CORRECTIVE_MAINTENANCE">Corrective Maintenance</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                  <SelectItem value="REPAIR">Repair</SelectItem>
                  <SelectItem value="INSTALLATION">Installation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="asset">Asset</Label>
              <Select value={formData.assetId} onValueChange={(value) => handleInputChange("assetId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC-RTL-001">AC Rittal Unit 1 (AC-RTL-001)</SelectItem>
                  <SelectItem value="AC-RTL-002">AC Rittal Unit 2 (AC-RTL-002)</SelectItem>
                  <SelectItem value="AC-RTL-003">AC Rittal Unit 3 (AC-RTL-003)</SelectItem>
                  <SelectItem value="AC-SPL-001">AC Split Unit 1 (AC-SPL-001)</SelectItem>
                  <SelectItem value="AC-SPL-002">AC Split Unit 2 (AC-SPL-002)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={formData.assignedToId} onValueChange={(value) => handleInputChange("assignedToId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech-001">Ahmad Rizki (Technician)</SelectItem>
                  <SelectItem value="tech-002">Budi Santoso (Senior Technician)</SelectItem>
                  <SelectItem value="tech-003">Dedi Kurniawan (Technician)</SelectItem>
                  <SelectItem value="tech-004">Eko Prasetyo (Technician)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
              placeholder="Enter estimated hours"
              min="0"
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter work order description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {workOrder ? "Update Work Order" : "Create Work Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
