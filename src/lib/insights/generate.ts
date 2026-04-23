import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type InsightRow = Database["public"]["Tables"]["ai_insights"]["Row"];
type InsightInsert = Database["public"]["Tables"]["ai_insights"]["Insert"];

interface GenerateInsightsOptions {
  userId: string;
  includeAI?: boolean;
}

/** Generate or return cached insights for a user */
export async function generateInsights(
  opts: GenerateInsightsOptions
): Promise<InsightRow[]> {
  const adminDb = createAdminClient();
  const includeAI = opts.includeAI ?? true;

  // Check for cached (non-expired, non-dismissed) insights from last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: cached } = await adminDb
    .from("ai_insights")
    .select("*")
    .eq("user_id", opts.userId)
    .is("dismissed_at", null)
    .gte("created_at", oneHourAgo)
    .order("priority", { ascending: false })
    .limit(5);

  if (cached && cached.length > 0) {
    return cached;
  }

  // Delete old insights for this user
  await adminDb
    .from("ai_insights")
    .delete()
    .eq("user_id", opts.userId)
    .is("dismissed_at", null);

  // Generate rule-based insights
  const insights: InsightInsert[] = [];

  // 1. Check overdue bills
  const now = new Date();
  const sevenDaysFromNow = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const today = now.toISOString().split("T")[0];

  const [
    { data: overdueBills },
    { data: dueBills },
    { data: openTickets },
    { data: mandatoryEvents },
  ] = await Promise.all([
    adminDb
      .from("bills")
      .select("id, total_amount, due_date, billing_month")
      .eq("student_id", opts.userId)
      .eq("status", "overdue")
      .limit(3),
    adminDb
      .from("bills")
      .select("id, total_amount, due_date")
      .eq("student_id", opts.userId)
      .eq("status", "pending")
      .lte("due_date", sevenDaysFromNow)
      .order("due_date", { ascending: true })
      .limit(3),
    adminDb
      .from("maintenance_requests")
      .select("id, title, status")
      .eq("requester_id", opts.userId)
      .in("status", ["pending", "acknowledged", "in_progress"])
      .limit(3),
    adminDb
      .from("dorm_events")
      .select("id, title, title_th, start_datetime, event_date")
      .eq("is_mandatory", true)
      .in("event_status", ["published", "ongoing"])
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(2),
  ]);

  if (overdueBills && overdueBills.length > 0) {
    const bill = overdueBills[0];
    insights.push({
      user_id: opts.userId,
      insight_type: "bill_overdue",
      title_th: "มีบิลค้างชำระ!",
      title_en: "Overdue Bill",
      description_th: `ค่าหอพัก ฿${bill.total_amount?.toLocaleString()} เลยกำหนดชำระแล้วน้า`,
      description_en: `Dorm fee ฿${bill.total_amount?.toLocaleString()} is overdue`,
      action_url: `/billing/${bill.id}`,
      priority: 100,
      variant: "featured",
      icon_name: "Banknote",
      urgency_label: "เลยกำหนด",
    });
  }

  // 2. Check pending bills due within 7 days
  if (dueBills && dueBills.length > 0) {
    const bill = dueBills[0];
    const daysLeft = Math.ceil(
      (new Date(bill.due_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    insights.push({
      user_id: opts.userId,
      insight_type: "bill_due",
      title_th: "ค่าหอพักใกล้ครบกำหนด",
      title_en: "Bill Due Soon",
      description_th: `ค่าหอพัก ฿${bill.total_amount?.toLocaleString()} ครบกำหนดอีก ${daysLeft} วัน`,
      description_en: `Dorm fee ฿${bill.total_amount?.toLocaleString()} due in ${daysLeft} days`,
      action_url: `/billing/${bill.id}`,
      priority: 80,
      variant: insights.length === 0 ? "featured" : "default",
      icon_name: "CreditCard",
      deadline: `อีก ${daysLeft} วัน`,
    });
  }

  // 3. Check open maintenance tickets
  if (openTickets && openTickets.length > 0) {
    insights.push({
      user_id: opts.userId,
      insight_type: "maintenance_pending",
      title_th: `แจ้งซ่อม: ${openTickets[0].title}`,
      title_en: `Repair: ${openTickets[0].title}`,
      description_th: `มี ${openTickets.length} รายการที่กำลังดำเนินการ`,
      description_en: `${openTickets.length} active request(s)`,
      action_url: `/maintenance/${openTickets[0].id}`,
      priority: 70,
      variant: insights.length === 0 ? "featured" : "default",
      icon_name: "Wrench",
    });
  }

  // 4. Check upcoming mandatory events
  if (mandatoryEvents && mandatoryEvents.length > 0) {
    const ev = mandatoryEvents[0];
    insights.push({
      user_id: opts.userId,
      insight_type: "event_mandatory",
      title_th: `กิจกรรมบังคับ: ${ev.title_th || ev.title}`,
      title_en: `Mandatory: ${ev.title}`,
      description_th: "ห้ามขาดน้า ขาดแล้วโดนหักคะแนน",
      description_en: "Don't miss it — absence results in score deduction",
      action_url: `/events/${ev.id}`,
      priority: 85,
      variant: insights.length === 0 ? "featured" : "default",
      icon_name: "Calendar",
      urgency_label: "บังคับ",
    });
  }

  // 5. If fewer than 3 rule-based insights, try AI (only if OpenAI key available)
  if (includeAI && insights.length < 3 && process.env.OPENAI_API_KEY) {
    try {
      const aiInsights = await generateAIInsight(opts.userId);
      if (aiInsights) {
        insights.push(
          ...aiInsights.map((ai) => ({
            ...ai,
            user_id: opts.userId,
            priority: 30,
            variant: "default" as const,
          }))
        );
      }
    } catch {
      // AI failure is non-critical
    }
  }

  // Fallback: at least one general tip
  if (insights.length === 0) {
    insights.push({
      user_id: opts.userId,
      insight_type: "general_tip",
      title_th: "ทุกอย่างเรียบร้อยดี",
      title_en: "All good!",
      description_th: "ไม่มีอะไรต้องทำตอนนี้ พักผ่อนให้สบายนะ",
      description_en: "Nothing to do right now. Take it easy!",
      priority: 10,
      variant: "default",
      icon_name: "Sparkles",
    });
  }

  // Store in DB
  const { data: inserted } = await adminDb
    .from("ai_insights")
    .insert(insights)
    .select("*");

  return inserted ?? [];
}

async function generateAIInsight(
  userId: string
): Promise<InsightInsert[] | null> {
  const { getOpenAIClient } = await import("@/lib/ai/openai");
  const { INSIGHT_GENERATION_PROMPT } = await import("./prompts");

  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("full_name_th, building_id, room_id")
    .eq("id", userId)
    .single();

  const context = JSON.stringify({
    name: profile?.full_name_th ?? "นิสิต",
    hasBuilding: !!profile?.building_id,
    hasRoom: !!profile?.room_id,
  });

  const openai = getOpenAIClient();
  const prompt = INSIGHT_GENERATION_PROMPT.replace("{context}", context);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : parsed.insights ?? [parsed];
    return arr.slice(0, 2).map(
      (item: Record<string, string>) =>
        ({
          insight_type: "general_tip",
          title_th: item.title_th ?? "คำแนะนำ",
          title_en: item.title_en ?? "Tip",
          description_th: item.description_th ?? "",
          description_en: item.description_en ?? "",
          icon_name: item.icon_name ?? "Lightbulb",
          action_url: item.action_url ?? null,
        }) as InsightInsert
    );
  } catch {
    return null;
  }
}
