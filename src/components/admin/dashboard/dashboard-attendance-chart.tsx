"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAttendanceRate } from "@/hooks/use-dashboard-stats";

export function DashboardAttendanceChart() {
  const t = useTranslations("admin.dashboardPage");
  const { data, isLoading } = useAttendanceRate();

  const rate = data?.rate ?? 0;
  const attended = data?.attended ?? 0;
  const total = data?.total ?? 0;
  const absent = total - attended;
  const hasData = total > 0;

  // Conic gradient: attended (pink) then absent (gray)
  const attendedPct = hasData ? (attended / total) * 100 : 0;
  const stops = hasData
    ? `#DD598B 0% ${attendedPct}%, #E5E7EB ${attendedPct}% 100%`
    : "#E5E7EB 0% 100%";

  function handleExport() {
    const rows = [
      ["อัตราการเข้าร่วมกิจกรรม"],
      ["เข้าร่วม", attended],
      ["ขาด", absent],
      ["ทั้งหมด", total],
      ["อัตรา (%)", rate],
    ];
    const csv =
      "﻿" +
      rows.map((r) => r.map(String).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base">{t("attendanceRateLabel")}</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-7 gap-1 text-xs">
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <div className="h-24 w-24 rounded-full border-4 border-muted" />
            <p className="mt-3 text-sm">{t("attendanceRateEmpty")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Donut */}
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(${stops})` }}
              />
              <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                <span className="font-heading text-2xl font-bold text-foreground">{rate}%</span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {t("attendanceChart")}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex w-full justify-around text-center text-xs">
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                <p className="mt-1 text-muted-foreground">{t("attendanceAttended")}</p>
                <p className="font-heading font-bold">{attended}</p>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
                <p className="mt-1 text-muted-foreground">{t("attendanceAbsent")}</p>
                <p className="font-heading font-bold">{absent}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
