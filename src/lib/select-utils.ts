/**
 * Select Utilities - Prevent "Select.Item must have a value prop that is not an empty string" error
 * 
 * Rules:
 * 1. SelectItem value MUST be non-empty string
 * 2. Never use <SelectItem value="">Placeholder</SelectItem>
 * 3. Always convert enum/number to string
 * 4. Filter out null/undefined/empty values before rendering
 */

/**
 * Convert any value to non-empty string or null
 * Use this to safely convert enum/number/string to SelectItem value
 * 
 * @example
 * const value = toNonEmptyString(FamilyRelation.ISTRI); // "ISTRI"
 * const value = toNonEmptyString(null); // null
 * const value = toNonEmptyString(""); // null
 */
export function toNonEmptyString(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const stringValue = (typeof value === 'string' || typeof value === 'number' ? String(value) : "").trim();
  
  // Guard against "undefined", "null", "NaN" strings
  if (
    stringValue === "" ||
    stringValue === "undefined" ||
    stringValue === "null" ||
    stringValue === "NaN"
  ) {
    return null;
  }
  
  return stringValue;
}

/**
 * Safe option type for Select components
 */
export interface SelectOption {
  value: string; // MUST be non-empty
  label: string;
  disabled?: boolean;
}

/**
 * Convert array of raw options to safe SelectOption[]
 * Filters out any items with invalid values
 * 
 * @example
 * const options = toSafeSelectOptions(
 *   [{ id: 1, name: "Foo" }, { id: null, name: "Bar" }],
 *   (item) => ({ value: item.id, label: item.name })
 * );
 * // Result: [{ value: "1", label: "Foo" }]
 */
export function toSafeSelectOptions<T>(
  items: T[],
  mapper: (item: T) => { value: unknown; label: string; disabled?: boolean }
): SelectOption[] {
  const mapped = items
    .map((item) => {
      const mappedItem = mapper(item);
      const safeValue = toNonEmptyString(mappedItem.value);

      if (safeValue === null) return null;

      return {
        value: safeValue,
        label: mappedItem.label,
        disabled: mappedItem.disabled,
      } as SelectOption;
    })
    .filter((option): option is SelectOption => option !== null);

  return mapped;
}

/**
 * Normalize empty strings to undefined in form data
 * Use this in API controllers before Zod validation
 * 
 * @example
 * const raw = await req.json();
 * const normalized = normalizeEmptyStrings(raw);
 * const parsed = schema.safeParse(normalized);
 */
export function normalizeEmptyStrings<T extends Record<string, unknown>>(
  data: T
): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ])
  ) as T;
}

/**
 * Create enum options for Select
 * 
 * @example
 * enum FamilyRelation { ISTRI = "ISTRI", ANAK = "ANAK" }
 * const options = createEnumOptions(FamilyRelation, {
 *   ISTRI: "Istri",
 *   ANAK: "Anak"
 * });
 */
export function createEnumOptions<T extends Record<string, string>>(
  enumObj: T,
  labels: Record<keyof T, string>
): SelectOption[] {
  return Object.values(enumObj)
    .map((value) => {
      const safeValue = toNonEmptyString(value);
      if (safeValue === null) return null;
      
      return {
        value: safeValue,
        label: labels[value as keyof T] || safeValue,
      };
    })
    .filter((option): option is SelectOption => option !== null);
}

