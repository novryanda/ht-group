"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RefreshCw } from "lucide-react";

interface FiltersBarProps {
  fromDate: string;
  toDate: string;
  shift: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onShiftChange: (shift: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function FiltersBar({
  fromDate,
  toDate,
  shift,
  onFromDateChange,
  onToDateChange,
  onShiftChange,
  onRefresh,
  isLoading,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* From Date */}
        <div className="space-y-2">
          <Label htmlFor="from-date">Dari Tanggal</Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <Label htmlFor="to-date">Sampai Tanggal</Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Shift Select */}
        <div className="space-y-2">
          <Label htmlFor="shift">Shift</Label>
          <Select value={shift} onValueChange={onShiftChange} disabled={isLoading}>
            <SelectTrigger id="shift">
              <SelectValue placeholder="Pilih shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Shift</SelectItem>
              <SelectItem value="1">Shift 1</SelectItem>
              <SelectItem value="2">Shift 2</SelectItem>
              <SelectItem value="3">Shift 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Button */}
        <div className="space-y-2">
          <Label className="invisible">Aksi</Label>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
