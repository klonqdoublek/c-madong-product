/**
 * POST /api/admin/parcels/notify-bulk — Send notifications for multiple parcels
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildParcelNotificationFlex } from "@/lib/line/flex-builders/parcel-notification";
import { pushFlexMessage } from "@/lib/line/client";
import { notifyParcelArrived } from "@/lib/notifications/triggers";
import { formatThaiDate } from "@/lib/utils/date";
import type { ParcelType } from "@/lib/supabase/types";

export const maxDuration = 60;

const PARCEL_TYPE_LABELS: Record<ParcelType, string> = {
  box: "📦 กล่องพัสดุ",
  envelope: "💌 ซองจดหมาย",
  bag: "👜 ถุง/กระเป๋า",
  oversized: "📐 พัสดุขนาดใหญ่",
  other: "📮 อื่นๆ",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { parcelIds } = await request.json();
    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return NextResponse.json(
        { error: "parcelIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    // Fetch all selected parcels
    const { data: parcels, error: fetchError } = await adminDb
      .from("parcels")
      .select("*")
      .in("id", parcelIds)
      .eq("status", "pending");

    if (fetchError) throw fetchError;
    if (!parcels || parcels.length === 0) {
      return NextResponse.json({ success: true, notified: 0, errors: [] });
    }

    // Fetch profiles for all students
    const studentIds = [...new Set(parcels.map((p) => p.student_id))];
    const { data: profiles } = await adminDb
      .from("profiles")
      .select("id, full_name_th, display_name, line_uid")
      .in("id", studentIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const parcel of parcels) {
      try {
        const profile = profileMap.get(parcel.student_id);
        const lineUid = profile?.line_uid;
        const recipientName = profile?.display_name || profile?.full_name_th || "น้อง";

        // Send LINE Flex
        if (lineUid) {
          const flexPayload = buildParcelNotificationFlex({
            recipientName,
            parcelCount: 1,
            parcelTypes: [PARCEL_TYPE_LABELS[parcel.parcel_type as ParcelType] ?? "📦 พัสดุ"],
            arrivedAt: formatThaiDate(new Date()),
            pickupLocation: parcel.pickup_location,
          });
          await pushFlexMessage(lineUid, flexPayload);
        }

        // Update status
        await adminDb
          .from("parcels")
          .update({
            status: "notified",
            notified_at: new Date().toISOString(),
          })
          .eq("id", parcel.id);

        // In-app notification
        await notifyParcelArrived({
          studentUserId: parcel.student_id,
          lineUid: null,
          parcelId: parcel.id,
          parcelType: PARCEL_TYPE_LABELS[parcel.parcel_type as ParcelType],
          trackingNumber: parcel.tracking_number,
        });

        results.push({ id: parcel.id, success: true });
      } catch (err) {
        console.error(`Failed to notify parcel ${parcel.id}:`, err);
        results.push({
          id: parcel.id,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const notified = results.filter((r) => r.success).length;
    const errors = results.filter((r) => !r.success);

    return NextResponse.json({ success: true, notified, errors });
  } catch (error) {
    console.error("Error in bulk notify:", error);
    return NextResponse.json(
      { error: "Failed to send bulk notifications" },
      { status: 500 }
    );
  }
}
