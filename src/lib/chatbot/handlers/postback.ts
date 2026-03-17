import { replyTextMessage, replyFlexMessage } from "@/lib/line/client"
import { getOrCreateSession, resetSession } from "../session-manager"
import { createRepairTicket } from "./repair"
import { buildRepairStatusFlex } from "../flex-builders/repair-status"
import type { RepairDetection } from "../types"

/** Route postback actions from LINE Flex Message buttons */
export async function handlePostback(
  replyToken: string,
  data: string,
  lineUid: string
): Promise<void> {
  const params = new URLSearchParams(data)
  const action = params.get("action")

  switch (action) {
    case "repair_confirm":
      await handleRepairConfirm(replyToken, params, lineUid)
      break

    case "repair_edit":
      await handleRepairEdit(replyToken, lineUid)
      break

    case "repair_cancel":
      await handleRepairCancel(replyToken, lineUid)
      break

    case "remind_bill":
      await replyTextMessage(
        replyToken,
        "ได้เลยจ้า! ซีมะโด่งจะเตือนอีกครั้งนะ 🔔"
      )
      break

    case "confirm_payment":
      await replyTextMessage(
        replyToken,
        "บันทึกแล้วจ้า ทางหอจะตรวจสอบให้นะ ✅"
      )
      break

    case "event_register":
      await replyTextMessage(
        replyToken,
        "ลงทะเบียนกิจกรรมเรียบร้อยจ้า! 🎉 เจอกันวันงานน้า"
      )
      break

    case "confirm_parcel_received":
      await handleConfirmParcelReceived(replyToken, lineUid)
      break

    default:
      await replyTextMessage(replyToken, "ซีมะโด่งไม่เข้าใจคำสั่งนี้น้า 🤔")
  }
}

async function handleRepairConfirm(
  replyToken: string,
  params: URLSearchParams,
  lineUid: string
): Promise<void> {
  // Get detection, photos, and vision metadata from session state
  const session = await getOrCreateSession(lineUid)
  const detection = session.state_data?.detection as RepairDetection | undefined
  const photos = (session.state_data?.photos as string[]) ?? []
  const provider = session.state_data?.provider as string | undefined
  const template_id = session.state_data?.template_id as string | undefined
  const ai_confidence = detection?.ai_confidence as number | undefined

  // Fallback if session is missing detection (shouldn't happen)
  if (!detection) {
    await replyTextMessage(
      replyToken,
      "อุ๊ปส์! ข้อมูลหายไปแล้วน้า 😅 ลองแจ้งซ่อมใหม่อีกทีนะ"
    )
    await resetSession(lineUid)
    return
  }

  const ticket = await createRepairTicket(lineUid, detection, photos, {
    provider,
    template_id,
    ai_confidence,
  })

  if (ticket) {
    await replyFlexMessage(
      replyToken,
      buildRepairStatusFlex({
        id: ticket.id,
        category: detection.category,
        title: detection.title,
        photoCount: photos.length,
      })
    )
  } else {
    await replyTextMessage(
      replyToken,
      "อุ๊ปส์! สร้างใบแจ้งซ่อมไม่สำเร็จน้า 😅 ลองลงทะเบียนในแอปก่อนแล้วแจ้งซ่อมใหม่อีกทีนะ"
    )
  }

  await resetSession(lineUid)
}

async function handleRepairEdit(
  replyToken: string,
  lineUid: string
): Promise<void> {
  const session = await getOrCreateSession(lineUid)
  const originalMessage = (session.state_data?.originalMessage as string) ?? ""

  await replyTextMessage(
    replyToken,
    `ได้เลยจ้า! พิมพ์รายละเอียดปัญหาใหม่มาได้เลยนะ 📝${
      originalMessage ? `\n\nข้อความเดิม: "${originalMessage}"` : ""
    }`
  )

  // Keep session in repair_editing so next message goes to repair handler
  // updateSessionState already called with repair_confirming, update to editing
  const { updateSessionState } = await import("../session-manager")
  await updateSessionState(lineUid, "repair_editing", session.state_data)
}

async function handleRepairCancel(
  replyToken: string,
  lineUid: string
): Promise<void> {
  await resetSession(lineUid)
  await replyTextMessage(
    replyToken,
    "ยกเลิกแจ้งซ่อมแล้วนะ ✌️ ถ้าอยากแจ้งใหม่ก็พิมพ์มาได้เลยจ้า"
  )
}

async function handleConfirmParcelReceived(
  replyToken: string,
  lineUid: string
): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminDb = createAdminClient()

    // Find profile by LINE UID
    const { data: profile } = await adminDb
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single()

    if (!profile) {
      await replyTextMessage(
        replyToken,
        "หาข้อมูลน้องไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ"
      )
      return
    }

    // Mark all pending/notified parcels as picked up
    const { data: updated } = await adminDb
      .from("parcels")
      .update({
        status: "picked_up",
        picked_up_at: new Date().toISOString(),
      })
      .eq("student_id", profile.id)
      .in("status", ["pending", "notified"])
      .select("id")

    const count = updated?.length ?? 0
    if (count > 0) {
      await replyTextMessage(
        replyToken,
        `รับพัสดุเรียบร้อยแล้วจ้า ✅ (${count} ชิ้น)\nขอบคุณที่มารับนะ!`
      )
    } else {
      await replyTextMessage(
        replyToken,
        "ตอนนี้ไม่มีพัสดุรอรับแล้วน้า 📦✨"
      )
    }
  } catch (err) {
    console.error("[Postback] Confirm parcel received error:", err)
    await replyTextMessage(
      replyToken,
      "อุ๊ปส์! อัปเดตไม่ได้น้า 😅 ลองอีกทีนะ"
    )
  }
}
