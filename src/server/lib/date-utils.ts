/**
 * Date utility functions
 */

/**
 * Convert YYYY-MM string to date range (start and end of month)
 * @param ym - Year-month string in format YYYY-MM
 * @returns Object with start and end dates
 */
export function toMonthRange(ym: string): { start: Date; end: Date } {
  const [year, month] = ym.split("-").map(Number);
  
  if (!year || !month || month < 1 || month > 12) {
    throw new Error("Invalid month format. Expected YYYY-MM");
  }

  // Start of month: YYYY-MM-01 00:00:00 UTC
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  
  // End of month: Last day at 23:59:59 UTC
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  return { start, end };
}

/**
 * Format date to YYYY-MM-DD string
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get current month in YYYY-MM format
 * @returns Current month string
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

