"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface AISettingsData {
  "ai.primary_model": string
  "ai.temperature": number
  "ai.response_length": string
  "ai.vision_enabled": boolean
  "ai.vision_confidence": number
  "ai.tone_preset": string
  "ai.custom_instructions": string
  "ai.intent_threshold": number
  "ai.auto_escalate": boolean
  "ai.escalate_threshold": number
}

const DEFAULTS: AISettingsData = {
  "ai.primary_model": "gpt-4o-mini",
  "ai.temperature": 0.7,
  "ai.response_length": "standard",
  "ai.vision_enabled": true,
  "ai.vision_confidence": 0.7,
  "ai.tone_preset": "friendly",
  "ai.custom_instructions": "",
  "ai.intent_threshold": 0.7,
  "ai.auto_escalate": false,
  "ai.escalate_threshold": 0.5,
}

async function fetchSettings(): Promise<AISettingsData> {
  const res = await fetch("/api/admin/settings")
  if (!res.ok) throw new Error("Failed to fetch settings")
  const data = await res.json()
  return { ...DEFAULTS, ...data.settings }
}

async function updateSettings(
  settings: Partial<AISettingsData>
): Promise<void> {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  })
  if (!res.ok) throw new Error("Failed to save settings")
}

export function useAISettings() {
  return useQuery({
    queryKey: ["ai-settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
  })
}

export function useSaveAISettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-settings"] })
    },
  })
}

export function usePreviewChat() {
  return useMutation({
    mutationFn: async (opts: {
      message: string
      temperature: number
      tone_preset: string
      custom_instructions: string
      response_length: string
      model: string
    }) => {
      const res = await fetch("/api/admin/settings/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      })
      if (!res.ok) throw new Error("Preview failed")
      const data = await res.json()
      return data.reply as string
    },
  })
}
