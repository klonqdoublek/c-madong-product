"use client"

import React from "react"
import { cn } from "@/lib/utils"

type MessageType = "text" | "flex" | "image"

interface AnnouncementMessageTypeCardsProps {
  value: MessageType
  onChange: (v: MessageType) => void
}

/* ── Mini previews ──────────────────────────────────────────────── */

function TextPreview() {
  return (
    <img
      src="/announcement-types/text.png"
      alt="text message preview"
      className="h-full w-full object-contain"
    />
  )
}

function FlexPreview() {
  return (
    <img
      src="/announcement-types/flex.png"
      alt="flex message preview"
      className="h-full w-full object-contain"
    />
  )
}

function ImagePreview() {
  return (
    <img
      src="/announcement-types/photo.png"
      alt="image message preview"
      className="h-full w-full object-contain"
    />
  )
}

/* ── Card data ──────────────────────────────────────────────────── */

const CARDS: {
  value: MessageType
  label: string
  labelColor: string
  borderColor: string
  Preview: () => React.ReactElement
}[] = [
  {
    value: "text",
    label: "ข้อความธรรมดา",
    labelColor: "text-[#4da376]",
    borderColor: "border-[#84cda4]",
    Preview: TextPreview,
  },
  {
    value: "flex",
    label: "Flex Message",
    labelColor: "text-primary",
    borderColor: "border-primary",
    Preview: FlexPreview,
  },
  {
    value: "image",
    label: "รูปภาพ",
    labelColor: "text-primary",
    borderColor: "border-primary",
    Preview: ImagePreview,
  },
]

export function AnnouncementMessageTypeCards({
  value,
  onChange,
}: AnnouncementMessageTypeCardsProps) {
  return (
    <div className="mx-auto grid max-w-[70%] grid-cols-3 gap-3">
      {CARDS.map(({ value: v, label, labelColor, borderColor, Preview }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "flex flex-col items-center rounded-xl border-[1.5px] p-1.5 text-left",
              "cursor-pointer transition-all duration-200 hover:scale-[1.01]",
              "active:scale-[0.99]",
              active
                ? [borderColor, "shadow-sm"]
                : "border-muted/40 hover:border-muted/70"
            )}
          >
            {/* Preview box */}
            <div className="aspect-[7/6] w-full overflow-hidden rounded-lg bg-[#fbf6e9]">
              <Preview />
            </div>

            {/* Label */}
            <p
              className={cn(
                "mt-2 w-full text-center text-sm font-semibold transition-colors duration-200",
                active ? labelColor : "text-muted-foreground"
              )}
            >
              {label}
            </p>
          </button>
        )
      })}
    </div>
  )
}
