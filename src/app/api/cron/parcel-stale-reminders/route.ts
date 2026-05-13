import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canPushNow, recordDispatch, hashPayload } from "@/lib/notifications/push-gate";
import { createNotification } from "@/lib/notifications/create";
import { buildParcelNotificationFlex } from "@/lib/line/flex-builders/parcel-notification";
import { pushFlexMessage } from "@/lib/line/client";

export const maxDuration = 60;

// Bucket thresholds: 24h first reminder, 72h urgent
const BUCKET_24H = 24;
const BUCKET_72H = 72;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminDb = createAdminClient();
  const now = Date.now();
  const since24h = new Date(now - BUCKET_24H * 60 * 60 * 1000).toISOString();

  const { data: parcels, error } = await adminDb
    .from("parcels")
    .select(`
      id, parcel_type, notified_at, tracking_number, pickup_location,
      student:profiles!parcels_student_id_fkey(id, line_uid, full_name_th, display_name, push_enabled)
    `)
    .eq("status", "notified")
    .lte("notified_at", since24h)
    .order("notified_at", { ascending: true });

  if (error) {
    console.error("[ParcelCron] Query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let pushed = 0;
  let skipped = 0;

  for (const parcel of parcels ?? []) {
    const student = Array.isArray(parcel.student) ? parcel.student[0] : parcel.student;
    if (!student || !parcel.notified_at) continue;

    const hoursWaiting = Math.floor((now - new Date(parcel.notified_at).getTime()) / (1000 * 60 * 60));
    const bucket = hoursWaiting >= BUCKET_72H ? "72h" : "24h";
    const isUrgent = bucket === "72h";

    const payloadHash = hashPayload(`parcel_stale:${parcel.id}:${bucket}`);

    const gate = await canPushNow({
      userId: student.id,
      lineUid: student.line_uid,
      type: "parcel",
      payloadHash,
      bypassQuietHours: isUrgent,
    });

    if (!gate.ok) {
      console.log(`[ParcelCron] Skip ${parcel.id}: ${gate.reason}`);
      skipped++;
      continue;
    }

    const recipientName = student.display_name ?? student.full_name_th ?? "นิสิต";

    const parcelTypeLabels: Record<string, string> = {
      box: "📦 กล่องพัสดุ",
      envelope: "💌 ซองจดหมาย",
      bag: "🛍️ ถุงพัสดุ",
      oversized: "📦 พัสดุขนาดใหญ่",
      other: "📦 พัสดุ",
    };

    const flexData = {
      recipientName: `@${recipientName}`,
      parcelCount: 1,
      parcelTypes: [parcelTypeLabels[parcel.parcel_type] ?? "📦 พัสดุ"],
      arrivedAt: `รอรับ ${hoursWaiting} ชั่วโมงแล้ว`,
      pickupLocation: parcel.pickup_location,
      liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID,
    };

    try {
      await pushFlexMessage(student.line_uid!, buildParcelNotificationFlex(flexData));
      await recordDispatch({ userId: student.id, type: "parcel", payloadHash });
      await createNotification({
        user_id: student.id,
        type: "parcel",
        title_th: isUrgent ? "⚠️ พัสดุรอรับนานมาก!" : "📦 อย่าลืมรับพัสดุนะ!",
        title_en: "Parcel pickup reminder",
        body_th: `รอรับ ${hoursWaiting} ชั่วโมงแล้ว — ${parcel.pickup_location}`,
        action_url: "/parcels",
        priority: isUrgent ? 85 : 75,
        metadata: { parcel_id: parcel.id, hours_waiting: hoursWaiting },
      });
      pushed++;
    } catch (err) {
      console.error(`[ParcelCron] Push failed for parcel ${parcel.id}:`, err);
    }
  }

  console.log(`[ParcelCron] Done — pushed: ${pushed}, skipped: ${skipped}`);
  return NextResponse.json({ pushed, skipped });
}
