"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb"
import { EscalationQueue } from "./escalation-queue"
import { ChatConversation } from "./chat-conversation"
import { Headset } from "lucide-react"

export function LiveChatContent() {
  const t = useTranslations("admin.liveChat")
  const searchParams = useSearchParams()
  const initialSession = searchParams.get("session")

  const [selectedId, setSelectedId] = useState<string | null>(
    initialSession ?? null
  )

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-dvh">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 lg:px-6">
        <AdminBreadcrumb />
        <div className="mt-1 flex items-center gap-2">
          <Headset className="h-5 w-5 text-primary" />
          <h1 className="font-heading text-xl font-bold">{t("title")}</h1>
        </div>
      </div>

      {/* 2-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Queue */}
        <div
          className={`w-full shrink-0 border-r bg-white sm:w-80 lg:w-96 ${
            selectedId ? "hidden sm:block" : ""
          }`}
        >
          <EscalationQueue
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Right panel — Conversation */}
        <div
          className={`flex-1 ${
            !selectedId ? "hidden sm:flex" : "flex"
          } flex-col`}
        >
          {selectedId ? (
            <ChatConversation
              escalationId={selectedId}
              onBack={() => setSelectedId(null)}
              onClosed={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
              <Headset className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 font-heading font-bold">
                {t("selectConversation")}
              </p>
              <p className="mt-1 text-sm">{t("selectConversationHint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
