const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function thaiMonthShort(month: number): string {
  return THAI_MONTHS_SHORT[(month - 1) % 12] ?? "";
}

export function thaiMonthFull(month: number): string {
  return THAI_MONTHS_FULL[(month - 1) % 12] ?? "";
}

/** Format "YYYY-MM" string → Thai short label e.g. "ม.ค. 68" */
export function formatThaiMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const thaiYear = year - 543 + 543; // keep as Buddhist era display
  const buddhistYear = (year + 543).toString().slice(-2);
  return `${thaiMonthShort(month)} ${buddhistYear}`;
}

/** Format billing_month (1-12) + billing_year → Thai short label */
export function formatThaiMonthFromParts(month: number, year: number): string {
  const buddhistYear = (year + 543).toString().slice(-2);
  return `${thaiMonthShort(month)} ${buddhistYear}`;
}

export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
