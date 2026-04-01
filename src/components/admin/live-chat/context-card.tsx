"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, User, Brain, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Escalation, EscalationStudent } from "@/hooks/use-escalations"

interface ContextCardProps {
  student: EscalationStudent | null | undefined
  escalation: Escalation
}

export function ContextCard({ student, escalation }: ContextCardProps) {
  const t = useTranslations("admin.liveChat")
  const [isExpanded, setIsExpanded] = useState(true)

  const aiContext = escalation.ai_context as {
    last_messages?: { role: string; content: string }[]
    intent?: string
    confidence?: number
    trigger?: string
  }

  const reason =
    escalation.reason === "user_request"
      ? t("reasonUserRequest")
      : escalation.reason === "low_confidence"
        ? t("reasonLowConfidence")
        : escalation.reason

  return (
    <div className="border-b bg-blue-50/50">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
          <Brain className="size-3.5" />
          {t("contextTitle")}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-blue-500 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Student info */}
          <div className="flex items-center gap-2 text-xs">
            <User className="size-3 text-muted-foreground" />
            <span className="font-medium">
              {student?.display_name ?? student?.full_name_th ?? "นิสิต"}
            </span>
            {student?.building_name && (
              <span className="text-muted-foreground">
                {student.building_name}
                {student.room_number ? ` ห้อง ${student.room_number}` : ""}
              </span>
            )}
          </div>

          {/* Escalation reason */}
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="size-3 text-yellow-600" />
            <span className="text-muted-foreground">{t("reason")}:</span>
            <span className="font-medium">{reason}</span>
            {aiContext?.confidence && (
              <span className="text-muted-foreground">
                (confidence: {(aiContext.confidence * 100).toFixed(0)}%)
              </span>
            )}
          </div>

          {/* Last messages from AI context */}
          {aiContext?.last_messages && aiContext.last_messages.length > 0 && (
            <div className="mt-1.5 rounded-lg bg-white/80 p-2.5 space-y-1.5">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">
                {t("recentMessages")}
              </p>
              {aiContext.last_messages.slice(-3).map((msg, i) => (
                <div key={i} className="text-xs">
                  <span
                    className={cn(
                      "font-medium",
                      msg.role === "user"
                        ? "text-foreground"
                        : "text-cu-muted"
                    )}
                  >
                    {msg.role === "user" ? "นิสิต" : "น้องซี"}:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {msg.content.slice(0, 120)}
                    {msg.content.length > 120 ? "..." : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
