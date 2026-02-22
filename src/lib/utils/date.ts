/**
 * Convert a date to Thai Buddhist calendar year (พ.ศ.)
 */
export function toBuddhistYear(date: Date): number {
  return date.getFullYear() + 543;
}

/**
 * Format a date for display in Thai locale
 */
export function formatThaiDate(date: Date): string {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date for display in English locale
 */
export function formatEnDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date = new Date()): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
