"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useUpcomingEvents,
  usePastEvents,
  useMyAttendance,
  useRegisterEvent,
  useUnregisterEvent,
} from "@/hooks/use-events";
import { EVENT_TYPE_CONFIG } from "@/lib/utils/score-constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Check, X, AlertCircle } from "lucide-react";
import type { EventType, AttendanceStatus } from "@/lib/supabase/types";
import { PageHeader } from "@/components/layout/page-header";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function EventsPageContent() {
  const t = useTranslations("events");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingEvents();
  const { data: past, isLoading: pastLoading } = usePastEvents();
  const { data: myAttendance } = useMyAttendance();
  const registerEvent = useRegisterEvent();
  const unregisterEvent = useUnregisterEvent();

  const attendanceMap = new Map(
    (myAttendance ?? []).map((a) => [a.event_id, a])
  );

  const filterByType = <T extends { event_type: EventType }>(events: T[]) => {
    if (typeFilter === "all") return events;
    return events.filter((e) => e.event_type === typeFilter);
  };

  const filteredUpcoming = filterByType(upcoming ?? []);
  const filteredPast = filterByType(past ?? []);

  const handleRegister = (eventId: string) => {
    registerEvent.mutate(eventId);
  };

  const handleUnregister = (eventId: string) => {
    unregisterEvent.mutate(eventId);
  };

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="space-y-4 p-4">

      {/* Type filter */}
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("filter.allTypes")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allTypes")}</SelectItem>
          {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              {config.labelTh}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            {t("upcoming")}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            {t("past")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcomingLoading ? (
            <EventsSkeleton />
          ) : filteredUpcoming.length === 0 ? (
            <EmptyEvents message={t("noEvents")} />
          ) : (
            filteredUpcoming.map((event) => {
              const attendance = attendanceMap.get(event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  attendance={attendance}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  isRegistering={registerEvent.isPending}
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {pastLoading ? (
            <EventsSkeleton />
          ) : filteredPast.length === 0 ? (
            <EmptyEvents message={t("noEvents")} />
          ) : (
            filteredPast.map((event) => {
              const attendance = attendanceMap.get(event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  attendance={attendance}
                  isPast
                />
              );
            })
          )}
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}

function EventCard({
  event,
  attendance,
  onRegister,
  onUnregister,
  isPast,
  isRegistering,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attendance?: any;
  onRegister?: (id: string) => void;
  onUnregister?: (id: string) => void;
  isPast?: boolean;
  isRegistering?: boolean;
}) {
  const t = useTranslations("events");
  const date = new Date(event.event_date);
  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const typeConfig = EVENT_TYPE_CONFIG[event.event_type as EventType];
  const isRegistered = !!attendance;

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
        <div className="flex gap-3">
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-white">
            <span className="text-xs font-bold leading-none">{day}</span>
            <span className="text-[10px] leading-none">{month}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium">
                {event.title_th || event.title}
              </p>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {typeConfig && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${typeConfig.color}`}>
                  {typeConfig.labelTh}
                </span>
              )}
              {event.is_mandatory && (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {t("mandatory")}
                </span>
              )}
              {event.is_mandatory && event.penalty_points > 0 && (
                <span className="text-[10px] text-destructive">
                  {t("mandatoryPenalty", { points: event.penalty_points })}
                </span>
              )}
            </div>
            {event.location_th && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {event.location_th}
              </p>
            )}
          </div>
        </div>

        {/* Action area */}
        <div className="mt-2 flex items-center justify-end gap-2">
          {isPast && attendance ? (
            <AttendanceStatusBadge status={attendance.status} />
          ) : !isPast ? (
            isRegistered ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUnregister?.(event.id);
                }}
                className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
              >
                <Check className="mr-1 inline h-3 w-3" />
                {t("registered")}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRegister?.(event.id);
                }}
                disabled={isRegistering}
                className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {t("register")}
              </button>
            )
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const t = useTranslations("events.attendance");
  const configs: Record<AttendanceStatus, { icon: typeof Check; color: string }> = {
    registered: { icon: CalendarDays, color: "bg-blue-50 text-blue-700" },
    attended: { icon: Check, color: "bg-green-50 text-green-700" },
    absent: { icon: X, color: "bg-red-50 text-red-700" },
    excused: { icon: AlertCircle, color: "bg-yellow-50 text-yellow-700" },
  };
  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {t(status)}
    </span>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

function EmptyEvents({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-8 text-center">
      <CalendarDays className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
