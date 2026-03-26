"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_DATA = {
  mandatory: 128,
  external: 45,
  internal: 82,
};

const SEGMENTS = [
  { key: "mandatoryEvents" as const, field: "mandatory" as const, color: "#DD598B" },
  { key: "externalEvents" as const, field: "external" as const, color: "#FBBF24" },
  { key: "internalEvents" as const, field: "internal" as const, color: "#60A5FA" },
];

export function DashboardAttendanceChart() {
  const t = useTranslations("admin.dashboardPage");

  const total = MOCK_DATA.mandatory + MOCK_DATA.external + MOCK_DATA.internal;

  // Build conic gradient
  let cumulative = 0;
  const stops = SEGMENTS.map(({ field, color }) => {
    const start = cumulative;
    const pct = (MOCK_DATA[field] / total) * 100;
    cumulative += pct;
    return `${color} ${start}% ${cumulative}%`;
  }).join(", ");

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">
          {t("attendanceChart")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${stops})`,
              }}
            />
            <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
              <span className="font-heading text-lg font-bold">{total}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {t("totalParticipants")}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3">
            {SEGMENTS.map(({ key, field, color }) => (
              <div key={field} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">{t(key)}</span>
                <span className="ml-auto font-heading text-sm font-bold">
                  {MOCK_DATA[field]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
