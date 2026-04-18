import type { ChatIntent, QuickReplyItem } from "./types";

/** Static suggestion map: after handling an intent, suggest related actions */
const SUGGESTION_MAP: Record<ChatIntent, QuickReplyItem[]> = {
  repair: [
    {
      type: "action",
      action: { type: "message", label: "เช็คคะแนนหอ", text: "เช็คคะแนนหอ" },
    },
    {
      type: "action",
      action: {
        type: "message",
        label: "กิจกรรมใกล้ถึง",
        text: "กิจกรรมใกล้ถึง",
      },
    },
  ],
  score: [
    {
      type: "action",
      action: {
        type: "message",
        label: "ทำไงให้คะแนนเพิ่ม?",
        text: "ทำไงให้คะแนนเพิ่ม?",
      },
    },
    {
      type: "action",
      action: {
        type: "message",
        label: "กิจกรรมที่ได้คะแนน",
        text: "กิจกรรมที่ได้คะแนน",
      },
    },
  ],
  events: [
    {
      type: "action",
      action: { type: "message", label: "เช็คคะแนนหอ", text: "เช็คคะแนนหอ" },
    },
    {
      type: "action",
      action: { type: "message", label: "แจ้งซ่อมห้อง", text: "แจ้งซ่อมห้อง" },
    },
  ],
  knowledge: [
    {
      type: "action",
      action: { type: "message", label: "💬 คุยกับเจ้าหน้าที่", text: "ขอคุยกับเจ้าหน้าที่" },
    },
  ],
  parcel: [
    {
      type: "action",
      action: { type: "message", label: "เช็คคะแนนหอ", text: "เช็คคะแนนหอ" },
    },
    {
      type: "action",
      action: { type: "message", label: "แจ้งซ่อมห้อง", text: "แจ้งซ่อมห้อง" },
    },
  ],
  chitchat: [],
};

/** Get suggestion Quick Replies for a given intent */
export function getSuggestionsForIntent(
  intent: ChatIntent
): QuickReplyItem[] | undefined {
  const items = SUGGESTION_MAP[intent];
  if (!items || items.length === 0) return undefined;
  return items;
}
