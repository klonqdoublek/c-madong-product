"use client"

import { useState } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Clock, X, Plus } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import "react-day-picker/style.css"

export interface EventDateValues {
  allDay: boolean
  startDate: string   // "YYYY-MM-DD"
  endDate: string     // "YYYY-MM-DD" | ""
  startTime: string   // "HH:mm"
  endTime: string     // "HH:mm"
}

interface AnnouncementEventDateProps {
  values: EventDateValues
  onChange: (v: Partial<EventDateValues>) => void
}

/* ── Calendar popover classnames ───────────────────────────────── */
const DAY_CLASSNAMES = {
  root: "p-3",
  month_caption: "flex justify-center items-center h-8 font-heading font-bold text-sm text-foreground",
  nav: "flex items-center gap-1",
  button_previous: "h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground",
  button_next: "h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground",
  weeks: "mt-2",
  weekdays: "grid grid-cols-7",
  weekday: "h-8 w-9 flex items-center justify-center text-[11px] font-semibold text-muted-foreground",
  week: "grid grid-cols-7",
  day: "h-9 w-9 flex items-center justify-center text-sm rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors",
  day_button: "h-9 w-9 flex items-center justify-center rounded-xl",
  selected: "bg-primary text-white hover:bg-primary hover:text-white font-semibold",
  today: "font-bold text-primary",
  outside: "text-muted-foreground/40",
  disabled: "text-muted-foreground/30 cursor-not-allowed",
}

function formatDateTh(iso: string): string {
  if (!iso) return ""
  try {
    return format(new Date(iso + "T00:00:00"), "d MMM yyyy", { locale: th })
  } catch {
    return iso
  }
}

function toIso(d: Date | undefined): string {
  if (!d) return ""
  return format(d, "yyyy-MM-dd")
}

/* ── Pill button ───────────────────────────────────────────────── */
function Pill({
  children, onClick, placeholder, hasValue, className,
}: {
  children?: React.ReactNode
  onClick?: () => void
  placeholder?: string
  hasValue?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 items-center rounded-lg px-3 text-sm transition-all",
        "border hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        hasValue
          ? "border-transparent bg-muted/60 text-foreground hover:bg-muted font-medium"
          : "border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted/30",
        className
      )}
    >
      {hasValue ? children : placeholder}
    </button>
  )
}

/* ── Time popover ──────────────────────────────────────────────── */
function TimePill({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Pill hasValue={!!value} placeholder={placeholder ?? "เวลา"}>
          {value}
        </Pill>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3 rounded-xl" align="start">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">เลือกเวลา</p>
        <input
          type="time"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(false) }}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false) }}
            className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-destructive"
          >
            ล้างเวลา
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ── Date popover ──────────────────────────────────────────────── */
function DatePill({
  value, onChange, placeholder, disableBefore,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disableBefore?: Date
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(value + "T00:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Pill hasValue={!!value} placeholder={placeholder ?? "เลือกวันที่"}>
          {value ? formatDateTh(value) : null}
        </Pill>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(d) => { onChange(toIso(d)); setOpen(false) }}
          disabled={disableBefore ? { before: disableBefore } : undefined}
          locale={th}
          classNames={DAY_CLASSNAMES as any}
        />
      </PopoverContent>
    </Popover>
  )
}

/* ── Main component ────────────────────────────────────────────── */
export function AnnouncementEventDate({ values, onChange }: AnnouncementEventDateProps) {
  const { allDay, startDate, endDate, startTime, endTime } = values
  const startDateObj = startDate ? new Date(startDate + "T00:00:00") : undefined
  const hasEndDate = !!endDate

  return (
    <div className="space-y-2">
      {/* ── Horizontal pill row ── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />

        {/* Start date */}
        <DatePill
          value={startDate}
          onChange={(v) => onChange({ startDate: v })}
          placeholder="เลือกวันที่"
        />

        {/* Start time — only when not all-day */}
        {!allDay && startDate && (
          <TimePill
            value={startTime}
            onChange={(v) => onChange({ startTime: v })}
            placeholder="เวลาเริ่ม"
          />
        )}

        {/* Dash + end section — only when start date is set */}
        {startDate && (
          <>
            <span className="text-muted-foreground">—</span>

            {/* End time — only when not all-day and has end date */}
            {!allDay && hasEndDate && (
              <TimePill
                value={endTime}
                onChange={(v) => onChange({ endTime: v })}
                placeholder="เวลาสิ้นสุด"
              />
            )}

            {/* End date */}
            {hasEndDate ? (
              <div className="flex items-center gap-1">
                <DatePill
                  value={endDate}
                  onChange={(v) => onChange({ endDate: v })}
                  placeholder="วันสิ้นสุด"
                  disableBefore={startDateObj}
                />
                <button
                  type="button"
                  onClick={() => onChange({ endDate: "", endTime: "" })}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChange({ endDate: startDate })}
                className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                วันสิ้นสุด
              </button>
            )}
          </>
        )}
      </div>

      {/* ── All-day checkbox ── */}
      {startDate && (
        <div className="flex items-center gap-2 pl-6">
          <input
            id="event-allday"
            type="checkbox"
            checked={allDay}
            onChange={(e) => onChange({
              allDay: e.target.checked,
              startTime: "",
              endTime: "",
            })}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
          <label htmlFor="event-allday" className="cursor-pointer text-sm text-foreground select-none">
            ทั้งวัน
          </label>
        </div>
      )}
    </div>
  )
}
