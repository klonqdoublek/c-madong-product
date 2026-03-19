import type { FlexMessagePayload } from "./bill-reminder"
import type { MaintenanceStatus } from "@/lib/supabase/types"

// Design tokens
const SUCCESS_GREEN = "#23BE47"
const CU_PINK = "#E5487A"
const LINK_BLUE = "#0059FF"
const TEXT_SECONDARY = "#00000099"
const TEXT_MUTED = "#565655"

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  pending: "#F59E0B",
  acknowledged: "#3B82F6",
  in_progress: "#8B5CF6",
  completed: "#10B981",
  cancelled: "#6B7280",
}

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  pending: "รอดำเนินการ",
  acknowledged: "รับเรื่องแล้ว",
  in_progress: "กำลังดำเนินการ",
  completed: "ซ่อมสำเร็จ",
  cancelled: "ยกเลิก",
}

export interface RepairNotificationData {
  ticketId: string
  ticketTitle: string
  category: string
  status: MaintenanceStatus
  statusLabel?: string
  technicianName?: string
  adminNotes?: string
  failureReason?: string
  displayName?: string
}

const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LINE_LIFF_ID}`
  : null

/**
 * Push notification when admin changes repair ticket status.
 * For "completed" status: uses the Figma "ซ่อมสำเร็จ" design (node 1:942)
 * For other statuses: uses a standard notification layout
 */
export function buildRepairNotificationFlex(
  data: RepairNotificationData
): FlexMessagePayload {
  if (data.status === "completed") {
    return buildCompletedFlex(data)
  }
  return buildStatusUpdateFlex(data)
}

/**
 * "✅ ซ่อมสำเร็จ!" — green header + completion notice + review CTA
 * Matches Figma "Request Done" (node 1:942)
 */
function buildCompletedFlex(data: RepairNotificationData): FlexMessagePayload {
  const shortId = data.ticketId.slice(0, 11).toUpperCase()
  const displayName = data.displayName ?? "คุณ"

  return {
    type: "flex",
    altText: `✅ ซ่อมสำเร็จ! ${data.ticketTitle}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Green header with badge + title ──
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          // "แจ้งเตือน" badge
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "แจ้งเตือน",
                    size: "xxs",
                    color: TEXT_MUTED,
                    weight: "bold",
                    flex: 0,
                  },
                ],
                backgroundColor: "#FFFFFF",
                cornerRadius: "xxl",
                paddingStart: "md",
                paddingEnd: "md",
                paddingTop: "xs",
                paddingBottom: "xs",
              },
              { type: "filler" },
            ],
          },
          {
            type: "text",
            text: "✅ ซ่อมสำเร็จ!",
            size: "xxl",
            color: "#FFFFFF",
            weight: "bold",
            margin: "md",
          },
          {
            type: "text",
            text: `@${displayName}`,
            size: "md",
            color: "#FFFFFF",
            margin: "sm",
          },
        ],
        backgroundColor: SUCCESS_GREEN,
        paddingAll: "xl",
        paddingBottom: "lg",
      },

      // ── Body: completion details ──
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "🎉 การซ่อมสำเร็จ",
            size: "sm",
            color: TEXT_SECONDARY,
            weight: "bold",
          },
          {
            type: "box",
            layout: "horizontal",
            spacing: "lg",
            contents: [
              {
                type: "text",
                text: "หมายเลข:",
                size: "sm",
                color: TEXT_SECONDARY,
                flex: 3,
              },
              {
                type: "text",
                text: shortId,
                size: "sm",
                color: TEXT_SECONDARY,
                weight: "bold",
                flex: 5,
              },
            ],
          },
        ],
        paddingAll: "xl",
      },

      // ── Footer: review + history ──
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          // Green button: ประเมินการแจ้งซ่อมครั้งนี้
          {
            type: "button",
            style: "primary",
            color: SUCCESS_GREEN,
            height: "sm",
            action: LIFF_URL
              ? {
                  type: "uri",
                  label: "ประเมินการแจ้งซ่อมครั้งนี้",
                  uri: `${LIFF_URL}/maintenance/${data.ticketId}/review`,
                }
              : {
                  type: "postback",
                  label: "ประเมินการแจ้งซ่อมครั้งนี้",
                  data: `action=repair_review&id=${shortId}`,
                  displayText: "ประเมินการแจ้งซ่อม",
                },
          },
          // Blue link: ดูประวัติการแจ้งซ่อม
          {
            type: "button",
            style: "link",
            color: LINK_BLUE,
            height: "sm",
            action: LIFF_URL
              ? {
                  type: "uri",
                  label: "ดูประวัติการแจ้งซ่อม",
                  uri: `${LIFF_URL}/maintenance`,
                }
              : {
                  type: "postback",
                  label: "ดูประวัติการแจ้งซ่อม",
                  data: "action=repair_history",
                  displayText: "ดูประวัติการแจ้งซ่อม",
                },
          },
        ],
        paddingAll: "lg",
      },
      styles: { footer: { separator: true } },
    },
  }
}

/**
 * Standard status update notification (for non-completed statuses)
 */
function buildStatusUpdateFlex(
  data: RepairNotificationData
): FlexMessagePayload {
  const statusColor = STATUS_COLORS[data.status]
  const statusLabel = data.statusLabel ?? STATUS_LABELS[data.status]

  const detailRows: Record<string, unknown>[] = [
    buildRow("หัวข้อ", data.ticketTitle),
    buildRow("ประเภท", data.category),
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "สถานะ", size: "sm", color: "#888888", flex: 3 },
        {
          type: "text",
          text: statusLabel,
          size: "sm",
          color: statusColor,
          weight: "bold",
          flex: 7,
        },
      ],
    },
  ]

  if (data.technicianName) {
    detailRows.push(buildRow("ช่าง", data.technicianName))
  }
  if (data.adminNotes) {
    detailRows.push(buildRow("หมายเหตุ", data.adminNotes))
  }
  if (data.failureReason) {
    detailRows.push(buildRow("เหตุผล", data.failureReason))
  }

  return {
    type: "flex",
    altText: `สถานะงานซ่อม: ${statusLabel}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "แจ้งเตือนสถานะงานซ่อม",
            weight: "bold",
            size: "lg",
            color: CU_PINK,
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: detailRows,
          },
        ],
      },
    },
  }
}

function buildRow(label: string, value: string) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: label, size: "sm", color: "#888888", flex: 3 },
      { type: "text", text: value, size: "sm", flex: 7, wrap: true },
    ],
  }
}
