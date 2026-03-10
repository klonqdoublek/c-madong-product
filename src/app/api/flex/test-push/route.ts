import { NextRequest, NextResponse } from "next/server"
import { z } from "zod/v4"
import { pushFlexMessage } from "@/lib/line/client"
import { buildRepairConfirmFlex } from "@/lib/chatbot/flex-builders/repair-confirm"
import {
  buildParcelNotificationFlex,
  DEMO_PARCEL_DATA,
} from "@/lib/line/flex-builders/parcel-notification"
import type { RepairDetection } from "@/lib/chatbot/types"

const DEMO_REPAIR_DETECTION: RepairDetection = {
  category: "plumbing",
  title: "ก๊อกน้ำไม่ไหล",
  description: "ก๊อกน้ำไม่ไหลมา 2 วันแล้ว ตามช่างด่วนๆ",
  urgency: "high",
}

const DEMO_REPAIR_CONTEXT = {
  ticketNumber: "0123456789A",
  reporterName: "ข้าวกล้อง :)",
  roomInfo: "ชั้น 11 ตึกชวนชม 1116B",
}

const bodySchema = z.object({
  lineUid: z.string().min(1, "lineUid is required"),
  template: z.enum(["repair", "parcel", "both"]),
})

/**
 * POST /api/flex/test-push
 * Push test Flex Messages (repair confirm and/or parcel notification)
 *
 * Body: { lineUid: "Uxxxx", template: "repair" | "parcel" | "both" }
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = bodySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    )
  }

  const { lineUid, template } = result.data
  const sent: string[] = []

  try {
    if (template === "repair" || template === "both") {
      const repairFlex = buildRepairConfirmFlex(
        DEMO_REPAIR_DETECTION,
        DEMO_REPAIR_CONTEXT,
        0
      )
      await pushFlexMessage(lineUid, repairFlex)
      sent.push("repair")
    }

    if (template === "parcel" || template === "both") {
      const parcelFlex = buildParcelNotificationFlex(DEMO_PARCEL_DATA)
      await pushFlexMessage(lineUid, parcelFlex)
      sent.push("parcel")
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send LINE message"
    const detail = err instanceof Error ? err.stack : String(err)
    console.error("[test-push] LINE error:", detail)
    return NextResponse.json(
      { error: message, detail: String(err), sent },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, sent })
}

/**
 * GET /api/flex/test-push?template=repair|parcel
 * Preview Flex JSON without sending
 */
export async function GET(request: NextRequest) {
  const template = request.nextUrl.searchParams.get("template") ?? "both"

  const result: Record<string, unknown> = {}

  if (template === "repair" || template === "both") {
    result.repair = buildRepairConfirmFlex(
      DEMO_REPAIR_DETECTION,
      DEMO_REPAIR_CONTEXT,
      0
    )
  }

  if (template === "parcel" || template === "both") {
    result.parcel = buildParcelNotificationFlex(DEMO_PARCEL_DATA)
  }

  return NextResponse.json(result)
}
