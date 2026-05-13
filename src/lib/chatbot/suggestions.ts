import type { ChatIntent, QuickReplyItem } from "./types";

/** Get contextual quick reply menu after handling an intent */
export function getQuickReplyForIntent(intent: ChatIntent): QuickReplyItem[] | undefined {
  const menus: Record<ChatIntent, QuickReplyItem[]> = {
    repair: [
      {
        type: "action",
        action: { type: "camera", label: "📸 ถ่ายรูปเลย" },
      },
      {
        type: "action",
        action: { type: "cameraRoll", label: "🖼️ เลือกรูปจากอัลบั้ม" },
      },
      {
        type: "action",
        action: { type: "message", label: "📋 ดูประวัติแจ้งซ่อม", text: "ประวัติแจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    score: [
      {
        type: "action",
        action: { type: "message", label: "🎉 กิจกรรมที่ได้คะแนน", text: "กิจกรรมที่ได้คะแนน" },
      },
      {
        type: "action",
        action: { type: "message", label: "📋 กฎหอพัก", text: "กฎหอพัก" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    events: [
      {
        type: "action",
        action: { type: "message", label: "📊 เช็คคะแนนหอ", text: "คะแนนหอ" },
      },
      {
        type: "action",
        action: { type: "message", label: "📦 เช็คพัสดุ", text: "พัสดุ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    parcel: [
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
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    knowledge: [
      {
        type: "action",
        action: { type: "message", label: "💬 คุยกับเจ้าหน้าที่", text: "ขอคุยกับเจ้าหน้าที่" },
      },
    ],
    billing: [
      {
        type: "action",
        action: { type: "message", label: "🔧 แจ้งซ่อม", text: "แจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "📦 เช็คพัสดุ", text: "พัสดุ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    technician: [],
    chitchat: [],
  };

  const items = menus[intent];
  if (!items || items.length === 0) return undefined;
  return items;
}

/** Get contextual quick reply menu after a postback action */
export function getQuickReplyForPostback(action: string): QuickReplyItem[] {
  const menus: Record<string, QuickReplyItem[]> = {
    repair_confirm: [
      {
        type: "action",
        action: { type: "message", label: "🔍 ติดตามสถานะ", text: "ติดตามสถานะซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "📋 ดูประวัติ", text: "ประวัติแจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    repair_track: [
      {
        type: "action",
        action: { type: "message", label: "📋 ดูประวัติ", text: "ประวัติแจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🔧 แจ้งซ่อมใหม่", text: "แจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    repair_cancel_ticket: [
      {
        type: "action",
        action: { type: "message", label: "🔧 แจ้งซ่อมใหม่", text: "แจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "📋 ดูประวัติ", text: "ประวัติแจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    repair_history: [
      {
        type: "action",
        action: { type: "message", label: "🔧 แจ้งซ่อมใหม่", text: "แจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    repair_cancel: [
      {
        type: "action",
        action: { type: "message", label: "🔧 แจ้งซ่อมใหม่", text: "แจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    repair_book: [
      {
        type: "action",
        action: { type: "message", label: "🔍 ติดตามสถานะ", text: "ติดตามสถานะซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    confirm_parcel_received: [
      {
        type: "action",
        action: { type: "message", label: "📊 คะแนนหอ", text: "คะแนนหอ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🔧 แจ้งซ่อม", text: "แจ้งซ่อม" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    confirm_payment: [
      {
        type: "action",
        action: { type: "message", label: "📦 เช็คพัสดุ", text: "พัสดุ" },
      },
      {
        type: "action",
        action: { type: "message", label: "📊 คะแนนหอ", text: "คะแนนหอ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    remind_bill: [
      {
        type: "action",
        action: { type: "message", label: "💰 เช็คค่าหอ", text: "ค่าหอ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
    event_register: [
      {
        type: "action",
        action: { type: "message", label: "📊 คะแนนหอ", text: "คะแนนหอ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🎉 กิจกรรมอื่นๆ", text: "กิจกรรมหอ" },
      },
      {
        type: "action",
        action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" },
      },
    ],
  };

  return menus[action] ?? [];
}
