import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildTechnicianGroupDigest } from "@/lib/line/flex-builders/technician-group-digest";
import { pushToTechnicianGroup } from "@/lib/line/push-to-technician-group";
import type { DigestTicket } from "@/lib/line/flex-builders/technician-group-digest";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // Validate cron secret
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Query open tickets: under_review + unassigned acknowledged + in_progress
  const { data: tickets, error } = await adminClient
    .from("maintenance_requests")
    .select(`
      id, ticket_code, title, category, status, ai_priority,
      created_at, technician_id,
      requester:profiles!requester_id(building_id)
    `)
    .in("status", ["under_review", "acknowledged", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("[DigestCron] Query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const open = (tickets ?? []).filter(
    (t) => t.status === "under_review" || t.status === "in_progress" || (t.status === "acknowledged" && !t.technician_id)
  );

  if (open.length === 0) {
    console.log("[DigestCron] No open tickets — skipping push");
    return NextResponse.json({ sent: false, reason: "no open tickets" });
  }

  const digestTickets: DigestTicket[] = open.map((t) => ({
    id: t.id,
    ticket_code: t.ticket_code,
    title: t.title,
    category: t.category,
    status: t.status,
    urgency: t.ai_priority,
    created_at: t.created_at,
  }));

  const flex = buildTechnicianGroupDigest(digestTickets);
  await pushToTechnicianGroup(flex);

  return NextResponse.json({ sent: true, count: open.length });
}
