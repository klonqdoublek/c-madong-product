"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useEscalationQueue, type Escalation } from "@/hooks/use-escalations"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Headset, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface EscalationQueueProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

function formatWaitTime(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return "เพิ่งเข้ามา"
  if (minutes < 60) return `${minutes} นาที`
  const hours = Math.floor(minutes / 60)
  return `${hours} ชม. ${minutes % 60} นาที`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function EscalationCard({
  escalation,
  isSelected,
  onClick,
  isHistory,
}: {
  escalation: Escalation
  isSelected: boolean
  onClick: () => void
  isHistory?: boolean
}) {
  const student = escalation.student
  const studentName =
    student?.display_name ?? student?.full_name_th ?? "นิสิต"

  // Extract issue summary from AI context
  const aiContext = escalation.ai_context as {
    last_messages?: { role: string; content: string }[]
  }
  const lastUserMsg = aiContext?.last_messages?.find(
    (m) => m.role === "user"
  )
  const issueSummary = lastUserMsg?.content?.slice(0, 80) ?? "ต้องการความช่วยเหลือ"

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {student?.avatar_url ? (
            <img
              src={student.avatar_url}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-bold">
              {studentName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {student?.building_name ?? ""}{" "}
              {student?.room_number ? `ห้อง ${student.room_number}` : ""}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[10px]",
            escalation.status === "waiting" &&
              "border-yellow-300 bg-yellow-50 text-yellow-700",
            escalation.status === "active" &&
              "border-green-300 bg-green-50 text-green-700",
            escalation.status === "closed" &&
              "border-gray-300 bg-gray-50 text-gray-500"
          )}
        >
          {escalation.status === "waiting"
            ? "รอดำเนินการ"
            : escalation.status === "active"
              ? "กำลังคุย"
              : "ปิดแล้ว"}
        </Badge>
      </div>

      {/* Issue summary */}
      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
        {issueSummary}
      </p>

      {/* Meta */}
      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Clock className="size-3" />
          {isHistory
            ? formatDate(escalation.closed_at ?? escalation.created_at)
            : formatWaitTime(escalation.created_at)}
        </span>
        {isHistory && escalation.admin && (
          <span className="flex items-center gap-0.5">
            <Headset className="size-3" />
            {escalation.admin.name}
          </span>
        )}
        {isHistory &&
          (escalation.closed_summary as { message_count?: number })
            ?.message_count && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="size-3" />
              {
                (escalation.closed_summary as { message_count: number })
                  .message_count
              }{" "}
              ข้อความ
            </span>
          )}
      </div>
    </button>
  )
}

export function EscalationQueue({
  selectedId,
  onSelect,
}: EscalationQueueProps) {
  const t = useTranslations("admin.liveChat")
  const [tab, setTab] = useState<"active" | "history">("active")
  const { data: escalations, isLoading } = useEscalationQueue(tab)

  const waitingCount =
    tab === "active"
      ? escalations?.filter((e) => e.status === "waiting").length ?? 0
      : 0

  return (
    <div className="flex h-full flex-col">
      {/* Tab switcher */}
      <div className="border-b px-3 py-2">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "active" | "history")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="text-xs">
              {t("tabActive")}
              {waitingCount > 0 && (
                <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white">
                  {waitingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              {t("tabHistory")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !escalations?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Headset className="size-10 text-muted-foreground/30" />
            <p className="mt-3 font-heading text-sm font-bold text-muted-foreground">
              {tab === "active"
                ? t("emptyQueue")
                : t("emptyHistory")}
            </p>
          </div>
        ) : (
          escalations.map((esc) => (
            <EscalationCard
              key={esc.id}
              escalation={esc}
              isSelected={selectedId === esc.id}
              onClick={() => onSelect(esc.id)}
              isHistory={tab === "history"}
            />
          ))
        )}
      </div>
    </div>
  )
}
