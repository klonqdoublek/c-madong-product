"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useEventDetail,
  useMyEventAttendance,
  useRegisterEvent,
  useUnregisterEvent,
} from "@/hooks/use-events";
import { useEvaluationForm, useMySubmission } from "@/hooks/use-evaluation";
import { EVENT_TYPE_CONFIG, ATTENDANCE_STATUS_CONFIG } from "@/lib/utils/score-constants";
import {
  CalendarDays,
  MapPin,
  Users,
  Trophy,
  AlertTriangle,
  Check,
  ClipboardList,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import type { EventType, AttendanceStatus } from "@/lib/supabase/types";

export function EventDetailContent({ eventId }: { eventId: string }) {
  const t = useTranslations("events");
  const tDetail = useTranslations("events.detail");
  const tEval = useTranslations("evaluation");

  const { data: event, isLoading } = useEventDetail(eventId);
  const { data: myAttendance } = useMyEventAttendance(eventId);
  const registerEvent = useRegisterEvent();
  const unregisterEvent = useUnregisterEvent();

  // Check if this is an evaluation event
  const { data: evaluationForm } = useEvaluationForm(
    event?.event_type === "evaluation" ? eventId : null
  );
  const { data: evaluationSubmission } = useMySubmission(evaluationForm?.id ?? null);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const typeConfig = EVENT_TYPE_CONFIG[event.event_type as EventType];
  const isRegistered = !!myAttendance;
  const capacityPct =
    event.max_capacity && event.max_capacity > 0
      ? (event.attendance_count / event.max_capacity) * 100
      : null;
  const isFull =
    event.max_capacity !== null && event.attendance_count >= event.max_capacity;

  const formatDatetime = (dateStr: string | null, timeStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (timeStr) return `${formatted} ${timeStr}`;
    return formatted;
  };

  return (
    <>
      <PageHeader title={t("title")} backHref="/events" />
      <div className="space-y-4 p-4">

      {/* Cover image */}
      {event.cover_image && (
        <div className="overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.cover_image}
            alt={event.title_th || event.title}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {/* Title & badges */}
      <div>
        <h1 className="font-heading text-xl font-bold">
          {event.title_th || event.title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {typeConfig && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.labelTh}
            </span>
          )}
          {event.is_mandatory && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white">
              {t("mandatory")}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {(event.description_th || event.description) && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {event.description_th || event.description}
        </p>
      )}

      {/* Info cards */}
      <div className="space-y-2">
        <InfoRow
          icon={<CalendarDays className="h-4 w-4" />}
          label={tDetail("datetime")}
          value={formatDatetime(
            event.start_datetime || event.event_date,
            event.event_time
          )}
        />
        {(event.location_th || event.location) && (
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label={tDetail("location")}
            value={event.location_th || event.location || ""}
          />
        )}
        {event.score_points > 0 && (
          <InfoRow
            icon={<Trophy className="h-4 w-4 text-green-600" />}
            label={tDetail("scoreInfo")}
            value={tDetail("scoreReward", { points: event.score_points })}
          />
        )}
        {event.is_mandatory && event.penalty_points > 0 && (
          <InfoRow
            icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
            label=""
            value={tDetail("penaltyInfo", { points: event.penalty_points })}
          />
        )}
      </div>

      {/* Capacity bar */}
      {event.max_capacity !== null && (
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              {t("capacity")}
            </span>
            <span className="font-medium">
              {event.attendance_count}/{event.max_capacity}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(capacityPct ?? 0, 100)}%` }}
            />
          </div>
          {isFull ? (
            <p className="mt-1 text-xs text-destructive">{t("capacityFull")}</p>
          ) : event.max_capacity - event.attendance_count <= 10 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("spotsLeft", {
                count: event.max_capacity - event.attendance_count,
              })}
            </p>
          ) : null}
        </div>
      )}

      {/* My attendance status */}
      {myAttendance && myAttendance.status !== "registered" && (
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">{tDetail("myAttendance")}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              ATTENDANCE_STATUS_CONFIG[myAttendance.status as AttendanceStatus]?.color ?? ""
            }`}
          >
            {ATTENDANCE_STATUS_CONFIG[myAttendance.status as AttendanceStatus]?.labelTh ?? myAttendance.status}
          </span>
        </div>
      )}

      {/* Evaluation button for evaluation-type events */}
      {event.event_type === "evaluation" &&
        event.event_status !== "completed" &&
        event.event_status !== "cancelled" && (
          <Link href={`/events/${eventId}/evaluate`}>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90">
              <ClipboardList className="h-4 w-4" />
              {evaluationSubmission?.status === "completed"
                ? tEval("viewResult")
                : tEval("startEvaluation")}
            </button>
          </Link>
        )}

      {/* Register / Unregister button for non-evaluation events */}
      {event.event_type !== "evaluation" &&
        event.event_status !== "completed" &&
        event.event_status !== "cancelled" && (
          <div className="pb-4">
            {isRegistered ? (
              <button
                onClick={() => unregisterEvent.mutate(eventId)}
                disabled={unregisterEvent.isPending || myAttendance?.status !== "registered"}
                className="w-full rounded-lg border border-destructive bg-destructive/5 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                {t("unregister")}
              </button>
            ) : (
              <button
                onClick={() => registerEvent.mutate(eventId)}
                disabled={registerEvent.isPending || isFull}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {t("register")}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        {label && (
          <p className="text-xs text-muted-foreground">{label}</p>
        )}
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
