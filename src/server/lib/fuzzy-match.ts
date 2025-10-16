/**
 * Fuzzy Matching Utilities
 * Simple Levenshtein distance-based fuzzy matching for supplier/vehicle names
 */

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits required to change one string into the other
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  // Create a 2D array for dynamic programming
  const matrix: number[][] = [];
  
  // Initialize first column
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  // Initialize first row
  for (let j = 0; j <= len2; j++) {
    matrix[0]![j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,      // deletion
        matrix[i]![j - 1]! + 1,      // insertion
        matrix[i - 1]![j - 1]! + cost // substitution
      );
    }
  }
  
  return matrix[len1]![len2]!;
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is exact match)
 * Uses normalized Levenshtein distance
 */
export function similarityScore(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1;
  
  return 1 - (distance / maxLength);
}

/**
 * Normalize string for comparison (lowercase, trim, remove extra spaces)
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if query is contained in target (case-insensitive)
 */
export function containsMatch(target: string, query: string): boolean {
  return normalizeString(target).includes(normalizeString(query));
}

/**
 * Calculate combined score for fuzzy matching
 * Prioritizes:
 * 1. Exact match (score = 1.0)
 * 2. Contains match (score = 0.8 + similarity bonus)
 * 3. Fuzzy match (score = similarity)
 */
export function fuzzyMatchScore(target: string, query: string): number {
  if (!target || !query) return 0;
  
  const normalizedTarget = normalizeString(target);
  const normalizedQuery = normalizeString(query);
  
  // Exact match
  if (normalizedTarget === normalizedQuery) {
    return 1.0;
  }
  
  // Contains match
  if (normalizedTarget.includes(normalizedQuery)) {
    const similarity = similarityScore(target, query);
    return 0.8 + (similarity * 0.2); // 0.8 - 1.0 range
  }
  
  // Fuzzy match
  return similarityScore(target, query);
}

/**
 * Sort items by fuzzy match score
 */
export function sortByFuzzyMatch<T>(
  items: T[],
  query: string,
  getField: (item: T) => string
): Array<T & { similarity: number }> {
  return items
    .map(item => ({
      ...item,
      similarity: fuzzyMatchScore(getField(item), query),
    }))
    .filter(item => item.similarity > 0.3) // Minimum threshold
    .sort((a, b) => b.similarity - a.similarity);
}

