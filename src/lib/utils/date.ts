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

/**
 * Format a date string as a relative time (e.g., "2m ago", "3d ago").
 */
export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;

  return date.toLocaleDateString();
}
