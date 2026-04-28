import type { FlexMessagePayload } from "./bill-reminder"

export interface AnnouncementFlexFields {
  title: string
  body: string
  date?: string | null
  category?: string | null
  ctaUrl?: string | null
  announcementId?: string | null
}

const CATEGORY_EMOJI: Record<string, string> = {
  announcement: "📢",
  alert: "🚨",
  activity: "🎉",
  news: "📰",
  pr: "📣",
}

function formatThaiDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function buildBubble(
  fields: AnnouncementFlexFields,
  imageUrl: string | null
): Record<string, unknown> {
  const emoji = CATEGORY_EMOJI[fields.category ?? ""] ?? "📢"
  const hasImage = !!imageUrl

  const bodyContents: unknown[] = [
    {
      type: "text",
      text: fields.title,
      weight: "bold",
      size: "md",
      wrap: true,
      maxLines: 3,
      color: "#1a1a2e",
    },
    {
      type: "text",
      text: fields.body,
      size: "sm",
      wrap: true,
      color: "#555577",
      maxLines: hasImage ? 4 : 8,
      margin: "sm",
    },
  ]

  if (fields.date) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: `📅 ${formatThaiDate(fields.date)}`,
          size: "xs",
          color: "#888899",
          flex: 0,
        },
        ...(fields.category
          ? [
              {
                type: "text",
                text: `${emoji} ${fields.category}`,
                size: "xs",
                color: "#DD598B",
                align: "end",
              },
            ]
          : []),
      ],
    })
  } else if (fields.category) {
    bodyContents.push({
      type: "text",
      text: `${emoji} ${fields.category}`,
      size: "xs",
      color: "#DD598B",
      margin: "md",
    })
  }

  const bubble: Record<string, unknown> = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "16px",
      spacing: "none",
      contents: bodyContents,
    },
  }

  if (hasImage) {
    bubble.hero = {
      type: "image",
      url: imageUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    }
  }

  if (fields.ctaUrl) {
    bubble.footer = {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "ดูรายละเอียด →",
            uri: fields.ctaUrl,
          },
          style: "primary",
          color: "#DD598B",
          height: "sm",
        },
      ],
    }
  }

  return bubble
}

/**
 * Build a LINE Flex Message for an announcement.
 * - 1 image → single bubble
 * - 2+ images → carousel (each image = one bubble with shared text)
 */
export function buildAnnouncementPosterFlex(
  fields: AnnouncementFlexFields,
  images: string[]
): FlexMessagePayload {
  const altText = fields.title.slice(0, 400)

  if (images.length <= 1) {
    const bubble = buildBubble(fields, images[0] ?? null)
    return { type: "flex", altText, contents: bubble }
  }

  const bubbles = images.slice(0, 10).map((img) => buildBubble(fields, img))
  return {
    type: "flex",
    altText,
    contents: { type: "carousel", contents: bubbles },
  }
}
