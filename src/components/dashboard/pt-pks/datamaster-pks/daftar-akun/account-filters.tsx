"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import { useState } from "react";

interface AccountFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    classes?: string[];
    status?: "AKTIF" | "NONAKTIF";
  }) => void;
  onViewToggle: (isTree: boolean) => void;
  isTreeView: boolean;
}

const ACCOUNT_CLASSES = [
  { value: "ASSET", label: "Asset" },
  { value: "LIABILITY", label: "Liability" },
  { value: "EQUITY", label: "Equity" },
  { value: "REVENUE", label: "Revenue" },
  { value: "COGS", label: "COGS" },
  { value: "EXPENSE", label: "Expense" },
  { value: "OTHER_INCOME", label: "Other Income" },
  { value: "OTHER_EXPENSE", label: "Other Expense" },
];

export function AccountFilters({ onFilterChange, onViewToggle, isTreeView }: AccountFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [status, setStatus] = useState<"AKTIF" | "NONAKTIF" | undefined>(undefined);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, classes: selectedClasses, status });
  };

  const handleClassToggle = (classValue: string) => {
    const newClasses = selectedClasses.includes(classValue)
      ? selectedClasses.filter((c) => c !== classValue)
      : [...selectedClasses, classValue];
    setSelectedClasses(newClasses);
    onFilterChange({ search, classes: newClasses, status });
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? undefined : (value as "AKTIF" | "NONAKTIF");
    setStatus(newStatus);
    onFilterChange({ search, classes: selectedClasses, status: newStatus });
  };

  const handleReset = () => {
    setSearch("");
    setSelectedClasses([]);
    setStatus(undefined);
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={status ?? "all"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AKTIF">Active</SelectItem>
            <SelectItem value="NONAKTIF">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={isTreeView ? "default" : "outline"}
            size="sm"
            onClick={() => onViewToggle(true)}
          >
            Tree View
          </Button>
          <Button
            variant={!isTreeView ? "default" : "outline"}
            size="sm"
            onClick={() => onViewToggle(false)}
          >
            List View
          </Button>
        </div>

        {(search || selectedClasses.length > 0 || status) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Class:</span>
        </div>
        {ACCOUNT_CLASSES.map((cls) => (
          <Badge
            key={cls.value}
            variant={selectedClasses.includes(cls.value) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleClassToggle(cls.value)}
          >
            {cls.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
