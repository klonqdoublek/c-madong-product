import { createAdminClient } from "@/lib/supabase/admin"
import { buildEventsCarouselFlex } from "../flex-builders/events-carousel"
import type { HandlerResponse } from "../types"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL

/** Handle events intent: query upcoming events from DB */
export async function handleEvents(): Promise<HandlerResponse> {
  if (IS_DEMO) {
    return {
      type: "text",
      text: "🎉 ตอนนี้ยังไม่มีข้อมูลกิจกรรมน้า (ระบบ demo mode) ลองใหม่เมื่อเชื่อมต่อ Supabase แล้วนะ",
    }
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: events } = await supabase
    .from("dorm_events")
    .select("id, title, event_date, event_time, location, description")
    .gte("event_date", now.split("T")[0])
    .order("event_date", { ascending: true })
    .limit(10)

  if (!events || events.length === 0) {
    return {
      type: "text",
      text: "🎉 ตอนนี้ยังไม่มีกิจกรรมที่จะมาถึงจ้า ติดตามข่าวสารได้เรื่อยๆ นะ",
    }
  }

  if (events.length === 1) {
    const e = events[0]
    return {
      type: "text",
      text: `🎉 กิจกรรมที่จะมาถึง:\n\n📌 ${e.title}\n📅 ${e.event_date} ${e.event_time ?? ""}\n📍 ${e.location ?? "TBD"}\n${e.description ? `\n${e.description}` : ""}`,
    }
  }

  return {
    type: "flex",
    flex: buildEventsCarouselFlex(
      events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.event_date,
        time: e.event_time ?? "",
        location: e.location ?? "TBD",
        description: e.description ?? undefined,
      }))
    ),
  }
}
