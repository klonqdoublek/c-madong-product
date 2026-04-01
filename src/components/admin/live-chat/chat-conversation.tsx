"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  useEscalationMessages,
  useClaimEscalation,
  useCloseEscalation,
  useSendAdminReply,
} from "@/hooks/use-escalations"
import { ContextCard } from "./context-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Send,
  HandHelping,
  X,
  Bot,
  User,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatConversationProps {
  escalationId: string
  onBack: () => void
  onClosed: () => void
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ChatConversation({
  escalationId,
  onBack,
  onClosed,
}: ChatConversationProps) {
  const t = useTranslations("admin.liveChat")
  const { data, isLoading } = useEscalationMessages(escalationId)
  const claimMutation = useClaimEscalation()
  const closeMutation = useCloseEscalation()
  const replyMutation = useSendAdminReply()

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const escalation = data?.escalation
  const student = data?.student
  const messages = data?.messages ?? []
  const isReadOnly = escalation?.status === "closed"
  const isWaiting = escalation?.status === "waiting"
  const isActive = escalation?.status === "active"

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages.length])

  const handleClaim = async () => {
    await claimMutation.mutateAsync(escalationId)
  }

  const handleClose = async () => {
    await closeMutation.mutateAsync(escalationId)
    onClosed()
  }

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || replyMutation.isPending) return
    setInput("")
    await replyMutation.mutateAsync({
      escalationId,
      message: msg,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted sm:hidden"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <p className="font-heading text-sm font-bold">
              {student?.display_name ?? student?.full_name_th ?? "นิสิต"}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  isWaiting && "border-yellow-300 text-yellow-700",
                  isActive && "border-green-300 text-green-700",
                  isReadOnly && "border-gray-300 text-gray-500"
                )}
              >
                {isWaiting
                  ? "รอดำเนินการ"
                  : isActive
                    ? "กำลังคุย"
                    : "ปิดแล้ว"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isWaiting && (
            <Button
              size="sm"
              onClick={handleClaim}
              disabled={claimMutation.isPending}
              className="gap-1"
            >
              <HandHelping className="size-3.5" />
              {t("takeOver")}
            </Button>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
              disabled={closeMutation.isPending}
              className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="size-3.5" />
              {t("closeReturn")}
            </Button>
          )}
        </div>
      </div>

      {/* Context card */}
      {escalation && (
        <ContextCard
          student={student}
          escalation={escalation}
        />
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-muted/20 px-4 py-3"
      >
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.map((msg) => {
            const isUser = msg.sender_type === "user"
            const isAdmin = msg.sender_type === "admin"
            const isSystem = msg.role === "system" || msg.sender_type === "system"

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {msg.content}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  isUser ? "justify-start" : "justify-end"
                )}
              >
                {/* Avatar for user/AI */}
                {isUser && (
                  <div className="mr-2 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                )}
                {!isUser && !isAdmin && (
                  <div className="order-1 ml-2 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-cu-light-pink">
                    <Image
                      src="/images/mascot.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="size-[18px]"
                    />
                  </div>
                )}

                <div className="max-w-[75%]">
                  {/* Sender label */}
                  <p
                    className={cn(
                      "mb-0.5 text-[10px] font-medium",
                      isUser
                        ? "text-muted-foreground"
                        : isAdmin
                          ? "text-right text-blue-600"
                          : "text-right text-cu-muted"
                    )}
                  >
                    {isUser
                      ? student?.display_name ?? "นิสิต"
                      : isAdmin
                        ? "คุณ (แอดมิน)"
                        : "น้องซีมะโด่ง"}
                  </p>

                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      isUser
                        ? "rounded-bl-sm bg-white text-foreground border"
                        : isAdmin
                          ? "rounded-br-sm bg-blue-600 text-white"
                          : "rounded-br-sm bg-muted text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  <p
                    className={cn(
                      "mt-0.5 text-[10px] text-muted-foreground",
                      isUser ? "text-left" : "text-right"
                    )}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>

                {/* Admin avatar on right */}
                {isAdmin && (
                  <div className="order-1 ml-2 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Shield className="size-4 text-blue-600" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Reply input — only for active escalation */}
      {isActive && (
        <div className="border-t bg-white px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("replyPlaceholder")}
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-muted/30 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || replyMutation.isPending}
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Read-only banner for closed */}
      {isReadOnly && (
        <div className="border-t bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          {t("conversationClosed")}
        </div>
      )}
    </div>
  )
}
