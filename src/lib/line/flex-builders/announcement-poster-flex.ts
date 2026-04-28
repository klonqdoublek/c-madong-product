import type { FlexMessagePayload } from "./bill-reminder"
import type { CTAButton, CTAConfig } from "@/types/announcement-cta"

export interface AnnouncementFlexFields {
  title: string
  body: string
  date?: string | null
  category?: string | null
  /** @deprecated use ctas instead */
  ctaUrl?: string | null
  announcementId?: string | null
  ctas?: CTAConfig | null
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

  // Build footer buttons from ctas config (preferred) or legacy ctaUrl
  const footerButtons: unknown[] = []

  function buildAction(btn: CTAButton): Record<string, unknown> {
    if (btn.actionType === "uri") {
      return { type: "uri", label: btn.label.slice(0, 20), uri: btn.actionValue }
    }
    if (btn.actionType === "message") {
      return { type: "message", label: btn.label.slice(0, 20), text: btn.actionValue.slice(0, 300) }
    }
    // postback
    return {
      type: "postback",
      label: btn.label.slice(0, 20),
      data: btn.actionValue.slice(0, 300),
      ...(btn.displayText ? { displayText: btn.displayText.slice(0, 300) } : {}),
    }
  }

  if (fields.ctas?.primary) {
    const p = fields.ctas.primary
    footerButtons.push({
      type: "button",
      style: p.style,
      color: p.style === "primary" ? "#DD598B" : undefined,
      height: "sm",
      action: buildAction(p),
    })
  } else if (fields.ctaUrl) {
    // legacy fallback
    footerButtons.push({
      type: "button",
      style: "primary",
      color: "#DD598B",
      height: "sm",
      action: { type: "uri", label: "ดูรายละเอียด", uri: fields.ctaUrl },
    })
  }

  if (fields.ctas?.secondary) {
    const s = fields.ctas.secondary
    if (footerButtons.length > 0) {
      footerButtons.push({ type: "separator", margin: "sm" })
    }
    footerButtons.push({
      type: "button",
      style: s.style,
      height: "sm",
      action: buildAction(s),
    })
  }

  if (footerButtons.length > 0) {
    bubble.footer = {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      spacing: "none",
      contents: footerButtons,
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
