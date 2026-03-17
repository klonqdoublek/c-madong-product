import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildParcelStatusFlex,
  buildParcelAllReceivedFlex,
} from "../flex-builders/parcel-status";
import { formatThaiDate } from "@/lib/utils/date";
import type { HandlerResponse } from "../types";
import type { ParcelType } from "@/lib/supabase/types";

const PARCEL_TYPE_LABELS: Record<ParcelType, string> = {
  box: "📦 กล่องพัสดุ",
  envelope: "💌 ซองจดหมาย",
  bag: "👜 ถุง/กระเป๋า",
  oversized: "📐 พัสดุขนาดใหญ่",
  other: "📮 อื่นๆ",
};

/** Handle parcel-related messages — show pending parcels for user */
export async function handleParcel(lineUid: string): Promise<HandlerResponse> {
  try {
    const adminDb = createAdminClient();

    // Look up user profile from LINE UID
    const { data: profile } = await adminDb
      .from("profiles")
      .select("id, full_name_th, display_name")
      .eq("line_uid", lineUid)
      .single();

    if (!profile) {
      return {
        type: "text",
        text: "ยังหาข้อมูลน้องไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ",
      };
    }

    // Get pending/notified parcels
    const { data: parcels } = await adminDb
      .from("parcels")
      .select("*")
      .eq("student_id", profile.id)
      .in("status", ["pending", "notified"])
      .order("created_at", { ascending: false })
      .limit(5);

    const recipientName = profile.display_name || profile.full_name_th || "น้อง";

    if (!parcels || parcels.length === 0) {
      return {
        type: "flex",
        flex: buildParcelAllReceivedFlex(),
      };
    }

    // Build Flex message for the parcels
    const parcelItems = parcels.map((p) => ({
      tracking: p.tracking_number || "ไม่มีเลข tracking",
      typeLabel: PARCEL_TYPE_LABELS[p.parcel_type as ParcelType] ?? "📦 พัสดุ",
      arrivedAt: formatThaiDate(new Date(p.created_at)),
    }));

    const flexPayload = buildParcelStatusFlex({
      recipientName,
      parcels: parcelItems,
      pickupLocation: parcels[0].pickup_location ?? "ห้องพัสดุหอพัก",
    });

    return {
      type: "flex",
      flex: flexPayload,
    };
  } catch (err) {
    console.error("[Parcel Handler] Error:", err);
    return {
      type: "text",
      text: "เช็คพัสดุไม่ได้ตอนนี้น้า 😅 ลองใหม่อีกทีนะ",
    };
  }
}
