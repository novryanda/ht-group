"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FamilyRelation } from "@prisma/client";
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
import { createEnumOptions, normalizeEmptyStrings } from "~/lib/select-utils";

/**
 * ✅ CORRECT: Zod schema with optional enum field
 * 
 * Key points:
 * 1. Use .optional() for optional fields
 * 2. Empty string from UI will be normalized to undefined in API controller
 * 3. NO .transform() that produces empty string
 */
const employeeFormSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  
  // ✅ CORRECT: Optional enum - can be undefined
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  
  // ✅ CORRECT: Optional string - can be undefined
  devisi: z.string().optional(),
  
  // ✅ CORRECT: Optional number - can be undefined
  umur: z.coerce.number().int().min(0).max(150).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

/**
 * ✅ CORRECT: Create enum options from Prisma enum
 */
const GENDER_OPTIONS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
] as const;

/**
 * ✅ CORRECT: Async data type
 */
interface Division {
  id: string;
  name: string;
}

/**
 * ✅ CORRECT: React Hook Form + Optional Fields + Async Data
 * 
 * Key points:
 * 1. Optional fields use undefined as defaultValue (NOT empty string)
 * 2. Loading state disables Select or shows skeleton
 * 3. Empty options array doesn't render SelectItems
 * 4. All SelectItem values are non-empty strings
 */
export function RHFSelectOptionalAsyncExample() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(true);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      nama: "",
      // ✅ CORRECT: Optional fields use undefined, NOT ""
      jenis_kelamin: undefined,
      devisi: undefined,
      umur: undefined,
    },
  });

  // Simulate async data fetch
  useEffect(() => {
    const fetchDivisions = async () => {
      setIsLoadingDivisions(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDivisions([
          { id: "div-1", name: "IT" },
          { id: "div-2", name: "HR" },
          { id: "div-3", name: "Finance" },
        ]);
      } catch (error) {
        console.error("Failed to fetch divisions:", error);
      } finally {
        setIsLoadingDivisions(false);
      }
    };

    fetchDivisions();
  }, []);

  const onSubmit = (data: EmployeeFormValues) => {
    console.log("Form submitted:", data);
    // In API controller, normalize empty strings to undefined
    // const normalized = normalizeEmptyStrings(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name field (required) */}
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nama <span className="text-red-500">*</span>
              </FormLabel>
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

        {/* ✅ CORRECT: Optional enum select (static data) */}
        <FormField
          control={form.control}
          name="jenis_kelamin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Kelamin (Opsional)</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
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

        {/* ✅ CORRECT: Optional select with async data */}
        <FormField
          control={form.control}
          name="devisi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Divisi (Opsional)</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                // ✅ CORRECT: Disable while loading
                disabled={isLoadingDivisions}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingDivisions
                          ? "Memuat divisi..."
                          : "Pilih divisi"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* ✅ CORRECT: Show message when loading or empty */}
                  {isLoadingDivisions ? (
                    <div className="py-2 px-3 text-sm text-muted-foreground">
                      Memuat data...
                    </div>
                  ) : divisions.length === 0 ? (
                    <div className="py-2 px-3 text-sm text-muted-foreground">
                      Tidak ada divisi tersedia
                    </div>
                  ) : (
                    // ✅ CORRECT: Only render SelectItems when data is available
                    divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoadingDivisions}>
          Simpan
        </Button>
      </form>
    </Form>
  );
}

/**
 * ✅ CORRECT: API Controller pattern for normalizing empty strings
 * 
 * Use this in your API route handlers (Tier-2)
 */
export async function exampleAPIController(req: Request) {
  const rawData = await req.json();
  
  // ✅ CORRECT: Normalize empty strings to undefined BEFORE Zod validation
  const normalizedData = normalizeEmptyStrings(rawData);
  
  const parsed = employeeFormSchema.safeParse(normalizedData);
  
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  
  // Now parsed.data has proper undefined for optional fields
  // NOT empty strings
  console.log(parsed.data);
  
  return Response.json({ success: true });
}

/**
 * ❌ WRONG EXAMPLES - DO NOT USE!
 */

// ❌ WRONG: Using empty string for optional field
export function WrongOptionalFieldEmptyString() {
  const form = useForm({
    defaultValues: {
      jenis_kelamin: "", // ❌ Should be undefined!
    },
  });
  return null;
}

// ❌ WRONG: Rendering SelectItem while loading
export function WrongSelectWhileLoading({ isLoading }: { isLoading: boolean }) {
  return (
    <Select>
      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
      <SelectContent>
        {isLoading && (
          // ❌ This will cause error if value is empty!
          <SelectItem value="">Loading...</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

// ❌ WRONG: Not filtering empty values from async data
export function WrongAsyncNoFiltering({ items }: { items: Division[] }) {
  return (
    <Select>
      <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          // ❌ item.id might be empty or null!
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

