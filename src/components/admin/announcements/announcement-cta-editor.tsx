"use client"

import { useState } from "react"
import { Plus, Trash2, MousePointerClick, Link, MessageSquare, Webhook, ChevronDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CTAButton, CTAConfig, CTAStyle, CTAActionType } from "@/types/announcement-cta"
import { LABEL_MAX, POSTBACK_DATA_MAX, MESSAGE_TEXT_MAX } from "@/types/announcement-cta"

/* ── Constants ────────────────────────────────────────────────── */

const STYLE_OPTIONS: { value: CTAStyle; label: string; desc: string }[] = [
  { value: "primary",   label: "Primary",   desc: "ปุ่มสีชมพู ข้อความขาว" },
  { value: "secondary", label: "Secondary", desc: "ปุ่มกรอบ ข้อความสี" },
  { value: "link",      label: "Link",      desc: "ข้อความลิงก์ ไม่มีกรอบ" },
]

const ACTION_OPTIONS: { value: CTAActionType; label: string; icon: React.ElementType; placeholder: string; hint: string }[] = [
  {
    value: "uri",
    label: "URL",
    icon: Link,
    placeholder: "https://example.com",
    hint: "เปิดเว็บหรือ LIFF app",
  },
  {
    value: "message",
    label: "Message",
    icon: MessageSquare,
    placeholder: "ข้อความที่จะส่ง",
    hint: `ผู้ใช้ส่งข้อความไปยัง chat (max ${MESSAGE_TEXT_MAX} ตัว)`,
  },
  {
    value: "postback",
    label: "Postback",
    icon: Webhook,
    placeholder: "action=confirm&id=123",
    hint: `ส่ง data ไปยัง webhook (max ${POSTBACK_DATA_MAX} bytes)`,
  },
]

/* ── Single CTA form ──────────────────────────────────────────── */

interface CTAFormProps {
  value: CTAButton
  onChange: (b: CTAButton) => void
  onRemove?: () => void
  title: string
  accentColor?: string
}

function CTAForm({ value, onChange, onRemove, title, accentColor = "#DD598B" }: CTAFormProps) {
  const [open, setOpen] = useState(true)

  const labelLen = value.label.length
  const labelOver = labelLen > LABEL_MAX
  const dataBytes = new TextEncoder().encode(value.actionValue).length
  const dataOver = value.actionType === "postback" && dataBytes > POSTBACK_DATA_MAX
  const textOver = value.actionType === "message" && value.actionValue.length > MESSAGE_TEXT_MAX

  function set(partial: Partial<CTAButton>) {
    onChange({ ...value, ...partial })
  }

  const actionOption = ACTION_OPTIONS.find((a) => a.value === value.actionType)!

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <MousePointerClick className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {value.label && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              {value.label.slice(0, 16)}{value.label.length > 16 ? "…" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t px-4 pb-4 pt-3">

          {/* Label */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                Label ข้อความบนปุ่ม
              </label>
              <span className={cn("text-[10px] font-medium tabular-nums", labelOver ? "text-destructive" : "text-muted-foreground")}>
                {labelLen}/{LABEL_MAX}
              </span>
            </div>
            <input
              value={value.label}
              onChange={(e) => set({ label: e.target.value })}
              placeholder="เช่น ดูรายละเอียด"
              maxLength={LABEL_MAX + 5}
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all",
                "focus:ring-2 focus:ring-primary/20",
                labelOver && "border-destructive focus:ring-destructive/20"
              )}
            />
            {labelOver && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
                <AlertTriangle className="h-3 w-3" />
                LINE จำกัด label {LABEL_MAX} ตัวอักษร
              </p>
            )}
          </div>

          {/* Style */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">สไตล์ปุ่ม</label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set({ style: s.value })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all",
                    value.style === s.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  {/* Mini button preview */}
                  <div className={cn(
                    "h-5 w-full rounded text-[8px] font-semibold flex items-center justify-center",
                    s.value === "primary"   && "bg-primary text-white",
                    s.value === "secondary" && "border border-primary text-primary bg-transparent",
                    s.value === "link"      && "text-primary underline",
                  )}>
                    ปุ่ม
                  </div>
                  <span className="text-[10px] font-medium text-foreground">{s.label}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">ประเภท Action</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTION_OPTIONS.map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => set({ actionType: a.value, actionValue: "" })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all",
                      value.actionType === a.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", value.actionType === a.value ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-medium text-foreground">{a.label}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">{actionOption.hint}</p>
          </div>

          {/* Action value */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                {value.actionType === "uri"      ? "URL"
                : value.actionType === "message" ? "ข้อความ"
                : "Postback Data"}
              </label>
              {value.actionType === "postback" && (
                <span className={cn("text-[10px] font-medium tabular-nums", dataOver ? "text-destructive" : "text-muted-foreground")}>
                  {dataBytes}/{POSTBACK_DATA_MAX} bytes
                </span>
              )}
              {value.actionType === "message" && (
                <span className={cn("text-[10px] font-medium tabular-nums", textOver ? "text-destructive" : "text-muted-foreground")}>
                  {value.actionValue.length}/{MESSAGE_TEXT_MAX}
                </span>
              )}
            </div>
            <input
              value={value.actionValue}
              onChange={(e) => set({ actionValue: e.target.value })}
              placeholder={actionOption.placeholder}
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all",
                "focus:ring-2 focus:ring-primary/20 font-mono text-xs",
                (dataOver || textOver) && "border-destructive focus:ring-destructive/20"
              )}
            />
            {(dataOver || textOver) && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {dataOver ? `เกิน ${POSTBACK_DATA_MAX} bytes (Thai text URL-encode = ~3x)` : `เกิน ${MESSAGE_TEXT_MAX} ตัวอักษร`}
              </p>
            )}
          </div>

          {/* Postback displayText */}
          {value.actionType === "postback" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Display Text <span className="font-normal text-muted-foreground/70">(แสดงในแชทเมื่อกด)</span>
              </label>
              <input
                value={value.displayText ?? ""}
                onChange={(e) => set({ displayText: e.target.value })}
                placeholder="เช่น ดูรายละเอียดแล้วจ้า"
                maxLength={300}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main editor ──────────────────────────────────────────────── */

interface AnnouncementCTAEditorProps {
  value: CTAConfig
  onChange: (c: CTAConfig) => void
}

const DEFAULT_PRIMARY: CTAButton = {
  label: "ดูรายละเอียด",
  style: "primary",
  actionType: "uri",
  actionValue: "",
}

const DEFAULT_SECONDARY: CTAButton = {
  label: "ปิด",
  style: "secondary",
  actionType: "message",
  actionValue: "ปิด",
}

export function AnnouncementCTAEditor({ value, onChange }: AnnouncementCTAEditorProps) {
  function setPrimary(b: CTAButton | null) {
    onChange({ ...value, primary: b })
  }
  function setSecondary(b: CTAButton | null) {
    onChange({ ...value, secondary: b })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MousePointerClick className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">ปุ่ม CTA</h3>
        <span className="text-xs text-muted-foreground">(Call-to-Action ในส่วน Footer)</span>
      </div>

      {/* Primary CTA */}
      {value.primary ? (
        <CTAForm
          title="Primary CTA"
          value={value.primary}
          onChange={setPrimary}
          onRemove={() => setPrimary(null)}
          accentColor="#DD598B"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPrimary({ ...DEFAULT_PRIMARY })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-3 text-sm font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          เพิ่ม Primary Button
        </button>
      )}

      {/* Secondary CTA — only show when primary exists */}
      {value.primary && (
        value.secondary ? (
          <CTAForm
            title="Secondary CTA"
            value={value.secondary}
            onChange={(b) => setSecondary(b)}
            onRemove={() => setSecondary(null)}
            accentColor="#585856"
          />
        ) : (
          <button
            type="button"
            onClick={() => setSecondary({ ...DEFAULT_SECONDARY })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-muted py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            เพิ่ม Secondary Button (optional)
          </button>
        )
      )}

      {/* Spec note */}
      <div className="rounded-lg bg-muted/30 px-3 py-2 text-[10px] text-muted-foreground space-y-0.5">
        <p><span className="font-semibold text-foreground">Label</span> max 20 chars · <span className="font-semibold text-foreground">Postback data</span> max 300 bytes (Thai URL-encode ≈ 3×)</p>
        <p><span className="font-semibold text-foreground">URI</span> ต้องเป็น HTTPS · <span className="font-semibold text-foreground">Postback</span> ห้ามใส่ title/desc ยาวๆ ใน data</p>
      </div>
    </div>
  )
}
