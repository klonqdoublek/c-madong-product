"use client";

import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { useMyAttendance } from "@/hooks/use-events";
import { CalendarDays, Users } from "lucide-react";

export function ProfileStatsSection() {
  const t = useTranslations("profile");
  const { profile } = useUser();
  const { data: attendance } = useMyAttendance();

  // Calculate days in dorm from move_in_date
  const daysInDorm = profile?.move_in_date
    ? Math.floor(
        (Date.now() - new Date(profile.move_in_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  const totalDays = 365; // Mockup: 1 academic year

  // Events attended count
  const eventsAttended =
    attendance?.filter((a) => a.status === "attended").length ?? 0;
  const totalEvents = 12; // Mockup total

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Days in dorm */}
      <div className="rounded-xl bg-white p-4 shadow-[8px_5px_9px_0px_rgba(0,0,0,0.04),2px_1px_5px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cu-light-pink">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">
            {t("daysInDorm")}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-heading text-3xl font-bold text-primary">
            {daysInDorm}
          </span>
          <span className="text-xs text-muted-foreground">
            /{totalDays} {t("daysUnit")}
          </span>
        </div>
      </div>

      {/* Events attended */}
      <div className="rounded-xl bg-white p-4 shadow-[8px_5px_9px_0px_rgba(0,0,0,0.04),2px_1px_5px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cu-light-pink">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">
            {t("eventsAttended")}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-heading text-3xl font-bold text-primary">
            {eventsAttended}
          </span>
          <span className="text-xs text-muted-foreground">
            /{totalEvents} {t("eventsUnit")}
          </span>
        </div>
      </div>
    </div>
  );
}
