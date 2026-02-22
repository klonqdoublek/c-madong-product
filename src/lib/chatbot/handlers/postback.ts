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

    case "event_register":
      await replyTextMessage(
        replyToken,
        "ลงทะเบียนกิจกรรมเรียบร้อยจ้า! 🎉 เจอกันวันงานน้า"
      )
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
  const detection: RepairDetection = {
    category: params.get("category") ?? "other",
    title: decodeURIComponent(params.get("title") ?? ""),
    description: decodeURIComponent(params.get("description") ?? ""),
    urgency: (params.get("urgency") as RepairDetection["urgency"]) ?? "medium",
  }

  const ticket = await createRepairTicket(lineUid, detection)

  if (ticket) {
    await replyFlexMessage(
      replyToken,
      buildRepairStatusFlex({
        id: ticket.id,
        category: detection.category,
        title: detection.title,
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
