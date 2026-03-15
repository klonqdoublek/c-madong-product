"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateEvent, useUpdateEvent } from "@/hooks/use-events";
import { useScoreCategories } from "@/hooks/use-score";
import {
  EVENT_TYPE_CONFIG,
  EVENT_STATUS_CONFIG,
  EVENT_TYPES,
  EVENT_STATUSES,
  IMPACT_LEVEL_CONFIG,
} from "@/lib/utils/score-constants";
import { X } from "lucide-react";
import type { Database, EventType, ImpactLevel } from "@/lib/supabase/types";

type DormEvent = Database["public"]["Tables"]["dorm_events"]["Row"];

interface EventFormDialogProps {
  event?: DormEvent | null;
  onClose: () => void;
}

export function EventFormDialog({ event, onClose }: EventFormDialogProps) {
  const t = useTranslations("admin.eventsPage");
  const tForm = useTranslations("admin.eventsPage.eventForm");
  const isEdit = !!event;

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { data: categories } = useScoreCategories();

  const [form, setForm] = useState({
    title: event?.title ?? "",
    title_th: event?.title_th ?? "",
    title_en: event?.title_en ?? "",
    description_th: event?.description_th ?? "",
    description_en: event?.description_en ?? "",
    location_th: event?.location_th ?? "",
    location_en: event?.location_en ?? "",
    event_type: event?.event_type ?? "meeting",
    impact_level: event?.impact_level ?? "medium",
    is_mandatory: event?.is_mandatory ?? false,
    event_date: event?.event_date ?? new Date().toISOString().split("T")[0],
    start_datetime: event?.start_datetime
      ? event.start_datetime.slice(0, 16)
      : "",
    end_datetime: event?.end_datetime ? event.end_datetime.slice(0, 16) : "",
    score_points: event?.score_points ?? 0,
    penalty_points: event?.penalty_points ?? 0,
    score_category_id: event?.score_category_id ?? "",
    max_capacity: event?.max_capacity ?? null,
    event_status: event?.event_status ?? "draft",
    academic_year: event?.academic_year ?? new Date().getFullYear() + 543,
    semester: event?.semester ?? 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title_th || form.title,
      title_th: form.title_th || null,
      title_en: form.title_en || null,
      description_th: form.description_th || null,
      description_en: form.description_en || null,
      location_th: form.location_th || null,
      location_en: form.location_en || null,
      event_type: form.event_type as DormEvent["event_type"],
      impact_level: form.impact_level as DormEvent["impact_level"],
      is_mandatory: form.is_mandatory,
      event_date: form.event_date,
      start_datetime: form.start_datetime || null,
      end_datetime: form.end_datetime || null,
      score_points: form.score_points,
      penalty_points: form.penalty_points,
      score_category_id: form.score_category_id || null,
      max_capacity: form.max_capacity,
      event_status: form.event_status as DormEvent["event_status"],
      academic_year: form.academic_year,
      semester: form.semester,
    };

    if (isEdit && event) {
      await updateEvent.mutateAsync({ id: event.id, ...payload });
    } else {
      await createEvent.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">
            {isEdit ? t("editEvent") : t("createEvent")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title TH/EN */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("titleTh")} *
              </label>
              <input
                type="text"
                required
                value={form.title_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title_th: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("titleEn")}
              </label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title_en: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("descriptionTh")}
              </label>
              <textarea
                rows={3}
                value={form.description_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description_th: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("descriptionEn")}
              </label>
              <textarea
                rows={3}
                value={form.description_en}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description_en: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("locationTh")}
              </label>
              <input
                type="text"
                value={form.location_th}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location_th: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("locationEn")}
              </label>
              <input
                type="text"
                value={form.location_en}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location_en: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Type, Impact, Mandatory */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("eventType")}
              </label>
              <select
                value={form.event_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, event_type: e.target.value as EventType }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_CONFIG[type].labelTh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("impactLevel")}
              </label>
              <select
                value={form.impact_level}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    impact_level: e.target.value as ImpactLevel,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {(["high", "medium", "low"] as const).map((level) => (
                  <option key={level} value={level}>
                    {IMPACT_LEVEL_CONFIG[level].labelTh}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                id="mandatory"
                checked={form.is_mandatory}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_mandatory: e.target.checked }))
                }
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="mandatory" className="text-sm font-medium">
                {tForm("isMandatory")}
              </label>
            </div>
          </div>

          {/* Date/Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("startDatetime")}
              </label>
              <input
                type="datetime-local"
                value={form.start_datetime}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    start_datetime: e.target.value,
                    event_date: e.target.value.split("T")[0] || f.event_date,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("endDatetime")}
              </label>
              <input
                type="datetime-local"
                value={form.end_datetime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_datetime: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Score */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("scorePoints")}
              </label>
              <input
                type="number"
                value={form.score_points}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    score_points: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("penaltyPoints")}
              </label>
              <input
                type="number"
                value={form.penalty_points}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    penalty_points: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("scoreCategory")}
              </label>
              <select
                value={form.score_category_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    score_category_id: e.target.value,
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">-</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_th || cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity, Status, Year/Semester */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("maxCapacity")}
              </label>
              <input
                type="number"
                value={form.max_capacity ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    max_capacity: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                placeholder="ไม่จำกัด"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("status")}
              </label>
              <select
                value={form.event_status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, event_status: e.target.value as DormEvent["event_status"] }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {EVENT_STATUS_CONFIG[status].labelTh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("academicYear")}
              </label>
              <input
                type="number"
                value={form.academic_year}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    academic_year: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {tForm("semester")}
              </label>
              <select
                value={form.semester}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    semester: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3 (ฤดูร้อน)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending
                ? "กำลังบันทึก..."
                : isEdit
                  ? "บันทึก"
                  : t("createEvent")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
