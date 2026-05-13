import { replyTextMessage, replyFlexMessage, replyMessage } from "@/lib/line/client"
import { getOrCreateSession, resetSession } from "../session-manager"
import { createRepairTicket, getReporterContext } from "./repair"
import { buildTicketCreatingFlex } from "../flex-builders/repair-status"
import { buildRepairTrackingFlex } from "@/lib/line/flex-builders/repair-tracking"
import { getQuickReplyForPostback } from "../suggestions"
import { buildTechnicianGroupNotifyFlex } from "@/lib/line/flex-builders/technician-group-notify"
import { pushToTechnicianGroup } from "@/lib/line/push-to-technician-group"
import type { RepairDetection } from "../types"
import type { RepairTimelineStep } from "@/lib/line/flex-builders/repair-tracking"

const URGENT_URGENCY = new Set(["urgent", "high"])

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
      await handleRemindBill(replyToken, params, lineUid)
      break

    case "confirm_payment":
      await replyMessage(replyToken, {
        type: "text",
        text: "บันทึกแล้วจ้า ทางหอจะตรวจสอบให้นะ ✅",
        quickReply: { items: getQuickReplyForPostback("confirm_payment") },
      })
      break

    case "event_register":
      await replyMessage(replyToken, {
        type: "text",
        text: "ลงทะเบียนกิจกรรมเรียบร้อยจ้า! 🎉 เจอกันวันงานน้า",
        quickReply: { items: getQuickReplyForPostback("event_register") },
      })
      break

    case "repair_book":
      await handleRepairBook(replyToken, params, lineUid)
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
  const specific_item = session.state_data?.specific_item as string | null | undefined

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
    specific_item,
  })

  if (ticket) {
    // Push to technician group only for urgent/high priority (low-noise strategy)
    if (URGENT_URGENCY.has(detection.urgency ?? "")) {
      const context = await getReporterContext(lineUid)
      const groupFlex = buildTechnicianGroupNotifyFlex({
        id: ticket.id,
        ticket_code: (ticket as any).ticket_code,
        title: detection.title,
        description: detection.description,
        category: detection.category,
        urgency: detection.urgency,
        requester_name: context.reporterName,
        building_name: context.roomInfo?.split(" ")?.[0],
      })
      pushToTechnicianGroup(groupFlex).catch(() => {})
    }

    try {
      // Fetch reporter context for the Flex card
      const context = await getReporterContext(lineUid)
      // Show "สร้างใบแจ้งซ่อมใหม่" flex with booking CTA (Design 28:370)
      await replyMessage(replyToken, {
        ...buildTicketCreatingFlex(
          {
            id: ticket.id,
            ticket_code: ticket.ticket_code,
            category: detection.category,
            title: detection.title,
            description: detection.description,
            urgency: detection.urgency,
            reporterName: context.reporterName,
            roomInfo: context.roomInfo,
            photoCount: photos.length,
          },
          context.reporterName
        ),
        quickReply: { items: getQuickReplyForPostback("repair_confirm") },
      } as Record<string, unknown>)
    } catch (err) {
      console.error("[Postback] Flex reply failed:", err)
      await replyMessage(replyToken, {
        type: "text",
        text: `📝 สร้างใบแจ้งซ่อมแล้วจ้า! หมายเลข #${ticket.ticket_code ?? ticket.id.slice(0, 8).toUpperCase()}\nนัดหมายกับช่างได้ในแอปนะ`,
        quickReply: { items: getQuickReplyForPostback("repair_confirm") },
      })
    }
  } else {
    await replyMessage(replyToken, {
      type: "text",
      text: "อุ๊ปส์! สร้างใบแจ้งซ่อมไม่สำเร็จน้า 😅 ลองลงทะเบียนในแอปก่อนแล้วแจ้งซ่อมใหม่อีกทีนะ",
      quickReply: { items: getQuickReplyForPostback("repair_confirm") },
    })
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
  await replyMessage(replyToken, {
    type: "text",
    text: "ยกเลิกแจ้งซ่อมแล้วนะ ✌️ ถ้าอยากแจ้งใหม่ก็พิมพ์มาได้เลยจ้า",
    quickReply: { items: getQuickReplyForPostback("repair_cancel") },
  })
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

async function handleRepairBook(
  replyToken: string,
  params: URLSearchParams,
  lineUid: string
): Promise<void> {
  const shortId = params.get("id") ?? ""
  const WEB_BASE = "https://c-madong-product.vercel.app/th"

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminDb = createAdminClient()
    const { data: profile } = await adminDb
      .from("profiles")
      .select("id")
      .eq("line_uid", lineUid)
      .single()

    if (profile) {
      const { data: tickets } = await adminDb
        .from("maintenance_requests")
        .select("id")
        .eq("requester_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10)

      const ticket = tickets?.find((t) => t.id.startsWith(shortId.toLowerCase()))
      if (ticket) {
        await replyMessage(replyToken, {
          type: "text",
          text: `🗓️ เลือกวันเวลานัดหมายได้เลยจ้า!\n\n${WEB_BASE}/booking/${ticket.id}`,
          quickReply: { items: getQuickReplyForPostback("repair_book") },
        })
        return
      }
    }
  } catch (err) {
    console.error("[Postback] Repair book lookup error:", err)
  }

  await replyMessage(replyToken, {
    type: "text",
    text: "🗓️ นัดหมายวันเวลาซ่อมได้ในแอปเลยนะจ้า!\nเปิดแอปหอพัก > แจ้งซ่อม > เลือกใบแจ้งซ่อม > นัดหมาย",
    quickReply: { items: getQuickReplyForPostback("repair_book") },
  })
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
      await replyMessage(replyToken, {
        type: "text",
        text: "หาข้อมูลไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ",
        quickReply: { items: getQuickReplyForPostback("repair_track") },
      })
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
      await replyMessage(replyToken, {
        type: "text",
        text: "ไม่พบใบแจ้งซ่อมน้า 🤔 ลองแจ้งซ่อมใหม่ได้เลย",
        quickReply: { items: getQuickReplyForPostback("repair_track") },
      })
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
    await replyMessage(replyToken, {
      ...buildRepairTrackingFlex({
        displayName,
        ticketId: ticket.id,
        steps,
      }),
      quickReply: { items: getQuickReplyForPostback("repair_track") },
    } as Record<string, unknown>)
  } catch (err) {
    console.error("[Postback] Repair track error:", err)
    await replyMessage(replyToken, {
      type: "text",
      text: "อุ๊ปส์! ดึงข้อมูลไม่ได้น้า 😅 ลองอีกทีนะ",
      quickReply: { items: getQuickReplyForPostback("repair_track") },
    })
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
      await replyMessage(replyToken, {
        type: "text",
        text: "หาข้อมูลไม่เจอน้า 🤔",
        quickReply: { items: getQuickReplyForPostback("repair_cancel_ticket") },
      })
      return
    }

    const shortId = params.get("id")
    if (!shortId) {
      await replyMessage(replyToken, {
        type: "text",
        text: "ไม่พบหมายเลขใบแจ้งซ่อมน้า 🤔",
        quickReply: { items: getQuickReplyForPostback("repair_cancel_ticket") },
      })
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
      await replyMessage(replyToken, {
        type: "text",
        text: "ไม่พบใบแจ้งซ่อมน้า 🤔",
        quickReply: { items: getQuickReplyForPostback("repair_cancel_ticket") },
      })
      return
    }

    if (ticket.status !== "pending" && ticket.status !== "acknowledged") {
      await replyMessage(replyToken, {
        type: "text",
        text: "ยกเลิกไม่ได้แล้วน้า 😅 เพราะช่างกำลังดำเนินการอยู่",
        quickReply: { items: getQuickReplyForPostback("repair_cancel_ticket") },
      })
      return
    }

    await adminDb
      .from("maintenance_requests")
      .update({ status: "cancelled" })
      .eq("id", ticket.id)

    await replyMessage(replyToken, {
      type: "text",
      text: `ยกเลิกใบแจ้งซ่อม #${shortId} เรียบร้อยแล้วจ้า ✅\nถ้าอยากแจ้งใหม่ก็พิมพ์มาได้เลยนะ`,
      quickReply: { items: getQuickReplyForPostback("repair_cancel_ticket") },
    })
  } catch (err) {
    console.error("[Postback] Cancel ticket error:", err)
    await replyMessage(replyToken, {
      type: "text",
      text: "อุ๊ปส์! ยกเลิกไม่ได้น้า 😅 ลองอีกทีนะ",
      quickReply: { items: getQuickReplyForPostback("repair_cancel_ticket") },
    })
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
      await replyMessage(replyToken, {
        type: "text",
        text: "หาข้อมูลไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ",
        quickReply: { items: getQuickReplyForPostback("repair_history") },
      })
      return
    }

    const { data: tickets } = await adminDb
      .from("maintenance_requests")
      .select("id, title, status, created_at")
      .eq("requester_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!tickets || tickets.length === 0) {
      await replyMessage(replyToken, {
        type: "text",
        text: "ยังไม่มีประวัติแจ้งซ่อมน้า 📝",
        quickReply: { items: getQuickReplyForPostback("repair_history") },
      })
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

    await replyMessage(replyToken, {
      type: "text",
      text: `📋 ประวัติแจ้งซ่อมล่าสุด\n\n${lines.join("\n\n")}`,
      quickReply: { items: getQuickReplyForPostback("repair_history") },
    })
  } catch (err) {
    console.error("[Postback] Repair history error:", err)
    await replyMessage(replyToken, {
      type: "text",
      text: "อุ๊ปส์! ดึงประวัติไม่ได้น้า 😅",
      quickReply: { items: getQuickReplyForPostback("repair_history") },
    })
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
      await replyMessage(replyToken, {
        type: "text",
        text: "หาข้อมูลน้องไม่เจอน้า 🤔 ลงทะเบียนในแอปก่อนนะ",
        quickReply: { items: getQuickReplyForPostback("confirm_parcel_received") },
      })
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
      await replyMessage(replyToken, {
        type: "text",
        text: `รับพัสดุเรียบร้อยแล้วจ้า ✅ (${count} ชิ้น)\nขอบคุณที่มารับนะ!`,
        quickReply: { items: getQuickReplyForPostback("confirm_parcel_received") },
      })
    } else {
      await replyMessage(replyToken, {
        type: "text",
        text: "ตอนนี้ไม่มีพัสดุรอรับแล้วน้า 📦✨",
        quickReply: { items: getQuickReplyForPostback("confirm_parcel_received") },
      })
    }
  } catch (err) {
    console.error("[Postback] Confirm parcel received error:", err)
    await replyMessage(replyToken, {
      type: "text",
      text: "อุ๊ปส์! อัปเดตไม่ได้น้า 😅 ลองอีกทีนะ",
      quickReply: { items: getQuickReplyForPostback("confirm_parcel_received") },
    })
  }
}

async function handleRemindBill(
  replyToken: string,
  params: URLSearchParams,
  lineUid: string
): Promise<void> {
  const billId = params.get("bill_id")
  const WEB_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://c-madong-product.vercel.app"

  if (!billId) {
    await replyMessage(replyToken, {
      type: "text",
      text: "ไม่พบข้อมูลบิลจ้า ลองเช็คบิลใหม่อีกครั้งนะ",
      quickReply: { items: getQuickReplyForPostback("remind_bill") },
    })
    return
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const adminDb = createAdminClient()

    // Fetch bill + owner profile in parallel
    const [billRes, profileRes] = await Promise.all([
      adminDb
        .from("bills")
        .select("id, total_amount, due_date, status, student_id")
        .eq("id", billId)
        .single(),
      adminDb
        .from("profiles")
        .select("id, line_uid, push_enabled")
        .eq("line_uid", lineUid)
        .single(),
    ])

    const bill = billRes.data
    const profile = profileRes.data

    if (!bill || !profile || bill.student_id !== profile.id) {
      await replyMessage(replyToken, {
        type: "text",
        text: "ไม่พบข้อมูลบิลจ้า ลองเช็คบิลใหม่อีกครั้งนะ",
        quickReply: { items: getQuickReplyForPostback("remind_bill") },
      })
      return
    }

    // Bill already paid → no reminder needed
    if (bill.status === "paid") {
      await replyMessage(replyToken, {
        type: "text",
        text: "บิลนี้ชำระแล้วจ้า ✅ ไม่ต้องเตือนแล้วนะ",
        quickReply: { items: getQuickReplyForPostback("remind_bill") },
      })
      return
    }

    // Clear dedup entries for this bill so cron can push again
    // Matches payload_hash patterns for all day-windows of this bill
    const { hashPayload } = await import("@/lib/notifications/push-gate")
    const hashes = [0, 1, 3].map((d) => hashPayload(`bill_due:${billId}:${d}`))
    await adminDb
      .from("notification_dispatch_log")
      .delete()
      .eq("user_id", profile.id)
      .eq("notification_type", "bill")
      .in("payload_hash", hashes)

    // Compute due date info for the reply message
    const now = new Date()
    const dueMs = new Date(bill.due_date).getTime()
    const daysUntilDue = Math.ceil((dueMs - now.getTime()) / (1000 * 60 * 60 * 24))

    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    const d = new Date(bill.due_date)
    const dueDateTh = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`

    let reminderDetail: string
    if (daysUntilDue <= 0) {
      reminderDetail = "บิลนี้ครบกำหนดแล้วจ้า — น้องซีจะส่งการแจ้งเตือนพรุ่งนี้เช้า (09:00 น.) 🔔"
    } else if (daysUntilDue === 1) {
      reminderDetail = "น้องซีจะเตือนอีกครั้งพรุ่งนี้เช้า (09:00 น.) ก่อนครบกำหนดนะ 🔔"
    } else {
      reminderDetail = `น้องซีจะเตือนอีกครั้งพรุ่งนี้เช้า (09:00 น.) และวันที่ ${dueDateTh} จ้า 🔔`
    }

    await replyMessage(replyToken, {
      type: "text",
      text: `ตั้งการแจ้งเตือนแล้วจ้า! ✅\n\n${reminderDetail}\n\n💰 ยอด ฿${bill.total_amount.toLocaleString()} — ครบกำหนด ${dueDateTh}\n\nชำระล่วงหน้าได้เลยที่ปุ่มด้านล่างนะ 👇`,
      quickReply: {
        items: [
          { type: "action", action: { type: "uri", label: "💳 ไปชำระเงิน", uri: `${WEB_BASE}/th/billing` } },
          { type: "action", action: { type: "message", label: "🏠 เมนูหลัก", text: "เมนู" } },
        ],
      },
    })
  } catch (err) {
    console.error("[Postback] RemindBill error:", err)
    await replyMessage(replyToken, {
      type: "text",
      text: "อุ๊ปส์! เกิดข้อผิดพลาดน้า 😅 ลองอีกทีนะ",
      quickReply: { items: getQuickReplyForPostback("remind_bill") },
    })
  }
}
