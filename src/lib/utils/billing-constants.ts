import type { BillCategory, BillStatus } from "@/lib/supabase/types";

export const BILL_CATEGORIES: { value: BillCategory; labelTh: string; labelEn: string }[] = [
  { value: "room", labelTh: "ค่าห้อง", labelEn: "Room" },
  { value: "electricity", labelTh: "ค่าไฟฟ้า", labelEn: "Electricity" },
  { value: "water", labelTh: "ค่าน้ำ", labelEn: "Water" },
  { value: "deposit", labelTh: "ค่าประกัน", labelEn: "Deposit" },
  { value: "fine", labelTh: "ค่าปรับ", labelEn: "Fine" },
  { value: "other", labelTh: "อื่นๆ", labelEn: "Other" },
];

export const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
] as const;

export const BILL_STATUS_COLORS: Record<BillStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export function formatCurrency(amount: number): string {
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
