/** Thai repair keywords for fast-path intent detection (fallback when AI is slow/unavailable) */

export const REPAIR_KEYWORDS: Record<string, string[]> = {
  plumbing: [
    "น้ำรั่ว", "ท่อตัน", "ชักโครก", "ก๊อกน้ำ", "น้ำไม่ไหล",
    "ท่อน้ำ", "ห้องน้ำรั่ว", "อ่างล้างหน้า", "ท่อแตก", "สุขภัณฑ์",
  ],
  electrical: [
    "ปลั๊ก", "สวิตช์", "หลอดไฟ", "ไฟดับ", "ไฟกระพริบ",
    "เต้ารับ", "สายไฟ", "ไฟฟ้า", "ฟิวส์",
    "ไฟเสีย", "ไฟไม่ติด",
  ],
  aircon: [
    "แอร์", "เครื่องปรับอากาศ", "แอร์ไม่เย็น", "แอร์รั่ว", "แอร์เสีย",
    "แอร์มีกลิ่น", "รีโมทแอร์", "แอร์ไม่ทำงาน",
  ],
  furniture: [
    "เตียง", "โต๊ะ", "เก้าอี้", "ชั้นวาง", "ลิ้นชัก",
    "ประตู", "หน้าต่าง", "กลอน", "บานเลื่อน",
    "ตู้เสื้อผ้า", "ตู้พัง", "ตู้เสีย", "ตู้ล็อคไม่ได้",
  ],
  pest: [
    "แมลง", "มด", "แมลงสาบ", "หนู", "ปลวก", "ยุง",
  ],
  internet: [
    "เน็ต", "อินเทอร์เน็ต", "wifi", "ไวไฟ", "เน็ตหลุด",
    "เน็ตช้า", "ต่อเน็ตไม่ได้",
  ],
  other: [
    "แจ้งซ่อม", "พัง", "ชำรุด", "หัก", "แตก",
    "เสียหาย", "ใช้ไม่ได้", "ไม่ทำงาน",
  ],
}

/** Flat list for quick contains-check */
export const ALL_REPAIR_KEYWORDS = Object.values(REPAIR_KEYWORDS).flat()

/** Category display names in Thai */
export const CATEGORY_NAMES_TH: Record<string, string> = {
  plumbing: "ประปา/สุขภัณฑ์",
  electrical: "ไฟฟ้า",
  aircon: "เครื่องปรับอากาศ",
  furniture: "เฟอร์นิเจอร์/ประตู/หน้าต่าง",
  pest: "สัตว์/แมลง",
  internet: "อินเทอร์เน็ต",
  other: "อื่นๆ",
}

/** Urgency keywords */
export const HIGH_URGENCY_KEYWORDS = [
  "ด่วน", "เร่งด่วน", "ทันที", "อันตราย", "น้ำท่วม",
  "ไฟไหม้", "ไฟฟ้าช็อต", "ไฟลัดวงจร",
]

/** Detect repair category from message using keywords (fast-path) */
export function detectRepairCategory(
  text: string
): { category: string; matched: string } | null {
  const lower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(REPAIR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return { category, matched: keyword }
      }
    }
  }
  return null
}

/** Words that indicate NON-repair context — skip repair detection if present */
const REPAIR_EXCLUSION_PATTERNS = [
  "ค่าไฟ", "ค่าน้ำ", "ค่าหอ", "ค่าห้อง",  // billing
  "ซื้อ", "ขาย", "ราคา",                     // buying/commerce
  "สถานะ", "ประวัติ", "ติดตาม",               // status check
  "เสียใจ", "เสียดาย", "เสียเงิน", "เสียเวลา", // non-repair usage of "เสีย"
]

/** Check if message contains any repair-related keyword (with exclusion filter) */
export function isRepairRelated(text: string): boolean {
  const lower = text.toLowerCase()
  // If message contains exclusion patterns, don't classify as repair
  if (REPAIR_EXCLUSION_PATTERNS.some((ex) => lower.includes(ex))) return false
  return ALL_REPAIR_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

/** Rate limit: max messages per minute per user */
export const RATE_LIMIT_PER_MINUTE = 20

/** Session timeout in minutes */
export const SESSION_TIMEOUT_MINUTES = 30

/** AI call timeout in milliseconds */
export const AI_TIMEOUT_MS = 8000
