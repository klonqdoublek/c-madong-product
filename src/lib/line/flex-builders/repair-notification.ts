import type { FlexMessagePayload } from "./bill-reminder";
import type { MaintenanceStatus } from "@/lib/supabase/types";

interface RepairNotificationData {
  ticketTitle: string;
  category: string;
  status: MaintenanceStatus;
  statusLabel: string;
  technicianName?: string;
  adminNotes?: string;
  failureReason?: string;
}

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  pending: "#F59E0B",
  acknowledged: "#3B82F6",
  in_progress: "#8B5CF6",
  completed: "#10B981",
  cancelled: "#6B7280",
};

export function buildRepairNotificationFlex(
  data: RepairNotificationData
): FlexMessagePayload {
  const statusColor = STATUS_COLORS[data.status];

  const bodyContents: unknown[] = [
    {
      type: "text",
      text: "แจ้งเตือนสถานะงานซ่อม",
      weight: "bold",
      size: "lg",
      color: "#E5487A",
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
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "หัวข้อ", size: "sm", color: "#888888", flex: 3 },
            { type: "text", text: data.ticketTitle, size: "sm", flex: 7, wrap: true },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "ประเภท", size: "sm", color: "#888888", flex: 3 },
            { type: "text", text: data.category, size: "sm", flex: 7 },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "text", text: "สถานะ", size: "sm", color: "#888888", flex: 3 },
            {
              type: "text",
              text: data.statusLabel,
              size: "sm",
              color: statusColor,
              weight: "bold",
              flex: 7,
            },
          ],
        },
      ],
    },
  ];

  if (data.technicianName) {
    (bodyContents[2] as { contents: unknown[] }).contents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "ช่าง", size: "sm", color: "#888888", flex: 3 },
        { type: "text", text: data.technicianName, size: "sm", flex: 7 },
      ],
    });
  }

  if (data.adminNotes) {
    (bodyContents[2] as { contents: unknown[] }).contents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "หมายเหตุ", size: "sm", color: "#888888", flex: 3 },
        { type: "text", text: data.adminNotes, size: "sm", flex: 7, wrap: true },
      ],
    });
  }

  if (data.failureReason) {
    (bodyContents[2] as { contents: unknown[] }).contents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "เหตุผล", size: "sm", color: "#888888", flex: 3 },
        { type: "text", text: data.failureReason, size: "sm", flex: 7, wrap: true },
      ],
    });
  }

  return {
    type: "flex",
    altText: `สถานะงานซ่อม: ${data.statusLabel}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: bodyContents,
      },
    },
  };
}
