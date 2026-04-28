"use client"

import { useState } from "react"
import {
  Users, Radio, Building2, Clock, Calendar, RotateCcw,
  Send, FileText, BookTemplate, ChevronLeft,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/* ── Types ────────────────────────────────────────────────────── */

export interface Step2Values {
  targetType: "broadcast" | "targeted"
  targetTags: string[]
  schedulingEnabled: boolean
  schedulingMode: "once" | "recurring"
  scheduledDate: string
  scheduledTime: string
}

interface AnnouncementStep2Props {
  /** Preview data from step 1 */
  titleTh: string
  contentTh: string
  coverImage: string | null
  category: string
  messageType: "text" | "flex" | "image"
  imageUrl?: string | null

  values: Step2Values
  onChange: (v: Partial<Step2Values>) => void

  sending: boolean
  onSendNow: () => void
  onSaveDraft: () => void
  onSaveTemplate: () => void
  onBack: () => void
}

/* ── Audience data ────────────────────────────────────────────── */

const YEAR_TAGS = [
  "นิสิตปีที่ 1", "นิสิตปีที่ 2", "นิสิตปีที่ 3",
  "นิสิตปีที่ 4", "นิสิตบัณฑิตศึกษา",
]
const GENDER_TAGS = ["นิสิตชาย", "นิสิตหญิง"]
const BUILDING_TAGS = ["ชวนชม", "จำปา", "จำปี", "พุดตาน", "พุดซ้อน"]

const CATEGORY_LABELS: Record<string, string> = {
  news: "ข่าวสาร", announcement: "ประกาศ", activity: "กิจกรรม",
  alert: "แจ้งเตือนด่วน", pr: "ประชาสัมพันธ์",
}
const MSG_TYPE_LABELS: Record<string, string> = {
  text: "ข้อความธรรมดา", flex: "Flex Message", image: "รูปภาพ",
}

/* ── Tag pill ─────────────────────────────────────────────────── */

function TagPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 items-center rounded-full border px-3 text-sm transition-all duration-150",
        "active:scale-[0.97]",
        active
          ? "border-primary bg-primary/8 text-primary font-medium"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

/* ── Preview card ─────────────────────────────────────────────── */

function AnnouncementPreviewCard({
  titleTh, contentTh, coverImage, category, messageType, imageUrl,
}: Pick<AnnouncementStep2Props, "titleTh" | "contentTh" | "coverImage" | "category" | "messageType" | "imageUrl">) {
  const displayImage = messageType === "image" ? (imageUrl ?? null) : coverImage

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {displayImage && (
        <div className="relative h-48 w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
      <div className="p-5 space-y-3">
        {/* Category + type chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {CATEGORY_LABELS[category] ?? category}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {MSG_TYPE_LABELS[messageType] ?? messageType}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl font-bold text-foreground leading-snug line-clamp-2">
          {titleTh || "ยังไม่มีหัวข้อ"}
        </h3>

        {/* Content preview */}
        {contentTh && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {contentTh}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────── */

export function AnnouncementStep2({
  titleTh, contentTh, coverImage, category, messageType, imageUrl,
  values, onChange,
  sending, onSendNow, onSaveDraft, onSaveTemplate, onBack,
}: AnnouncementStep2Props) {
  const { targetType, targetTags, schedulingEnabled, schedulingMode, scheduledDate, scheduledTime } = values

  function toggleTag(tag: string) {
    const next = targetTags.includes(tag)
      ? targetTags.filter((t) => t !== tag)
      : [...targetTags, tag]
    onChange({ targetTags: next })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">

      {/* ── Left: Announcement preview ── */}
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ตัวอย่างประกาศ
          </p>
          <AnnouncementPreviewCard
            titleTh={titleTh}
            contentTh={contentTh}
            coverImage={coverImage}
            category={category}
            messageType={messageType}
            imageUrl={imageUrl}
          />
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับไปแก้ไข
        </button>
      </div>

      {/* ── Right: Targeting + Scheduling ── */}
      <div className="space-y-4">

        {/* Target card */}
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">กลุ่มเป้าหมาย</h3>
          </div>

          {/* Target type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ targetType: "broadcast" })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all",
                targetType === "broadcast"
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <Radio className="h-4 w-4" />
              Broadcast ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => onChange({ targetType: "targeted" })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all",
                targetType === "targeted"
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <Users className="h-4 w-4" />
              เฉพาะกลุ่ม
            </button>
          </div>

          {/* Audience pills — only show when targeted */}
          {targetType === "targeted" && (
            <div className="space-y-3 pt-1">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">เลือกกลุ่มเป้าหมาย</p>
                <div className="flex flex-wrap gap-2">
                  {YEAR_TAGS.map((t) => (
                    <TagPill key={t} label={t} active={targetTags.includes(t)} onClick={() => toggleTag(t)} />
                  ))}
                  {GENDER_TAGS.map((t) => (
                    <TagPill key={t} label={t} active={targetTags.includes(t)} onClick={() => toggleTag(t)} />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">เลือกตึก</p>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_TAGS.map((t) => {
                    const tag = `ตึก${t}`
                    return (
                      <TagPill key={t} label={`ตึก${t}`} active={targetTags.includes(tag)} onClick={() => toggleTag(tag)} />
                    )
                  })}
                </div>
              </div>

              {targetTags.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  เลือกแล้ว {targetTags.length} กลุ่ม
                </p>
              )}
            </div>
          )}
        </div>

        {/* Scheduling card */}
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">การตั้งเวลาส่ง</h3>
            </div>
            <Switch
              checked={schedulingEnabled}
              onCheckedChange={(v) => onChange({ schedulingEnabled: v })}
            />
          </div>

          {schedulingEnabled && (
            <div className="space-y-3">
              {/* Mode selector */}
              <p className="text-xs font-semibold text-muted-foreground">เลือกรูปแบบการตั้งเวลาส่ง</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ schedulingMode: "once" })}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    schedulingMode === "once"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={cn(
                      "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center",
                      schedulingMode === "once" ? "border-primary" : "border-muted-foreground"
                    )}>
                      {schedulingMode === "once" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-foreground">ตั้งเวลาส่ง</span>
                    <span className="text-xs font-semibold text-primary">ครั้งเดียว</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">เลือกวันและเวลาที่ต้องการส่งประกาศ</p>
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ schedulingMode: "recurring" })}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    schedulingMode === "recurring"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={cn(
                      "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center",
                      schedulingMode === "recurring" ? "border-primary" : "border-muted-foreground"
                    )}>
                      {schedulingMode === "recurring" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-foreground">ตั้งเวลาส่ง</span>
                    <span className="text-xs font-semibold text-primary">ประจำ</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">ส่งประกาศนี้ซ้ำตามกำหนดเวลา</p>
                </button>
              </div>

              {/* Date + Time inputs */}
              {schedulingMode === "once" && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      วันที่ส่ง
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => onChange({ scheduledDate: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      เวลา
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => onChange({ scheduledTime: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  </div>
                </div>
              )}

              {schedulingMode === "recurring" && (
                <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700 flex items-start gap-2">
                  <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>ฟีเจอร์ Recurring จะพร้อมใช้งานเร็วๆ นี้ — สำหรับตอนนี้ประกาศจะถูกบันทึกไว้ก่อน</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onSendNow}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(221,89,139,0.35)] transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? "กำลังส่ง..." : schedulingEnabled && scheduledDate ? "ตั้งเวลาส่ง" : "ส่งทันที"}
          </button>

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            บันทึกฉบับร่าง
          </button>

          <button
            type="button"
            onClick={onSaveTemplate}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-50"
          >
            <BookTemplate className="h-4 w-4" />
            บันทึกเป็นเทมเพลต
          </button>
        </div>
      </div>
    </div>
  )
}
