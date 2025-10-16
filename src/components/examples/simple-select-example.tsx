"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toSafeSelectOptions } from "~/lib/select-utils";

interface Option {
  id: string | number | null;
  name: string;
}

interface SimpleSelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

/**
 * ✅ CORRECT: Simple controlled Select without React Hook Form
 * 
 * Key points:
 * 1. Use toSafeSelectOptions to filter out invalid values
 * 2. Placeholder in SelectValue, NOT as SelectItem
 * 3. value state can be undefined (no selection)
 * 4. All SelectItem values are guaranteed non-empty strings
 */
export function SimpleSelectExample({ 
  options, 
  placeholder = "Pilih opsi",
  onChange 
}: SimpleSelectProps) {
  const [value, setValue] = useState<string | undefined>(undefined);

  // ✅ Convert and filter options to ensure all values are non-empty strings
  const safeOptions = toSafeSelectOptions(options, (item) => ({
    value: item.id,
    label: item.name,
  }));

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        {/* ✅ CORRECT: Placeholder in SelectValue */}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {safeOptions.length === 0 ? (
          // ✅ CORRECT: Show message when no options, but DON'T render SelectItem
          <div className="py-2 px-3 text-sm text-muted-foreground">
            Tidak ada opsi tersedia
          </div>
        ) : (
          safeOptions.map((option) => (
            // ✅ CORRECT: All values are guaranteed non-empty strings
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

/**
 * ❌ WRONG EXAMPLES - DO NOT USE!
 */

// ❌ WRONG: Placeholder as SelectItem with empty value
export function WrongSelectWithPlaceholderItem() {
  return (
    <Select>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {/* ❌ This will cause error! */}
        <SelectItem value="">Pilih opsi</SelectItem>
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ❌ WRONG: No filtering of empty values
export function WrongSelectNoFiltering({ options }: { options: Option[] }) {
  return (
    <Select>
      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          // ❌ opt.id might be null or empty string!
          <SelectItem key={opt.id} value={String(opt.id)}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ❌ WRONG: Using empty string as default value
export function WrongSelectEmptyDefault() {
  const [value, setValue] = useState(""); // ❌ Should be undefined!
  
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectContent>
    </Select>
  );
}

