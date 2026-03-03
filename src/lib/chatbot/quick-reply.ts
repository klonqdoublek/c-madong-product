import type { QuickReplyItem } from "./types"

/** Main menu quick reply items */
export const MAIN_MENU_QUICK_REPLY: { items: QuickReplyItem[] } = {
  items: [
    {
      type: "action",
      action: { type: "message", label: "🔧 แจ้งซ่อม", text: "แจ้งซ่อม" },
    },
    {
      type: "action",
      action: { type: "message", label: "📊 คะแนนหอ", text: "คะแนนหอ" },
    },
    {
      type: "action",
      action: { type: "message", label: "🎉 กิจกรรม", text: "กิจกรรมหอ" },
    },
    {
      type: "action",
      action: { type: "message", label: "❓ ถามเรื่องหอ", text: "กฎหอพัก" },
    },
  ],
}

/** Trigger keywords that show the main menu */
const MENU_TRIGGERS = [
  "น้องซีมะโด่ง",
  "ซีมะโด่ง",
  "เมนู",
  "menu",
  "help",
  "ช่วยเหลือ",
]

/** Check if text is a menu trigger */
export function isMenuTrigger(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return MENU_TRIGGERS.some((t) => lower === t || lower === t.toLowerCase())
}
