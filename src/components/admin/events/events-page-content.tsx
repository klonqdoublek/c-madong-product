"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAdminEvents, useDeleteEvent } from "@/hooks/use-events";
import {
  EVENT_TYPE_CONFIG,
  EVENT_STATUS_CONFIG,
  EVENT_TYPES,
  EVENT_STATUSES,
} from "@/lib/utils/score-constants";
import { EventFormDialog } from "./event-form-dialog";
import {
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Users,
  AlertTriangle,
} from "lucide-react";
import type { EventType, EventStatus } from "@/lib/supabase/types";

export function AdminEventsPageContent() {
  const t = useTranslations("admin.eventsPage");
  const [showForm, setShowForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editEvent, setEditEvent] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: events, isLoading } = useAdminEvents({
    type: typeFilter !== "all" ? (typeFilter as EventType) : undefined,
    status: statusFilter !== "all" ? (statusFilter as EventStatus) : undefined,
  });
  const deleteEvent = useDeleteEvent();

  const allEvents = events ?? [];
  const upcomingCount = allEvents.filter(
    (e) => e.event_status === "published" || e.event_status === "ongoing"
  ).length;
  const mandatoryCount = allEvents.filter((e) => e.is_mandatory).length;

  const handleDelete = (id: string) => {
    if (window.confirm(t("deleteConfirm"))) {
      deleteEvent.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <button
          onClick={() => {
            setEditEvent(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("createEvent")}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("totalEvents")}
          value={allEvents.length}
          icon={<CalendarDays className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label={t("upcomingEvents")}
          value={upcomingCount}
          icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          label={t("mandatoryCount")}
          value={mandatoryCount}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          label={t("avgAttendance")}
          value="-"
          icon={<Users className="h-5 w-5 text-green-500" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm"
        >
          <option value="all">ทุกประเภท</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPE_CONFIG[type].labelTh}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-card px-3 py-2 text-sm"
        >
          <option value="all">ทุกสถานะ</option>
          {EVENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {EVENT_STATUS_CONFIG[status].labelTh}
            </option>
          ))}
        </select>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : allEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-8 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">กิจกรรม</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">วันที่</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">ประเภท</th>
                <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                <th className="px-4 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allEvents.map((event) => {
                const typeConfig = EVENT_TYPE_CONFIG[event.event_type as EventType];
                const statusConfig = EVENT_STATUS_CONFIG[event.event_status as EventStatus];
                return (
                  <tr key={event.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {event.title_th || event.title}
                        </span>
                        {event.is_mandatory && (
                          <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                            บังคับ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {new Date(event.event_date).toLocaleDateString("th-TH")}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {typeConfig && (
                        <span className={`rounded-full px-2 py-0.5 text-xs ${typeConfig.color}`}>
                          {typeConfig.labelTh}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {statusConfig && (
                        <span className={`rounded-full px-2 py-0.5 text-xs ${statusConfig.color}`}>
                          {statusConfig.labelTh}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditEvent(event);
                            setShowForm(true);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/admin/events/${event.id}/attendance`}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Attendance"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <EventFormDialog
          event={editEvent}
          onClose={() => {
            setShowForm(false);
            setEditEvent(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
