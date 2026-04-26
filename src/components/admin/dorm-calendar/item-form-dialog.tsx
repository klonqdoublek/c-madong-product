"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  useCreateDormCalendarItem,
  useUpdateDormCalendarItem,
} from "@/hooks/use-dorm-calendar";
import type { DormCalendarItem, DormCalendarCategory, CalendarCtaType } from "@/hooks/use-dorm-calendar";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: DormCalendarCategory; label: string }[] = [
  { value: "reapplication",          label: "ยื่นขออยู่หอต่อ" },
  { value: "cr54_upload",            label: "ผลลงทะเบียน CR54" },
  { value: "shop_evaluation",        label: "ประเมินร้านค้า" },
  { value: "fire_drill_theory",      label: "อบรมดับเพลิง (ทฤษฎี)" },
  { value: "fire_drill_practical",   label: "อบรมดับเพลิง (ปฏิบัติ)" },
  { value: "dorm_meeting",           label: "ประชุมหอพัก" },
  { value: "dorm_inspection",        label: "ตรวจหอพัก" },
  { value: "important_announcement", label: "ประกาศจำเป็น" },
];

const CTA_TYPES: { value: CalendarCtaType; label: string }[] = [
  { value: "acknowledge",    label: "รับทราบ/เข้าร่วม" },
  { value: "internal_eval",  label: "แบบประเมินในแอป" },
  { value: "internal_quiz",  label: "แบบทดสอบ (ดับเพลิง)" },
  { value: "external_url",   label: "ลิงก์ภายนอก" },
  { value: "read_more",      label: "อ่านประกาศ" },
  { value: "none",           label: "ข้อมูลเท่านั้น" },
];

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  editItem?: DormCalendarItem | null;
}

export function ItemFormDialog({ open, onClose, editItem }: ItemFormDialogProps) {
  const { mutate: create, isPending: isCreating } = useCreateDormCalendarItem();
  const { mutate: update, isPending: isUpdating } = useUpdateDormCalendarItem();
  const isPending = isCreating || isUpdating;

  const [form, setForm] = useState({
    category:       "dorm_meeting" as DormCalendarCategory,
    titleTh:        "",
    titleEn:        "",
    descriptionTh:  "",
    startAt:        "",
    dueAt:          "",
    audience:       "นิสิตหอพักทุกคน",
    isRequired:     true,
    ctaType:        "acknowledge" as CalendarCtaType,
    ctaUrl:         "",
    ctaEventId:     "",
    scorePoints:    0,
    penaltyPoints:  0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editItem) {
      setForm({
        category:      editItem.category,
        titleTh:       editItem.titleTh,
        titleEn:       editItem.titleEn ?? "",
        descriptionTh: editItem.descriptionTh ?? "",
        startAt:       editItem.startAt?.slice(0, 16) ?? "",
        dueAt:         editItem.dueAt?.slice(0, 16) ?? "",
        audience:      editItem.audience,
        isRequired:    editItem.isRequired,
        ctaType:       editItem.ctaType as CalendarCtaType,
        ctaUrl:        editItem.ctaUrl ?? "",
        ctaEventId:    editItem.ctaEventId ?? "",
        scorePoints:   editItem.scorePoints,
        penaltyPoints: editItem.penaltyPoints,
      });
    } else {
      setForm({
        category: "dorm_meeting", titleTh: "", titleEn: "", descriptionTh: "",
        startAt: "", dueAt: "", audience: "นิสิตหอพักทุกคน", isRequired: true,
        ctaType: "acknowledge", ctaUrl: "", ctaEventId: "",
        scorePoints: 0, penaltyPoints: 0,
      });
    }
    setError("");
  }, [editItem, open]);

  function handleSubmit() {
    if (!form.titleTh.trim() || !form.startAt || !form.dueAt) {
      setError("กรุณากรอกชื่อ, วันเริ่มต้น และวันสุดท้าย");
      return;
    }
    const payload = {
      ...form,
      ctaUrl:    form.ctaUrl || null,
      ctaEventId: form.ctaEventId || null,
    };
    if (editItem) {
      update({ id: editItem.id, ...payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center">
      <div className="w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white p-6 sm:mx-auto sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-[#3f3f3d]">
            {editItem ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X className="size-5 text-[#979795]" />
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-4 space-y-4">
          {/* Category */}
          <Field label="หมวดหมู่">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as DormCalendarCategory })}
              className="input-base"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          {/* Title */}
          <Field label="ชื่อ (ภาษาไทย) *">
            <input
              type="text"
              value={form.titleTh}
              onChange={(e) => setForm({ ...form, titleTh: e.target.value })}
              placeholder="ชื่อกิจกรรม"
              className="input-base"
            />
          </Field>

          {/* Description */}
          <Field label="รายละเอียด">
            <textarea
              value={form.descriptionTh}
              onChange={(e) => setForm({ ...form, descriptionTh: e.target.value })}
              placeholder="คำอธิบายเพิ่มเติม"
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="วันเริ่มต้น *">
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                className="input-base"
              />
            </Field>
            <Field label="วันสุดท้าย *">
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                className="input-base"
              />
            </Field>
          </div>

          {/* CTA Type */}
          <Field label="ประเภท CTA">
            <select
              value={form.ctaType}
              onChange={(e) => setForm({ ...form, ctaType: e.target.value as CalendarCtaType })}
              className="input-base"
            >
              {CTA_TYPES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          {form.ctaType === "external_url" && (
            <Field label="URL ภายนอก">
              <input
                type="url"
                value={form.ctaUrl}
                onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                placeholder="https://..."
                className="input-base"
              />
            </Field>
          )}

          {form.ctaType === "internal_eval" && (
            <Field label="Event ID (สำหรับ evaluate)">
              <input
                type="text"
                value={form.ctaEventId}
                onChange={(e) => setForm({ ...form, ctaEventId: e.target.value })}
                placeholder="UUID ของ dorm_events"
                className="input-base"
              />
            </Field>
          )}

          {/* Score */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="คะแนน (+)">
              <input
                type="number"
                min={0}
                value={form.scorePoints}
                onChange={(e) => setForm({ ...form, scorePoints: +e.target.value })}
                className="input-base"
              />
            </Field>
            <Field label="หักคะแนน (-)">
              <input
                type="number"
                min={0}
                value={form.penaltyPoints}
                onChange={(e) => setForm({ ...form, penaltyPoints: +e.target.value })}
                className="input-base"
              />
            </Field>
          </div>

          {/* Required toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
              className="size-4 rounded accent-[#dd598b]"
            />
            <span className="text-sm text-[#565655]">จำเป็น (ส่งผลต่อคะแนน/การพักอาศัย)</span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-6 h-12 w-full rounded-full bg-[#dd598b] text-sm font-bold text-white disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : editItem ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มรายการ"}
        </button>
      </div>

      <style jsx>{`
        .input-base {
          width: 100%;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.12);
          padding: 8px 12px;
          font-size: 14px;
          color: #3f3f3d;
          background: #fafafa;
          outline: none;
        }
        .input-base:focus {
          border-color: #dd598b;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-[#565655]">{label}</label>
      {children}
    </div>
  );
}
