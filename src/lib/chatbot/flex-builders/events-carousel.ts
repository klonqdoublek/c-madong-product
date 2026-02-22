import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const PRIMARY = "#7C3AED"

interface DormEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description?: string
}

/** Events carousel Flex (up to 10 bubbles) */
export function buildEventsCarouselFlex(
  events: DormEvent[]
): FlexMessagePayload {
  const bubbles = events.slice(0, 10).map((event) => ({
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "🎉 กิจกรรมหอพัก",
          size: "xs",
          color: "#FFFFFF",
        },
      ],
      backgroundColor: PRIMARY,
      paddingAll: "md",
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: event.title,
          size: "md",
          weight: "bold",
          color: "#333333",
          wrap: true,
        },
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [
            { type: "text", text: "📅", size: "sm", flex: 0 },
            { type: "text", text: `${event.date} ${event.time}`, size: "sm", color: "#666666", flex: 1 },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [
            { type: "text", text: "📍", size: "sm", flex: 0 },
            { type: "text", text: event.location, size: "sm", color: "#666666", flex: 1 },
          ],
        },
        ...(event.description
          ? [{
              type: "text" as const,
              text: event.description,
              size: "xs" as const,
              color: "#888888",
              wrap: true,
              margin: "md" as const,
            }]
          : []),
      ],
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          color: PRIMARY,
          height: "sm",
          action: {
            type: "postback",
            label: "ลงทะเบียน",
            data: `action=event_register&event_id=${event.id}`,
            displayText: `ลงทะเบียน ${event.title}`,
          },
        },
      ],
      paddingAll: "md",
    },
    styles: { footer: { separator: true } },
  }))

  return {
    type: "flex",
    altText: `🎉 กิจกรรมหอพัก ${events.length} รายการ`,
    contents: {
      type: "carousel",
      contents: bubbles,
    },
  }
}
