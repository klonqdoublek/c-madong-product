/**
 * POST /api/admin/parcels/[id]/notify — Send/resend parcel notification
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildParcelNotificationFlex } from "@/lib/line/flex-builders/parcel-notification";
import { pushFlexMessage } from "@/lib/line/client";
import { notifyParcelArrived } from "@/lib/notifications/triggers";
import { formatThaiDate } from "@/lib/utils/date";
import type { ParcelType } from "@/lib/supabase/types";

export const maxDuration = 15;

const PARCEL_TYPE_LABELS: Record<ParcelType, string> = {
  box: "📦 กล่องพัสดุ",
  envelope: "💌 ซองจดหมาย",
  bag: "👜 ถุง/กระเป๋า",
  oversized: "📐 พัสดุขนาดใหญ่",
  other: "📮 อื่นๆ",
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminDb = createAdminClient();

    // Get parcel
    const { data: parcel, error: fetchError } = await adminDb
      .from("parcels")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !parcel) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    // Get student profile separately (parcels has Relationships: [])
    const { data: profile } = await adminDb
      .from("profiles")
      .select("full_name_th, display_name, line_uid")
      .eq("id", parcel.student_id)
      .single();

    const lineUid = profile?.line_uid;
    const recipientName = profile?.display_name || profile?.full_name_th || "น้อง";

    if (!lineUid) {
      return NextResponse.json(
        { error: "Student has no LINE account linked" },
        { status: 400 }
      );
    }

    // Send LINE Flex
    const flexPayload = buildParcelNotificationFlex({
      recipientName,
      parcelCount: 1,
      parcelTypes: [PARCEL_TYPE_LABELS[parcel.parcel_type as ParcelType] ?? "📦 พัสดุ"],
      arrivedAt: formatThaiDate(new Date()),
      pickupLocation: parcel.pickup_location,
    });
    await pushFlexMessage(lineUid, flexPayload);

    // Update notified_at + status
    await adminDb
      .from("parcels")
      .update({
        status: "notified",
        notified_at: new Date().toISOString(),
      })
      .eq("id", id);

    // In-app notification
    await notifyParcelArrived({
      studentUserId: parcel.student_id,
      lineUid: null,
      parcelId: parcel.id,
      parcelType: PARCEL_TYPE_LABELS[parcel.parcel_type as ParcelType],
      trackingNumber: parcel.tracking_number,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending parcel notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
