/**
 * Code generation utilities for various entities
 */

/**
 * Generate buyer code in format: B-YYYYMM-###
 * Example: B-202501-001, B-202501-002, etc.
 * 
 * @param lastCode - The last buyer code for the current month (optional)
 * @returns Generated buyer code
 */
export function generateBuyerCode(lastCode?: string | null): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const yearMonth = `${year}${month}`;
  const prefix = `B-${yearMonth}-`;

  // If no last code, start from 001
  if (!lastCode) {
    return `${prefix}001`;
  }

  // Extract the sequence number from the last code
  // Format: B-YYYYMM-###
  const parts = lastCode.split("-");
  if (parts.length !== 3) {
    // Invalid format, start from 001
    return `${prefix}001`;
  }

  const lastYearMonth = parts[1];
  const lastSequence = parseInt(parts[2] ?? "0", 10);

  // If the month has changed, reset to 001
  if (lastYearMonth !== yearMonth) {
    return `${prefix}001`;
  }

  // Increment the sequence number
  const nextSequence = lastSequence + 1;
  const sequenceStr = String(nextSequence).padStart(3, "0");

  return `${prefix}${sequenceStr}`;
}

/**
 * Parse buyer code to extract year, month, and sequence
 * 
 * @param code - Buyer code in format B-YYYYMM-###
 * @returns Parsed components or null if invalid
 */
export function parseBuyerCode(code: string): {
  year: number;
  month: number;
  sequence: number;
} | null {
  const parts = code.split("-");
  if (parts.length !== 3 || parts[0] !== "B") {
    return null;
  }

  const yearMonth = parts[1];
  const sequence = parts[2];

  if (!yearMonth || yearMonth.length !== 6 || !sequence) {
    return null;
  }

  const year = parseInt(yearMonth.substring(0, 4), 10);
  const month = parseInt(yearMonth.substring(4, 6), 10);
  const seq = parseInt(sequence, 10);

  if (isNaN(year) || isNaN(month) || isNaN(seq)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month, sequence: seq };
}

/**
 * Validate buyer code format
 * 
 * @param code - Buyer code to validate
 * @returns True if valid, false otherwise
 */
export function isValidBuyerCode(code: string): boolean {
  return parseBuyerCode(code) !== null;
}

/**
 * Get current year-month string for buyer code
 *
 * @returns Year-month string in format YYYYMM
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

// ============================================================================
// INVENTORY DOCUMENT CODE GENERATORS
// ============================================================================

/**
 * Generic document code generator
 * Format: PREFIX-YYYYMM-####
 *
 * @param prefix - Document prefix (e.g., "GRN", "ISS", "TRF")
 * @param lastCode - Last document code for the current month (optional)
 * @returns Generated document code
 */
export function generateDocumentCode(prefix: string, lastCode?: string | null): string {
  const yearMonth = getCurrentYearMonth();
  const fullPrefix = `${prefix}-${yearMonth}-`;

  // If no last code, start from 0001
  if (!lastCode) {
    return `${fullPrefix}0001`;
  }

  // Extract the sequence number from the last code
  // Format: PREFIX-YYYYMM-####
  const parts = lastCode.split("-");
  if (parts.length !== 3) {
    // Invalid format, start from 0001
    return `${fullPrefix}0001`;
  }

  const lastYearMonth = parts[1];
  const lastSequence = parseInt(parts[2] ?? "0", 10);

  // If the month has changed, reset to 0001
  if (lastYearMonth !== yearMonth) {
    return `${fullPrefix}0001`;
  }

  // Increment the sequence number
  const nextSequence = lastSequence + 1;
  const sequenceStr = String(nextSequence).padStart(4, "0");

  return `${fullPrefix}${sequenceStr}`;
}

/**
 * Generate GRN (Goods Receipt Note) code
 * Format: GRN-YYYYMM-####
 */
export function generateGrnCode(lastCode?: string | null): string {
  return generateDocumentCode("GRN", lastCode);
}

/**
 * Generate Goods Issue code
 * Format: ISS-YYYYMM-####
 */
export function generateIssueCode(lastCode?: string | null): string {
  return generateDocumentCode("ISS", lastCode);
}

/**
 * Generate Stock Transfer code
 * Format: TRF-YYYYMM-####
 */
export function generateTransferCode(lastCode?: string | null): string {
  return generateDocumentCode("TRF", lastCode);
}

/**
 * Generate Stock Adjustment code
 * Format: ADJ-YYYYMM-####
 */
export function generateAdjustmentCode(lastCode?: string | null): string {
  return generateDocumentCode("ADJ", lastCode);
}

/**
 * Generate Stock Count code
 * Format: CNT-YYYYMM-####
 */
export function generateCountCode(lastCode?: string | null): string {
  return generateDocumentCode("CNT", lastCode);
}

