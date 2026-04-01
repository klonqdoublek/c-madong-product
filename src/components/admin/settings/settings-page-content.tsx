"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AISettingsSection } from "./ai-settings-section"
import { ToneSettingsSection } from "./tone-settings-section"
import { AICostSection } from "./ai-cost-section"
import { useAISettings, useSaveAISettings, type AISettingsData } from "@/hooks/use-ai-settings"
import { Settings, Brain, Save, Loader2 } from "lucide-react"

export function SettingsPageContent() {
  const t = useTranslations("admin.settings")

  // ─── Legacy localStorage keys ──────────────────────────────
  const [geminiKey, setGeminiKey] = useState("")
  const [openaiKey, setOpenaiKey] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGeminiKey(localStorage.getItem("admin_gemini_key") ?? "")
    setOpenaiKey(localStorage.getItem("admin_openai_key") ?? "")
  }, [])

  function handleSave() {
    localStorage.setItem("admin_gemini_key", geminiKey)
    localStorage.setItem("admin_openai_key", openaiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ─── AI Settings (from DB) ─────────────────────────────────
  const { data: aiSettings, isLoading: aiLoading } = useAISettings()
  const saveMutation = useSaveAISettings()
  const [draft, setDraft] = useState<AISettingsData | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync draft with fetched data
  useEffect(() => {
    if (aiSettings && !draft) {
      setDraft(aiSettings)
    }
  }, [aiSettings, draft])

  const handleAIChange = useCallback(
    (key: keyof AISettingsData, value: unknown) => {
      setDraft((prev) => {
        if (!prev) return prev
        return { ...prev, [key]: value }
      })
      setHasChanges(true)
    },
    []
  )

  const handleAISave = async () => {
    if (!draft) return
    await saveMutation.mutateAsync(draft)
    setHasChanges(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminBreadcrumb />
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            {t("tabAI")}
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            {t("tabGeneral")}
          </TabsTrigger>
        </TabsList>

        {/* ===== AI TAB ===== */}
        <TabsContent value="ai" className="mt-6 space-y-8">
          {aiLoading || !draft ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <AISettingsSection settings={draft} onChange={handleAIChange} />
              <ToneSettingsSection settings={draft} onChange={handleAIChange} />
              <AICostSection />

              {/* Save button — sticky bottom */}
              {hasChanges && (
                <div className="sticky bottom-4 flex justify-end">
                  <Button
                    onClick={handleAISave}
                    disabled={saveMutation.isPending}
                    className="shadow-lg"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {t("saveAI")}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== GENERAL TAB ===== */}
        <TabsContent value="general" className="mt-6 space-y-6">
          {/* LINE OA Info */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-heading font-semibold">{t("lineOA")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("lineOADescription")}
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("lineChannelId")}
                </span>
                <span className="font-mono">
                  {process.env.NEXT_PUBLIC_LINE_CHANNEL_ID
                    ? "***configured***"
                    : t("notConfigured")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("lineLoginId")}
                </span>
                <span className="font-mono">
                  {process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID
                    ? "***configured***"
                    : t("notConfigured")}
                </span>
              </div>
            </div>
          </div>

          {/* AI API Keys (localStorage) */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-heading font-semibold">{t("aiKeys")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("aiKeysDescription")}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("geminiKey")}
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder={t("keyPlaceholder")}
                  className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("openaiKey")}
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder={t("keyPlaceholder")}
                  className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm"
                />
              </div>

              <button
                onClick={handleSave}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {saved ? t("saved") : t("saveKeys")}
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-heading font-semibold">{t("appInfo")}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("version")}</span>
                <span>2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("environment")}
                </span>
                <span>{process.env.NODE_ENV}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
