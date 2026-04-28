"use client"

import React from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type MessageType = "text" | "flex" | "image"

interface AnnouncementMessageTypeCardsProps {
  value: MessageType
  onChange: (v: MessageType) => void
}

/* ── Mini previews ──────────────────────────────────────────────── */

function TextPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-3">
      <div className="w-full rounded-lg bg-white p-3 shadow-sm">
        {/* Header line */}
        <div className="mb-2 h-2.5 w-20 rounded-full bg-muted/60" />
        {/* Body lines */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-muted/30" />
          <div className="h-2 w-[85%] rounded-full bg-muted/30" />
          <div className="h-2 w-[60%] rounded-full bg-muted/30" />
          <div className="h-2 w-[75%] rounded-full bg-muted/30" />
          <div className="h-2 w-[45%] rounded-full bg-muted/30" />
        </div>
      </div>
    </div>
  )
}

function FlexPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-3">
      <div className="w-[100px] overflow-hidden rounded-xl shadow-sm">
        {/* Header / hero area */}
        <div className="flex h-10 items-end bg-muted/40 px-2 pb-1.5">
          <div className="h-3 w-5 rounded-sm bg-white/60" />
        </div>
        {/* Body */}
        <div className="bg-[#fffef5] px-2 py-2">
          <div className="space-y-1">
            <div className="h-1.5 w-[70%] rounded-full bg-muted/40" />
            <div className="h-1.5 w-full rounded-full bg-muted/25" />
            <div className="h-1.5 w-[50%] rounded-full bg-muted/25" />
          </div>
          {/* CTA button */}
          <div className="mt-2 h-4 w-full rounded-md bg-primary/60" />
        </div>
      </div>
    </div>
  )
}

function ImagePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-1.5">
        <ImageIcon className="h-10 w-10 text-muted/50" strokeWidth={1.5} />
        <div className="h-1.5 w-12 rounded-full bg-muted/30" />
      </div>
    </div>
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
    <div className="grid grid-cols-3 gap-3">
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
            <div className="h-32 w-full overflow-hidden rounded-lg bg-[#fbf6e9]">
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
