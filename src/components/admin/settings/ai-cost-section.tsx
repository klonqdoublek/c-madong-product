"use client"

import { useTranslations } from "next-intl"
import { BarChart3, TrendingUp } from "lucide-react"

// Static mock data — will be wired to real OpenAI usage API later
const MOCK_COST_DATA = {
  month: "มีนาคม 2569",
  totalCost: 245.5,
  models: [
    { name: "GPT-4o-mini", requests: 12450, cost: 85.0, color: "bg-blue-500" },
    { name: "GPT-4o (Vision)", requests: 340, cost: 120.5, color: "bg-purple-500" },
    { name: "Embeddings", requests: 8200, cost: 40.0, color: "bg-green-500" },
  ],
  dailyTrend: [
    3, 5, 8, 6, 12, 9, 7, 4, 10, 15, 8, 6, 11, 9, 7, 5, 13, 10, 8, 6, 14,
    11, 9, 7, 5, 12, 10, 8, 6, 4,
  ],
}

export function AICostSection() {
  const t = useTranslations("admin.settings.ai")
  const maxCost = Math.max(...MOCK_COST_DATA.models.map((m) => m.cost))
  const maxDaily = Math.max(...MOCK_COST_DATA.dailyTrend)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-lg font-bold">{t("costTitle")}</h2>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-5">
        {/* Monthly total */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t("monthlyCost")}</p>
            <p className="font-heading text-2xl font-bold text-primary">
              ฿ {MOCK_COST_DATA.totalCost.toFixed(2)}
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {MOCK_COST_DATA.month}
          </span>
        </div>

        {/* Model breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("modelBreakdown")}</p>
          {MOCK_COST_DATA.models.map((model) => (
            <div key={model.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {model.name}{" "}
                  <span className="text-muted-foreground/60">
                    ({model.requests.toLocaleString()} req)
                  </span>
                </span>
                <span className="font-mono font-medium">
                  ฿ {model.cost.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${model.color} transition-all`}
                  style={{ width: `${(model.cost / maxCost) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Daily trend sparkline */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            {t("dailyTrend")}
          </div>
          <div className="flex h-12 items-end gap-px">
            {MOCK_COST_DATA.dailyTrend.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-primary/30 transition-all hover:bg-primary/60"
                style={{ height: `${(val / maxDaily) * 100}%` }}
                title={`Day ${i + 1}: ${val} requests`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1</span>
            <span>15</span>
            <span>30</span>
          </div>
        </div>

        {/* Mock data badge */}
        <p className="text-center text-xs text-muted-foreground/60 italic">
          {t("costMockData")}
        </p>
      </div>
    </div>
  )
}
