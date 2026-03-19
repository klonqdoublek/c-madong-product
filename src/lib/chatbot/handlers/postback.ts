import { replyTextMessage, replyFlexMessage } from "@/lib/line/client"
import { getOrCreateSession, resetSession } from "../session-manager"
import { createRepairTicket, getReporterContext } from "./repair"
import { buildRepairStatusFlex } from "../flex-builders/repair-status"
import { buildRepairTrackingFlex } from "@/lib/line/flex-builders/repair-tracking"
import type { RepairDetection } from "../types"
import type { RepairTimelineStep } from "@/lib/line/flex-builders/repair-tracking"

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

    case "repair_track":
      await handleRepairTrack(replyToken, params, lineUid)
      break

    case "repair_cancel_ticket":
      await handleRepairCancelTicket(replyToken, params, lineUid)
      break

    case "repair_history":
      await handleRepairHistory(replyToken, lineUid)
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
    try {
      // Fetch reporter context for the Flex card
      const context = await getReporterContext(lineUid)
      await replyFlexMessage(
        replyToken,
        buildRepairStatusFlex(
          {
            id: ticket.id,
            category: detection.category,
            title: detection.title,
            description: detection.description,
            urgency: detection.urgency,
            reporterName: context.reporterName,
            roomInfo: context.roomInfo,
            photoCount: photos.length,
          },
          context.reporterName
        )
      )
    } catch (err) {
      console.error("[Postback] Flex reply failed:", err)
      await replyTextMessage(
        replyToken,
        `✅ แจ้งซ่อมสำเร็จแล้วจ้า! หมายเลข #${ticket.id.slice(0, 8).toUpperCase()}`
      )
    }
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

const SPECIALTY_LABELS: Record<string, string> = {
  electrical: "ช่างไฟฟ้า",
  plumbing: "ช่างประปา",
  air_conditioning: "ช่างแอร์",
  general: "ช่างทั่วไป",
  furniture: "ช่างเฟอร์นิเจอร์",
  internet: "ช่างอินเทอร์เน็ต",
  door_lock: "ช่างกุญแจ",
}

async function handleRepairTrack(
  replyToken: string,
  params: URLSearchParams,
  lineUid: string
): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminDb = createAdminClient()

    // Find user profile
    const { data: profile } = await adminDb
      .from("profiles")
      .select("id, display_name")
      .eq("line_uid", lineUid)
      .single()

    if (!profile) {
      await replyTextMessage(replyToken, "หาข้อมูลไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ")
      return
    }

    // Find ticket — fetch recent tickets and match short ID prefix in JS
    // (ilike doesn't work on UUID columns in Postgres)
    const shortId = params.get("id")?.toLowerCase()
    const { data: tickets } = await adminDb
      .from("maintenance_requests")
      .select("id, status, category, title, technician_id, created_at, accepted_at, resolved_at, updated_at")
      .eq("requester_id", profile.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(10)

    let ticket = tickets?.[0]
    if (shortId && tickets) {
      const matched = tickets.find((t) => t.id.startsWith(shortId))
      if (matched) ticket = matched
    }

    if (!ticket) {
      await replyTextMessage(replyToken, "ไม่พบใบแจ้งซ่อมน้า 🤔 ลองแจ้งซ่อมใหม่ได้เลย")
      return
    }

    // Fetch technician info if assigned
    let techName: string | undefined
    let techRole: string | undefined
    if (ticket.technician_id) {
      const { data: tech } = await adminDb
        .from("technicians")
        .select("display_name, specialty")
        .eq("id", ticket.technician_id)
        .single()
      if (tech) {
        techName = tech.display_name
        techRole = SPECIALTY_LABELS[tech.specialty] ?? tech.specialty
      }
    }

    // Build timeline steps from ticket timestamps
    const steps: RepairTimelineStep[] = []
    const now = new Date()
    const todayStr = now.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    // Step 1: Created (always exists)
    const createdDate = new Date(ticket.created_at)
    const createdDateStr = createdDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    steps.push({
      label: "ส่งคำขอไปยังเจ้าหน้าที่แล้ว",
      subLabel: ticket.id.slice(0, 11).toUpperCase(),
      date: createdDateStr,
      time: formatTime(createdDate),
      isActive: ticket.status === "pending",
      isToday: createdDateStr === todayStr,
    })

    // Step 2: Acknowledged
    if (ticket.accepted_at || ticket.status === "acknowledged" || ticket.status === "in_progress" || ticket.status === "completed") {
      const acceptedDate = ticket.accepted_at ? new Date(ticket.accepted_at) : new Date(ticket.updated_at)
      const acceptedDateStr = acceptedDate.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      steps.push({
        label: "ช่างได้รับคำขอแล้ว",
        date: acceptedDateStr,
        time: formatTime(acceptedDate),
        isActive: ticket.status === "acknowledged",
        isToday: acceptedDateStr === todayStr,
        details: {
          technicianName: techName,
          technicianRole: techRole,
        },
      })
    }

    // Step 3: In Progress
    if (ticket.status === "in_progress" || ticket.status === "completed") {
      const inProgressDate = new Date(ticket.updated_at)
      const inProgressDateStr = inProgressDate.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      steps.push({
        label: ticket.status === "completed"
          ? "ซ่อมเสร็จเรียบร้อยแล้ว!"
          : "ช่างกำลังดำเนินการเข้าซ่อม",
        date: inProgressDateStr,
        time: formatTime(inProgressDate),
        isActive: true,
        isToday: inProgressDateStr === todayStr,
      })
    }

    const displayName = profile.display_name ?? "คุณ"
    await replyFlexMessage(
      replyToken,
      buildRepairTrackingFlex({
        displayName,
        ticketId: ticket.id,
        steps,
      })
    )
  } catch (err) {
    console.error("[Postback] Repair track error:", err)
    await replyTextMessage(replyToken, "อุ๊ปส์! ดึงข้อมูลไม่ได้น้า 😅 ลองอีกทีนะ")
  }
}

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")} น.`
}

async function handleRepairCancelTicket(
  replyToken: string,
  params: URLSearchParams,
  lineUid: string
): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminDb = createAdminClient()

    const { data: profile } = await adminDb
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single()

    if (!profile) {
      await replyTextMessage(replyToken, "หาข้อมูลไม่เจอน้า 🤔")
      return
    }

    const shortId = params.get("id")
    if (!shortId) {
      await replyTextMessage(replyToken, "ไม่พบหมายเลขใบแจ้งซ่อมน้า 🤔")
      return
    }

    // Find ticket — fetch recent and match short ID in JS (ilike doesn't work on UUID)
    const { data: tickets } = await adminDb
      .from("maintenance_requests")
      .select("id, status")
      .eq("requester_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const ticket = tickets?.find((t) => t.id.startsWith(shortId.toLowerCase()))
    if (!ticket) {
      await replyTextMessage(replyToken, "ไม่พบใบแจ้งซ่อมน้า 🤔")
      return
    }

    if (ticket.status !== "pending" && ticket.status !== "acknowledged") {
      await replyTextMessage(
        replyToken,
        "ยกเลิกไม่ได้แล้วน้า 😅 เพราะช่างกำลังดำเนินการอยู่"
      )
      return
    }

    await adminDb
      .from("maintenance_requests")
      .update({ status: "cancelled" })
      .eq("id", ticket.id)

    await replyTextMessage(
      replyToken,
      `ยกเลิกใบแจ้งซ่อม #${shortId} เรียบร้อยแล้วจ้า ✅\nถ้าอยากแจ้งใหม่ก็พิมพ์มาได้เลยนะ`
    )
  } catch (err) {
    console.error("[Postback] Cancel ticket error:", err)
    await replyTextMessage(replyToken, "อุ๊ปส์! ยกเลิกไม่ได้น้า 😅 ลองอีกทีนะ")
  }
}

async function handleRepairHistory(
  replyToken: string,
  lineUid: string
): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminDb = createAdminClient()

    const { data: profile } = await adminDb
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single()

    if (!profile) {
      await replyTextMessage(replyToken, "หาข้อมูลไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ")
      return
    }

    const { data: tickets } = await adminDb
      .from("maintenance_requests")
      .select("id, title, status, created_at")
      .eq("requester_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!tickets || tickets.length === 0) {
      await replyTextMessage(replyToken, "ยังไม่มีประวัติแจ้งซ่อมน้า 📝")
      return
    }

    const STATUS_EMOJI: Record<string, string> = {
      pending: "🟡",
      acknowledged: "🔵",
      in_progress: "🟣",
      completed: "✅",
      cancelled: "⚪",
    }

    const lines = tickets.map((t, i) => {
      const emoji = STATUS_EMOJI[t.status] ?? "⚪"
      const shortId = t.id.slice(0, 8).toUpperCase()
      const date = new Date(t.created_at).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      })
      return `${i + 1}. ${emoji} #${shortId} ${t.title}\n   ${date}`
    })

    await replyTextMessage(
      replyToken,
      `📋 ประวัติแจ้งซ่อมล่าสุด\n\n${lines.join("\n\n")}`
    )
  } catch (err) {
    console.error("[Postback] Repair history error:", err)
    await replyTextMessage(replyToken, "อุ๊ปส์! ดึงประวัติไม่ได้น้า 😅")
  }
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
