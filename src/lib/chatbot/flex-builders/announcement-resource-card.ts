const WEB_BASE = "https://c-madong-product.vercel.app"
const PRIMARY = "#DD598B"
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]

interface AnnouncementCard {
  id: string
  title: string
  cover_image: string | null
  event_date: string | null
  category: string | null
  summary?: string
}

function formatThaiShortDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = THAI_MONTHS[d.getMonth()]
  const year = d.getFullYear() + 543
  return `${day} ${month} ${year}`
}

function buildAnnouncementBubble(card: AnnouncementCard) {
  const hasImage = !!card.cover_image
  const eventDateText = card.event_date ? formatThaiShortDate(card.event_date) : null

  const bubble: Record<string, unknown> = {
    type: "bubble",
    size: "kilo",
    action: {
      type: "uri",
      label: "ดูประกาศ",
      uri: `${WEB_BASE}/th/announcements/${card.id}`,
    },
  }

  if (hasImage) {
    bubble.hero = {
      type: "image",
      url: card.cover_image,
      size: "full",
      aspectRatio: "16:9",
      aspectMode: "cover",
      action: {
        type: "uri",
        label: "ดูประกาศ",
        uri: `${WEB_BASE}/th/announcements/${card.id}`,
      },
    }
  }

  const bodyContents: unknown[] = [
    {
      type: "text",
      text: card.title,
      size: "sm",
      weight: "bold",
      wrap: true,
      maxLines: 2,
      color: "#1A1A1A",
    },
  ]

  if (eventDateText) {
    bodyContents.push({
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: `📅 ${eventDateText}`,
          size: "xs",
          color: PRIMARY,
          weight: "bold",
        },
      ],
      margin: "xs",
    })
  }

  if (card.summary) {
    bodyContents.push({
      type: "text",
      text: card.summary,
      size: "xs",
      color: "#666666",
      wrap: true,
      maxLines: 2,
      margin: "sm",
    })
  }

  bubble.body = {
    type: "box",
    layout: "vertical",
    contents: bodyContents,
    paddingAll: "md",
    spacing: "xs",
  }

  bubble.footer = {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "button",
        action: {
          type: "uri",
          label: "ดูประกาศ →",
          uri: `${WEB_BASE}/th/announcements/${card.id}`,
        },
        style: "primary",
        color: PRIMARY,
        height: "sm",
      },
    ],
    paddingAll: "md",
  }

  return bubble
}

/**
 * Build a carousel of announcement resource cards for bot RAG responses.
 * Max 3 bubbles (LINE carousel limit for bot context).
 */
export function buildAnnouncementResourceCarousel(cards: AnnouncementCard[]) {
  const bubbles = cards.slice(0, 3).map(buildAnnouncementBubble)

  if (bubbles.length === 1) return bubbles[0]

  return {
    type: "carousel",
    contents: bubbles,
  }
}
