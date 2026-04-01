"use client"

import { useTranslations } from "next-intl"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Brain, Eye, Gauge, Zap } from "lucide-react"
import type { AISettingsData } from "@/hooks/use-ai-settings"

interface AISettingsSectionProps {
  settings: AISettingsData
  onChange: (key: keyof AISettingsData, value: unknown) => void
}

export function AISettingsSection({
  settings,
  onChange,
}: AISettingsSectionProps) {
  const t = useTranslations("admin.settings.ai")

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-lg font-bold">{t("modelTitle")}</h2>
      </div>

      {/* Primary Model */}
      <div className="rounded-lg border bg-card p-4 space-y-5">
        <div className="space-y-2">
          <Label>{t("primaryModel")}</Label>
          <Select
            value={settings["ai.primary_model"]}
            onValueChange={(v) => onChange("ai.primary_model", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini (เร็ว, ประหยัด)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o (ฉลาดกว่า, แพงกว่า)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t("temperature")}</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {settings["ai.temperature"].toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.9"
            step="0.1"
            value={settings["ai.temperature"]}
            onChange={(e) =>
              onChange("ai.temperature", parseFloat(e.target.value))
            }
            className="w-full accent-primary"
          />
          <div className="flex gap-2">
            {[
              { label: t("focused"), value: 0.3, icon: <Gauge className="h-3 w-3" /> },
              { label: t("balanced"), value: 0.6, icon: <Zap className="h-3 w-3" /> },
              { label: t("creative"), value: 0.9, icon: <Brain className="h-3 w-3" /> },
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => onChange("ai.temperature", preset.value)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  settings["ai.temperature"] === preset.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {preset.icon}
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Response Length */}
        <div className="space-y-2">
          <Label>{t("responseLength")}</Label>
          <RadioGroup
            value={settings["ai.response_length"]}
            onValueChange={(v) => onChange("ai.response_length", v)}
            className="flex gap-4"
          >
            {(["brief", "standard", "detailed"] as const).map((len) => (
              <div key={len} className="flex items-center gap-2">
                <RadioGroupItem value={len} id={`len-${len}`} />
                <Label htmlFor={`len-${len}`} className="text-sm cursor-pointer">
                  {t(`length_${len}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Vision AI */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold">{t("visionTitle")}</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t("visionToggle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("visionDescription")}
            </p>
          </div>
          <Switch
            checked={settings["ai.vision_enabled"]}
            onCheckedChange={(v) => onChange("ai.vision_enabled", v)}
          />
        </div>

        {settings["ai.vision_enabled"] && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t("visionConfidence")}</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings["ai.vision_confidence"].toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="0.95"
              step="0.05"
              value={settings["ai.vision_confidence"]}
              onChange={(e) =>
                onChange("ai.vision_confidence", parseFloat(e.target.value))
              }
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              {t("visionConfidenceHint")}
            </p>
          </div>
        )}
      </div>

      {/* Thresholds & Escalation */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="font-heading font-semibold">{t("thresholdsTitle")}</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("intentThreshold")}</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {settings["ai.intent_threshold"].toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.9"
            step="0.1"
            value={settings["ai.intent_threshold"]}
            onChange={(e) =>
              onChange("ai.intent_threshold", parseFloat(e.target.value))
            }
            className="w-full accent-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t("autoEscalate")}</p>
            <p className="text-xs text-muted-foreground">
              {t("autoEscalateDescription")}
            </p>
          </div>
          <Switch
            checked={settings["ai.auto_escalate"]}
            onCheckedChange={(v) => onChange("ai.auto_escalate", v)}
          />
        </div>

        {settings["ai.auto_escalate"] && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t("escalateThreshold")}</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {settings["ai.escalate_threshold"].toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="0.7"
              step="0.1"
              value={settings["ai.escalate_threshold"]}
              onChange={(e) =>
                onChange("ai.escalate_threshold", parseFloat(e.target.value))
              }
              className="w-full accent-primary"
            />
          </div>
        )}
      </div>
    </div>
  )
}
