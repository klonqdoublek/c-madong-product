"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUpcomingEvents } from "@/hooks/use-events";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";

const EVENT_TYPE_COLORS: Record<string, string> = {
  mandatory: "from-primary/80 to-primary",
  external: "from-amber-400 to-amber-500",
  internal: "from-blue-400 to-blue-500",
};

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export function DashboardUpcomingEvents() {
  const t = useTranslations("admin.dashboardPage");
  const { data: events, isLoading } = useUpcomingEvents();

  const upcoming = (events ?? []).slice(0, 2);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base">
              {t("upcomingEvents")}
            </CardTitle>
            <CardDescription>{t("upcomingEventsDesc")}</CardDescription>
          </div>
          <Link
            href="/admin/events"
            className="text-sm text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("noUpcomingEvents")}
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => {
              const gradient =
                EVENT_TYPE_COLORS[event.event_type ?? "internal"] ??
                EVENT_TYPE_COLORS.internal;
              return (
                <Link
                  key={event.id}
                  href={`/admin/events`}
                  className="group block overflow-hidden rounded-xl border transition-shadow hover:shadow-hover"
                >
                  <div
                    className={`bg-gradient-to-r ${gradient} px-4 py-3 text-white`}
                  >
                    <p className="truncate font-heading text-sm font-bold">
                      {event.title_th ?? event.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white px-4 py-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatEventDate(event.event_date)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
