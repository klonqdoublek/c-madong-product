export type CTAStyle = "primary" | "secondary" | "link"
export type CTAActionType = "uri" | "message" | "postback"

export interface CTAButton {
  label: string        // max 20 chars (LINE hard limit)
  style: CTAStyle
  actionType: CTAActionType
  actionValue: string  // URL | message text | postback data
  displayText?: string // postback only: shown in chat (max 300 chars)
}

export interface CTAConfig {
  primary: CTAButton | null
  secondary: CTAButton | null
}

export const DEFAULT_CTA_CONFIG: CTAConfig = {
  primary: null,
  secondary: null,
}

export const LABEL_MAX = 20
export const POSTBACK_DATA_MAX = 300
export const MESSAGE_TEXT_MAX = 300
