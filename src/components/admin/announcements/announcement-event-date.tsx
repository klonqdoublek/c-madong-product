"use client"

import { useState } from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { CalendarDays, Clock, ChevronDown, X } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import "react-day-picker/style.css"

export interface EventDateValues {
  allDay: boolean
  startDate: string   // ISO date string "YYYY-MM-DD"
  endDate: string     // ISO date string, empty = no end date
  startTime: string   // "HH:mm"
  endTime: string     // "HH:mm"
}

interface AnnouncementEventDateProps {
  values: EventDateValues
  onChange: (v: Partial<EventDateValues>) => void
}

/* ── Date button ───────────────────────────────────────────────── */
function DateButton({
  value, placeholder, onClear, children,
}: { value: string; placeholder: string; onClear?: () => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-all",
            "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
            value ? "border-primary/40 text-foreground" : "border-border text-muted-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">
            {children}
          </span>
          {value && onClear && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          {!value && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
    </div>
  )
}

/* ── Time input ────────────────────────────────────────────────── */
function TimeInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-2 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        />
      </div>
    </div>
  )
}

/* ── Calendar popover ──────────────────────────────────────────── */
const DAY_PICKER_CLASSNAMES = {
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
  range_start: "bg-primary text-white rounded-xl",
  range_end: "bg-primary text-white rounded-xl",
  range_middle: "bg-primary/15 rounded-none text-foreground",
  disabled: "text-muted-foreground/30 cursor-not-allowed",
}

function formatDateDisplay(iso: string): string {
  if (!iso) return ""
  try {
    return format(new Date(iso), "d MMMM yyyy", { locale: th })
  } catch {
    return iso
  }
}

/* ── Main component ────────────────────────────────────────────── */
export function AnnouncementEventDate({ values, onChange }: AnnouncementEventDateProps) {
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const startDateObj = values.startDate ? new Date(values.startDate) : undefined
  const endDateObj = values.endDate ? new Date(values.endDate) : undefined

  function toIso(d: Date | undefined): string {
    if (!d) return ""
    return format(d, "yyyy-MM-dd")
  }

  return (
    <div className="space-y-3">
      {/* All-day toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">ทั้งวัน (All Day)</span>
        </div>
        <Switch
          checked={values.allDay}
          onCheckedChange={(v) => onChange({ allDay: v, startTime: "", endTime: "" })}
        />
      </div>

      {/* Date pickers */}
      <div className={cn("grid gap-3", values.endDate !== undefined ? "grid-cols-2" : "grid-cols-1")}>

        {/* Start date */}
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            {values.endDate ? "วันเริ่มต้น" : "วันที่จัดงาน"}
          </p>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <DateButton
              value={values.startDate}
              placeholder="เลือกวันที่"
              onClear={() => onChange({ startDate: "", endDate: "" })}
            >
              {values.startDate ? formatDateDisplay(values.startDate) : "เลือกวันที่"}
            </DateButton>
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border" align="start">
              <DayPicker
                mode="single"
                selected={startDateObj}
                onSelect={(d) => {
                  onChange({ startDate: toIso(d) })
                  setStartOpen(false)
                }}
                locale={th}
                classNames={DAY_PICKER_CLASSNAMES as any}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End date (when set) */}
        {values.endDate !== undefined && values.endDate !== "" && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted-foreground">วันสิ้นสุด</p>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <DateButton
                value={values.endDate}
                placeholder="เลือกวันที่"
                onClear={() => onChange({ endDate: "" })}
              >
                {values.endDate ? formatDateDisplay(values.endDate) : "เลือกวันที่"}
              </DateButton>
              <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border" align="start">
                <DayPicker
                  mode="single"
                  selected={endDateObj}
                  onSelect={(d) => {
                    onChange({ endDate: toIso(d) })
                    setEndOpen(false)
                  }}
                  disabled={startDateObj ? { before: startDateObj } : undefined}
                  locale={th}
                  classNames={DAY_PICKER_CLASSNAMES as any}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Add end date button */}
      {(values.endDate === "" || values.endDate === undefined) && values.startDate && (
        <button
          type="button"
          onClick={() => onChange({ endDate: values.startDate })}
          className="text-xs font-medium text-primary hover:underline"
        >
          + เพิ่มวันสิ้นสุด
        </button>
      )}

      {/* Time pickers (only when not all-day) */}
      {!values.allDay && values.startDate && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <TimeInput
            value={values.startTime}
            onChange={(v) => onChange({ startTime: v })}
            label="เวลาเริ่ม"
          />
          <TimeInput
            value={values.endTime}
            onChange={(v) => onChange({ endTime: v })}
            label="เวลาสิ้นสุด"
          />
        </div>
      )}
    </div>
  )
}
