"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAddScoreEntry, useScoreCategories } from "@/hooks/use-score";
import { X } from "lucide-react";

interface AddScoreDialogProps {
  studentId: string | null;
  studentName: string | null;
  onClose: () => void;
}

export function AddScoreDialog({
  studentId,
  studentName,
  onClose,
}: AddScoreDialogProps) {
  const t = useTranslations("admin.scoresPage");
  const { data: categories } = useScoreCategories();
  const addEntry = useAddScoreEntry();

  const [form, setForm] = useState({
    student_id: studentId ?? "",
    category_id: "",
    points: 0,
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.category_id) return;

    await addEntry.mutateAsync({
      student_id: form.student_id,
      category_id: form.category_id,
      points: form.points,
      reason: form.reason || null,
      source: "manual_admin",
      description_th: form.reason || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">
            {t("addScoreEntry")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Student */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("student")} *
            </label>
            {studentName ? (
              <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                {studentName} ({studentId})
              </p>
            ) : (
              <input
                type="text"
                required
                placeholder="รหัสนิสิต"
                value={form.student_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, student_id: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("category")} *
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, category_id: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">เลือกหมวดหมู่</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_th || cat.name} (สูงสุด {cat.max_score})
                </option>
              ))}
            </select>
          </div>

          {/* Points */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("points")} *
            </label>
            <input
              type="number"
              required
              value={form.points}
              onChange={(e) =>
                setForm((f) => ({ ...f, points: Number(e.target.value) }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="บวก (+) หรือ ลบ (-)"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ใส่ค่าบวกเพื่อเพิ่มคะแนน ค่าลบเพื่อหักคะแนน
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("reason")}
            </label>
            <textarea
              rows={2}
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              placeholder={t("reasonPlaceholder")}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
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
              disabled={addEntry.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {addEntry.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
