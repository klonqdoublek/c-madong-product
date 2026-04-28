"use client"

import { useState } from "react"
import { Plus, Trash2, MousePointerClick, Link, MessageSquare, Webhook, ChevronDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CTAButton, CTAConfig, CTAStyle, CTAActionType } from "@/types/announcement-cta"
import { LABEL_MAX, POSTBACK_DATA_MAX, MESSAGE_TEXT_MAX } from "@/types/announcement-cta"

/* ── Data ─────────────────────────────────────────────────────── */

const STYLE_OPTIONS: { value: CTAStyle; label: string; desc: string }[] = [
  { value: "primary",   label: "Primary",   desc: "ปุ่มเด่น — พื้นหลังสีชมพู" },
  { value: "secondary", label: "Secondary", desc: "ปุ่มรอง — กรอบสี ไม่มีพื้นหลัง" },
  { value: "link",      label: "Link",      desc: "ข้อความกดได้ — ดูเบาที่สุด" },
]

const ACTION_OPTIONS: {
  value: CTAActionType
  label: string
  icon: React.ElementType
  placeholder: string
  hint: string
}[] = [
  { value: "uri",      label: "URL",      icon: Link,          placeholder: "https://example.com",         hint: "พาผู้ใช้ไปเว็บหรือแอพหอพัก" },
  { value: "message",  label: "Message",  icon: MessageSquare, placeholder: "ข้อความที่ต้องการส่ง",           hint: "กดแล้วส่งข้อความเข้าแชทอัตโนมัติ" },
  { value: "postback", label: "Postback", icon: Webhook,       placeholder: "action=confirm&id=123", hint: "ส่งสัญญาณกลับบอทโดยไม่แสดงข้อความ" },
]

/* ── Single CTA form ──────────────────────────────────────────── */

interface CTAFormProps {
  value: CTAButton
  onChange: (b: CTAButton) => void
  onRemove?: () => void
  title: string
  badge?: { label: string; color: string }
}

function CTAForm({ value, onChange, onRemove, title, badge }: CTAFormProps) {
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
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <MousePointerClick className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: badge.color }}
            >
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
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
              <span className={cn(
                "text-[10px] font-medium tabular-nums",
                labelLen > LABEL_MAX * 0.85 ? (labelOver ? "text-destructive" : "text-amber-500") : "text-muted-foreground"
              )}>
                {labelLen}/{LABEL_MAX}
              </span>
            </div>
            <input
              value={value.label}
              onChange={(e) => set({ label: e.target.value })}
              placeholder="เช่น ดูรายละเอียด"
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all",
                "focus:ring-2 focus:ring-primary/20",
                labelOver && "border-destructive focus:ring-destructive/20"
              )}
            />
            {labelOver && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
                <AlertTriangle className="h-3 w-3" />
                LINE รองรับข้อความบนปุ่มได้ไม่เกิน {LABEL_MAX} ตัวอักษรนะ
              </p>
            )}
          </div>

          {/* Style */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">สไตล์ปุ่ม</label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set({ style: s.value })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-2.5 text-center transition-all",
                    "hover:border-primary/40",
                    value.style === s.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border"
                  )}
                >
                  {/* Mini preview */}
                  <div className={cn(
                    "flex h-5 w-full items-center justify-center rounded text-[8px] font-semibold",
                    s.value === "primary"   && "bg-primary text-white",
                    s.value === "secondary" && "border border-primary text-primary",
                    s.value === "link"      && "text-primary underline",
                  )}>
                    ปุ่ม
                  </div>
                  <span className="text-[10px] font-semibold text-foreground leading-tight">{s.label}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action type */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">ประเภท Action</label>
            <div className="grid grid-cols-3 gap-2">
              {ACTION_OPTIONS.map((a) => {
                const Icon = a.icon
                const active = value.actionType === a.value
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => set({ actionType: a.value, actionValue: "" })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all",
                      "hover:border-primary/40",
                      active ? "border-primary bg-primary/5 shadow-sm" : "border-border"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-[10px] font-semibold", active ? "text-primary" : "text-foreground")}>{a.label}</span>
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
                {value.actionType === "uri" ? "URL ปลายทาง" : value.actionType === "message" ? "ข้อความ" : "Postback Key"}
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
                "focus:ring-2 focus:ring-primary/20",
                value.actionType !== "uri" ? "font-mono text-xs" : "",
                (dataOver || textOver) && "border-destructive"
              )}
            />
            {value.actionType === "uri" && value.actionValue && !value.actionValue.startsWith("https://") && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                ลิงก์ควรขึ้นต้นด้วย https:// นะ
              </p>
            )}
            {dataOver && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
                <AlertTriangle className="h-3 w-3" />
                ภาษาไทยใน Postback กินพื้นที่มากกว่าปกติ — ลองใช้แค่รหัสหรือ ID สั้นๆ
              </p>
            )}
          </div>

          {/* Postback displayText */}
          {value.actionType === "postback" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                ข้อความที่แสดงในแชทเมื่อกด <span className="font-normal">(ไม่บังคับ)</span>
              </label>
              <input
                value={value.displayText ?? ""}
                onChange={(e) => set({ displayText: e.target.value })}
                placeholder="เช่น ดูรายละเอียดแล้ว"
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
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-1.5">
        <MousePointerClick className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-xs font-semibold text-foreground">ปุ่ม CTA</h3>
        <span className="text-xs text-muted-foreground">(Call-to-Action ในส่วน Footer)</span>
      </div>

      {/* Primary */}
      {value.primary ? (
        <CTAForm
          title="Primary CTA"
          badge={{ label: value.primary.style, color: "#DD598B" }}
          value={value.primary}
          onChange={(b) => onChange({ ...value, primary: b })}
          onRemove={() => onChange({ ...value, primary: null, secondary: null })}
        />
      ) : (
        <button
          type="button"
          onClick={() => onChange({ ...value, primary: { ...DEFAULT_PRIMARY } })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          เพิ่ม Primary Button
        </button>
      )}

      {/* Secondary — only when primary exists */}
      {value.primary && (
        value.secondary ? (
          <CTAForm
            title="Secondary CTA"
            badge={{ label: value.secondary.style, color: "#585856" }}
            value={value.secondary}
            onChange={(b) => onChange({ ...value, secondary: b })}
            onRemove={() => onChange({ ...value, secondary: null })}
          />
        ) : (
          <button
            type="button"
            onClick={() => onChange({ ...value, secondary: { ...DEFAULT_SECONDARY } })}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-muted py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่ม Secondary Button (ไม่บังคับ)
          </button>
        )
      )}

      {/* Constraint note — friendly Thai */}
      <div className="rounded-lg bg-muted/30 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Label</span> ไม่เกิน 20 ตัวอักษร ·{" "}
        <span className="font-semibold text-foreground">Postback</span> ใส่แค่คีย์สั้นๆ ไม่ใส่ข้อความยาวหรือภาษาไทย ·{" "}
        <span className="font-semibold text-foreground">URL</span> ต้องขึ้นต้นด้วย https://
      </div>
    </div>
  )
}
