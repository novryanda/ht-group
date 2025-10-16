"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";

/**
 * ✅ CORRECT: Zod schema for required enum field
 * 
 * Key points:
 * 1. Use z.enum() for strict type safety
 * 2. Provide custom error message
 * 3. NO .transform() that could produce empty string
 */
const familyFormSchema = z.object({
  relation: z.enum(["ISTRI", "ANAK"], {
    required_error: "Hubungan keluarga wajib dipilih",
    invalid_type_error: "Hubungan keluarga tidak valid",
  }),
  name: z.string().min(1, "Nama wajib diisi"),
});

type FamilyFormValues = z.infer<typeof familyFormSchema>;

/**
 * ✅ CORRECT: Enum options with proper labels
 */
const FAMILY_RELATION_OPTIONS = [
  { value: "ISTRI", label: "Istri" },
  { value: "ANAK", label: "Anak" },
] as const;

/**
 * ✅ CORRECT: React Hook Form + Zod + Select (Required Field)
 * 
 * Key points:
 * 1. defaultValues uses undefined for required enum (NOT empty string!)
 * 2. Use Controller for Select integration
 * 3. Placeholder in SelectValue
 * 4. All SelectItem values are non-empty strings
 * 5. Form validation shows error when not selected
 */
export function RHFSelectRequiredExample() {
  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      // ✅ CORRECT: undefined for required field, NOT ""
      relation: undefined as unknown as "ISTRI" | "ANAK",
      name: "",
    },
  });

  const onSubmit = (data: FamilyFormValues) => {
    console.log("Form submitted:", data);
    // Call API here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name field (text input) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Masukkan nama"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ✅ CORRECT: Select with Controller */}
        <FormField
          control={form.control}
          name="relation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Hubungan Keluarga <span className="text-red-500">*</span>
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    {/* ✅ CORRECT: Placeholder in SelectValue */}
                    <SelectValue placeholder="Pilih hubungan keluarga" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FAMILY_RELATION_OPTIONS.map((option) => (
                    // ✅ CORRECT: All values are non-empty strings
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Simpan</Button>
      </form>
    </Form>
  );
}

/**
 * ❌ WRONG EXAMPLES - DO NOT USE!
 */

// ❌ WRONG: Using empty string as defaultValue for required field
const wrongSchema = z.object({
  relation: z.enum(["ISTRI", "ANAK"]),
});

type WrongFormValues = z.infer<typeof wrongSchema>;

export function WrongRHFSelectEmptyDefault() {
  const form = useForm<WrongFormValues>({
    resolver: zodResolver(wrongSchema),
    defaultValues: {
      relation: "" as unknown as "ISTRI" | "ANAK", // ❌ This will cause issues!
    },
  });

  return null; // Example only
}

// ❌ WRONG: Transform that could produce empty string
const wrongSchemaWithTransform = z.object({
  relation: z
    .string()
    .transform((v) => v || ""), // ❌ Could produce empty string!
});

// ❌ WRONG: Placeholder as SelectItem
export function WrongRHFSelectPlaceholderItem() {
  const form = useForm({
    resolver: zodResolver(familyFormSchema),
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="relation"
        render={({ field }) => (
          <FormItem>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {/* ❌ This will cause error! */}
                <SelectItem value="">Pilih hubungan</SelectItem>
                <SelectItem value="ISTRI">Istri</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </Form>
  );
}

