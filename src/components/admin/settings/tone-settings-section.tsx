"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles, UserCheck, Laugh, Send } from "lucide-react"
import { usePreviewChat } from "@/hooks/use-ai-settings"
import { cn } from "@/lib/utils"
import type { AISettingsData } from "@/hooks/use-ai-settings"

interface ToneSettingsSectionProps {
  settings: AISettingsData
  onChange: (key: keyof AISettingsData, value: unknown) => void
}

const TONE_PRESETS = [
  {
    value: "professional",
    icon: <UserCheck className="h-5 w-5" />,
    example: "สวัสดีค่ะ มีอะไรให้ช่วยเหลือค่ะ",
  },
  {
    value: "friendly",
    icon: <Sparkles className="h-5 w-5" />,
    example: "สวัสดีจ้า! มีอะไรให้ช่วยไหมน้า",
  },
  {
    value: "casual",
    icon: <Laugh className="h-5 w-5" />,
    example: "หวัดดี! ว่าไงอ่ะ 😄",
  },
] as const

export function ToneSettingsSection({
  settings,
  onChange,
}: ToneSettingsSectionProps) {
  const t = useTranslations("admin.settings.ai")
  const [previewInput, setPreviewInput] = useState("")
  const [previewMessages, setPreviewMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([])
  const previewMutation = usePreviewChat()
  const previewScrollRef = useRef<HTMLDivElement>(null)

  const handlePreviewSend = async () => {
    const msg = previewInput.trim()
    if (!msg || previewMutation.isPending) return

    setPreviewInput("")
    setPreviewMessages((prev) => [...prev, { role: "user", content: msg }])

    try {
      const reply = await previewMutation.mutateAsync({
        message: msg,
        temperature: settings["ai.temperature"],
        tone_preset: settings["ai.tone_preset"],
        custom_instructions: settings["ai.custom_instructions"],
        response_length: settings["ai.response_length"],
        model: settings["ai.primary_model"],
      })
      setPreviewMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ])
    } catch {
      setPreviewMessages((prev) => [
        ...prev,
        { role: "assistant", content: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" },
      ])
    }

    requestAnimationFrame(() => {
      previewScrollRef.current?.scrollTo({
        top: previewScrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    })
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-lg font-bold">{t("toneTitle")}</h2>
      </div>

      {/* Tone Preset Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TONE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange("ai.tone_preset", preset.value)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
              settings["ai.tone_preset"] === preset.value
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-lg p-1.5",
                  settings["ai.tone_preset"] === preset.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {preset.icon}
              </span>
              <span className="font-heading text-sm font-bold">
                {t(`tone_${preset.value}`)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(`tone_${preset.value}_desc`)}
            </p>
            <p className="mt-1 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs italic text-muted-foreground">
              &ldquo;{preset.example}&rdquo;
            </p>
          </button>
        ))}
      </div>

      {/* Custom Instructions */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <Label>{t("customInstructions")}</Label>
        <Textarea
          value={settings["ai.custom_instructions"]}
          onChange={(e) => onChange("ai.custom_instructions", e.target.value)}
          placeholder={t("customInstructionsPlaceholder")}
          rows={3}
          className="resize-none text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {t("customInstructionsHint")}
        </p>
      </div>

      {/* Live Preview Mini-Chat */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="border-b bg-muted/30 px-4 py-2.5">
          <h3 className="font-heading text-sm font-bold">
            {t("livePreview")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("livePreviewHint")}
          </p>
        </div>

        {/* Messages */}
        <div
          ref={previewScrollRef}
          className="h-48 overflow-y-auto px-4 py-3"
        >
          {previewMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {t("livePreviewEmpty")}
            </div>
          ) : (
            <div className="space-y-2.5">
              {previewMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {previewMutation.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={previewInput}
              onChange={(e) => setPreviewInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handlePreviewSend()
                }
              }}
              placeholder={t("livePreviewPlaceholder")}
              className="flex-1 rounded-full border bg-muted/30 px-3 py-1.5 text-xs outline-none focus:border-primary"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 rounded-full p-0"
              onClick={handlePreviewSend}
              disabled={!previewInput.trim() || previewMutation.isPending}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
