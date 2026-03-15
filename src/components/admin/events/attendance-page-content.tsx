"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEventDetail, useEventAttendees, useUpdateAttendance } from "@/hooks/use-events";
import { ATTENDANCE_STATUS_CONFIG } from "@/lib/utils/score-constants";
import { ArrowLeft, Check, Users } from "lucide-react";
import type { AttendanceStatus } from "@/lib/supabase/types";

export function AttendancePageContent({ eventId }: { eventId: string }) {
  const t = useTranslations("admin.eventsPage.attendancePage");
  const router = useRouter();

  const { data: event, isLoading: eventLoading } = useEventDetail(eventId);
  const { data: attendees, isLoading: attendeesLoading } = useEventAttendees(eventId);
  const updateAttendance = useUpdateAttendance();

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    updateAttendance.mutate({ id, status });
  };

  const handleMarkAllAttended = () => {
    (attendees ?? [])
      .filter((a) => a.status === "registered")
      .forEach((a) => {
        updateAttendance.mutate({ id: a.id, status: "attended" });
      });
  };

  if (eventLoading || attendeesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/events")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับ
      </button>

      {/* Event Info */}
      {event && (
        <div className="rounded-lg border bg-card p-4">
          <h1 className="font-heading text-xl font-bold">
            {event.title_th || event.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(event.event_date).toLocaleDateString("th-TH", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      )}

      {/* Header + Actions */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">
          <Users className="mr-2 inline h-5 w-5" />
          {t("title")} ({(attendees ?? []).length})
        </h2>
        <button
          onClick={handleMarkAllAttended}
          disabled={updateAttendance.isPending}
          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {t("markAllAttended")}
        </button>
      </div>

      {/* Attendees Table */}
      {(attendees ?? []).length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noAttendees")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  {t("studentName")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                  {t("studentId")}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {t("status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(attendees ?? []).map((att) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const profile = (att as any).profiles;
                return (
                  <tr key={att.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {profile?.full_name_th ?? "-"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {profile?.student_id ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={att.status}
                        onChange={(e) =>
                          handleStatusChange(
                            att.id,
                            e.target.value as AttendanceStatus
                          )
                        }
                        className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                          ATTENDANCE_STATUS_CONFIG[att.status as AttendanceStatus]
                            ?.color ?? ""
                        }`}
                      >
                        {(
                          Object.entries(ATTENDANCE_STATUS_CONFIG) as [
                            AttendanceStatus,
                            { labelTh: string },
                          ][]
                        ).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.labelTh}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
