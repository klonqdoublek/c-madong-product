import { NextRequest, NextResponse } from "next/server"
import { z } from "zod/v4"
import {
  buildBillReminderFlex,
  DEMO_BILL_DATA,
} from "@/lib/line/flex-builders/bill-reminder"
import { pushFlexMessage } from "@/lib/line/client"
import type { BillData } from "@/lib/line/types"

/**
 * GET /api/flex/bill-reminder
 * Preview/generate Flex JSON. Use ?demo=true for sample data.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const isDemo =
    params.get("demo") === "true" || params.size === 0

  let billData: BillData

  if (isDemo) {
    billData = DEMO_BILL_DATA
  } else {
    // Build from query params
    const itemsRaw = params.get("items")
    let items: BillData["items"] = DEMO_BILL_DATA.items
    if (itemsRaw) {
      try {
        items = JSON.parse(itemsRaw)
      } catch {
        return NextResponse.json(
          { error: "Invalid items JSON" },
          { status: 400 }
        )
      }
    }

    billData = {
      billId: params.get("billId") ?? "bill-preview",
      month: params.get("month") ?? "มกราคม",
      totalAmount: Number(params.get("totalAmount")) || 0,
      dueRound: Number(params.get("dueRound")) || 1,
      dueDate: params.get("dueDate") ?? "5 กุมภาพันธ์ 2569",
      dueTime: params.get("dueTime") ?? "17.30น.",
      studentName: params.get("studentName") ?? "ชื่อนิสิต",
      buildingName: params.get("buildingName") ?? "ชวนชม",
      roomNumber: params.get("roomNumber") ?? "0000",
      bedLabel: params.get("bedLabel") ?? "A",
      items,
      bannerImageUrl: params.get("bannerImageUrl") ?? undefined,
    }
  }

  const flexMessage = buildBillReminderFlex(billData)

  return NextResponse.json(flexMessage)
}

const postBodySchema = z.object({
  lineUid: z.string().min(1, "lineUid is required"),
  billData: z.object({
    billId: z.string(),
    month: z.string(),
    totalAmount: z.number(),
    dueRound: z.number(),
    dueDate: z.string(),
    dueTime: z.string(),
    studentName: z.string(),
    buildingName: z.string(),
    roomNumber: z.string(),
    bedLabel: z.string(),
    items: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
      })
    ),
    bannerImageUrl: z.string().optional(),
  }),
})

/**
 * POST /api/flex/bill-reminder
 * Send bill reminder Flex Message to a LINE user.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const result = postBodySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    )
  }

  const { lineUid, billData } = result.data
  const flexMessage = buildBillReminderFlex(billData)

  try {
    await pushFlexMessage(lineUid, flexMessage)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send LINE message"
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
