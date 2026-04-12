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

/** Smart notification quick reply items (from onboarding bubble 4) */
export const SMART_NOTIFY_QUICK_REPLY: { items: QuickReplyItem[] } = {
  items: [
    {
      type: "action",
      action: { type: "message", label: "📊 คะแนนหอ", text: "คะแนนหอ" },
    },
    {
      type: "action",
      action: { type: "message", label: "📦 พัสดุ", text: "พัสดุ" },
    },
    {
      type: "action",
      action: { type: "message", label: "💰 ค่าหอพัก", text: "ค่าหอ" },
    },
  ],
}

/** Ask question quick reply items (from onboarding bubble 2) */
export const ASK_QUICK_REPLY: { items: QuickReplyItem[] } = {
  items: [
    {
      type: "action",
      action: { type: "message", label: "📋 กฎหอพัก", text: "กฎหอพัก" },
    },
    {
      type: "action",
      action: { type: "message", label: "💰 ค่าหอ/ค่าน้ำค่าไฟ", text: "ค่าหอ" },
    },
    {
      type: "action",
      action: {
        type: "message",
        label: "🏢 สิ่งอำนวยความสะดวก",
        text: "สิ่งอำนวยความสะดวก",
      },
    },
  ],
}

/** Repair guide quick reply items (from onboarding bubble 3) */
export const REPAIR_GUIDE_QUICK_REPLY: { items: QuickReplyItem[] } = {
  items: [
    {
      type: "action",
      action: { type: "message", label: "🔧 ลองแจ้งซ่อมเลย", text: "แจ้งซ่อม" },
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
