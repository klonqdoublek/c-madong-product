import type { FlexMessagePayload } from "./bill-reminder"

// Design tokens matching Figma "Status" (node 1:1241)
const SUCCESS_GREEN = "#23BE47"
const TEXT_PRIMARY = "#000000"
const TEXT_SECONDARY = "#00000099"
const TEXT_MUTED = "#929292"
const LINK_BLUE = "#0059FF"
const TIMELINE_INACTIVE = "#CCCCCC"

export interface RepairTimelineStep {
  /** Step label (e.g. "ส่งคำขอไปยังเจ้าหน้าที่แล้ว") */
  label: string
  /** Optional sub-label (e.g. ticket number) */
  subLabel?: string
  /** Date string (e.g. "13 มกราคม 2569") */
  date: string
  /** Time string (e.g. "13.00 น.") */
  time: string
  /** Whether this is the current/active step */
  isActive: boolean
  /** Whether today marker should show */
  isToday?: boolean
  /** Optional details like technician name */
  details?: {
    technicianName?: string
    technicianRole?: string
    estimatedCompletion?: string
  }
}

export interface RepairTrackingData {
  /** Display name of student */
  displayName: string
  /** Ticket ID */
  ticketId: string
  /** Timeline steps */
  steps: RepairTimelineStep[]
}

const LIFF_URL = process.env.NEXT_PUBLIC_LINE_LIFF_ID
  ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LINE_LIFF_ID}`
  : null

/**
 * Status tracking Flex with vertical timeline — matches Figma "ติดตามสถานะ" design
 */
export function buildRepairTrackingFlex(
  data: RepairTrackingData
): FlexMessagePayload {
  const shortId = data.ticketId.slice(0, 11).toUpperCase()

  // Build timeline rows
  const timelineContents: Record<string, unknown>[] = []

  for (let i = 0; i < data.steps.length; i++) {
    const step = data.steps[i]
    const isLast = i === data.steps.length - 1
    const dotColor = step.isActive ? SUCCESS_GREEN : TIMELINE_INACTIVE
    const textColor = step.isActive ? SUCCESS_GREEN : TEXT_SECONDARY

    // Build right-side content
    const rightContents: Record<string, unknown>[] = [
      {
        type: "text",
        text: step.label,
        size: "sm",
        color: textColor,
        weight: "bold",
        wrap: true,
      },
    ]

    // Sub-label (e.g. ticket number)
    if (step.subLabel) {
      rightContents.push({
        type: "box",
        layout: "horizontal",
        spacing: "xs",
        contents: [
          {
            type: "text",
            text: "หมายเลข:",
            size: "xxs",
            color: TEXT_SECONDARY,
            flex: 0,
          },
          {
            type: "text",
            text: step.subLabel,
            size: "xxs",
            color: TEXT_PRIMARY,
            weight: "bold",
            flex: 0,
          },
        ],
        margin: "xs",
      })
    }

    // Technician details
    if (step.details?.technicianName) {
      rightContents.push({
        type: "box",
        layout: "horizontal",
        spacing: "xs",
        contents: [
          {
            type: "text",
            text: "ชื่อช่าง",
            size: "xxs",
            color: TEXT_PRIMARY,
            flex: 0,
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: step.details.technicianName,
                size: "xxs",
                color: TEXT_PRIMARY,
                weight: "bold",
              },
              ...(step.details.technicianRole
                ? [
                    {
                      type: "text",
                      text: step.details.technicianRole,
                      size: "xxs",
                      color: TEXT_MUTED,
                    },
                  ]
                : []),
            ],
            flex: 1,
          },
        ],
        margin: "xs",
      })
    }

    // Estimated completion
    if (step.details?.estimatedCompletion) {
      rightContents.push({
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "คาดว่าจะเสร็จสิ้นภายใน",
            size: "xxs",
            color: TEXT_PRIMARY,
          },
          {
            type: "text",
            text: step.details.estimatedCompletion,
            size: "xxs",
            color: TEXT_PRIMARY,
          },
        ],
        margin: "xs",
      })
    }

    // Build left-side date/time
    const leftContents: Record<string, unknown>[] = []
    if (step.isToday) {
      leftContents.push({
        type: "text",
        text: "วันนี้",
        size: "xxs",
        color: SUCCESS_GREEN,
        weight: "bold",
      })
    }
    leftContents.push(
      {
        type: "text",
        text: step.date,
        size: "xxs",
        color: step.isActive ? TEXT_PRIMARY : TEXT_SECONDARY,
        weight: "bold",
      },
      {
        type: "text",
        text: step.time,
        size: "xxs",
        color: step.isActive ? TEXT_PRIMARY : TEXT_SECONDARY,
        weight: "bold",
      }
    )

    // Timeline row: [date/time] [dot + line] [content]
    timelineContents.push({
      type: "box",
      layout: "horizontal",
      spacing: "md",
      contents: [
        // Left: date/time
        {
          type: "box",
          layout: "vertical",
          contents: leftContents,
          flex: 3,
          justifyContent: "center",
        },
        // Middle: dot + vertical line
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [{ type: "filler" }],
              width: "12px",
              height: "12px",
              cornerRadius: "6px",
              backgroundColor: dotColor,
            },
            // Vertical line (skip for last item)
            ...(!isLast
              ? [
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [{ type: "filler" }],
                    width: "2px",
                    backgroundColor: dotColor,
                    flex: 1,
                    offsetStart: "5px",
                  },
                ]
              : []),
          ],
          flex: 0,
          alignItems: "center",
          width: "20px",
        },
        // Right: step content
        {
          type: "box",
          layout: "vertical",
          contents: rightContents,
          flex: 6,
          paddingBottom: isLast ? "none" : "lg",
        },
      ],
    })
  }

  return {
    type: "flex",
    altText: `ติดตามสถานะ: #${shortId}`,
    contents: {
      type: "bubble",
      size: "mega",

      // ── Green header: ติดตามสถานะ ──
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ติดตามสถานะ",
            size: "xxl",
            color: "#FFFFFF",
            weight: "bold",
          },
          {
            type: "text",
            text: `@${data.displayName}`,
            size: "md",
            color: "#FFFFFF",
            margin: "sm",
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
                color: "#FFFFFF99",
                flex: 0,
              },
              {
                type: "text",
                text: shortId,
                size: "sm",
                color: "#FFFFFF",
                weight: "bold",
                flex: 0,
              },
            ],
            margin: "md",
          },
        ],
        backgroundColor: SUCCESS_GREEN,
        paddingAll: "xl",
        paddingBottom: "lg",
      },

      // ── Body: vertical timeline ──
      body: {
        type: "box",
        layout: "vertical",
        contents: timelineContents,
        paddingAll: "lg",
      },

      // ── Footer: link ──
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
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
        paddingAll: "sm",
      },
      styles: { footer: { separator: true } },
    },
  }
}

/** Helper to build tracking data from maintenance request + status history */
export function buildTrackingSteps(
  ticketId: string,
  currentStatus: string,
  statusHistory: Array<{
    status: string
    changed_at: string
    technician_name?: string
    technician_role?: string
    estimated_completion?: string
  }>
): RepairTimelineStep[] {
  const shortId = ticketId.slice(0, 11).toUpperCase()
  const today = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Default steps based on status flow
  const steps: RepairTimelineStep[] = []

  for (const entry of statusHistory) {
    const entryDate = new Date(entry.changed_at)
    const dateStr = entryDate.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    const timeStr = `${entryDate.getHours().toString().padStart(2, "0")}.${entryDate.getMinutes().toString().padStart(2, "0")} น.`
    const isToday =
      dateStr === today

    switch (entry.status) {
      case "pending":
        steps.push({
          label: "ส่งคำขอไปยังเจ้าหน้าที่แล้ว",
          subLabel: shortId,
          date: dateStr,
          time: timeStr,
          isActive: currentStatus === "pending",
          isToday,
        })
        break
      case "acknowledged":
        steps.push({
          label: "ช่างได้รับคำขอแล้ว",
          date: dateStr,
          time: timeStr,
          isActive: currentStatus === "acknowledged",
          isToday,
          details: {
            technicianName: entry.technician_name,
            technicianRole: entry.technician_role,
          },
        })
        break
      case "in_progress":
        steps.push({
          label: "ช่างกำลังดำเนินการเข้าซ่อม",
          date: dateStr,
          time: timeStr,
          isActive: currentStatus === "in_progress",
          isToday,
          details: {
            technicianName: entry.technician_name,
            technicianRole: entry.technician_role,
            estimatedCompletion: entry.estimated_completion,
          },
        })
        break
      case "completed":
        steps.push({
          label: "ซ่อมเสร็จเรียบร้อยแล้ว!",
          date: dateStr,
          time: timeStr,
          isActive: true,
          isToday,
        })
        break
    }
  }

  return steps
}

export const DEMO_TRACKING_DATA: RepairTrackingData = {
  displayName: "ข้าวกล้อง :)",
  ticketId: "0123456789A",
  steps: [
    {
      label: "ส่งคำขอไปยังเจ้าหน้าที่แล้ว",
      subLabel: "0123456789A",
      date: "13 มกราคม 2569",
      time: "13.00 น.",
      isActive: false,
    },
    {
      label: "ช่างได้รับคำขอแล้ว",
      date: "13 มกราคม 2569",
      time: "14.00 น.",
      isActive: false,
      details: {
        technicianName: "นายสมชาย สายชล",
        technicianRole: "ช่างประปา",
      },
    },
    {
      label: "ช่างกำลังดำเนินการเข้าซ่อม",
      date: "14 มกราคม 2569",
      time: "14.00 น.",
      isActive: true,
      isToday: true,
      details: {
        estimatedCompletion: "15.00 น.",
      },
    },
  ],
}
