"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMarkAttendance } from "@/hooks/use-dorm-calendar";
import type { DormCalendarItem } from "@/hooks/use-dorm-calendar";

interface AttendanceBatchDialogProps {
  open: boolean;
  item: DormCalendarItem;
  onClose: () => void;
}

export function AttendanceBatchDialog({ open, item, onClose }: AttendanceBatchDialogProps) {
  const { mutate: mark, isPending } = useMarkAttendance();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  // NOTE: In a real implementation, fetch student list from /api/admin/students
  // For now, show a simplified UI with manual ID entry
  const [manualIds, setManualIds] = useState("");

  function handleMark() {
    const ids = manualIds
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) return;

    mark(
      { itemId: item.id, userIds: ids },
      { onSuccess: onClose }
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center">
      <div className="w-full rounded-t-2xl bg-white p-6 sm:mx-auto sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-[#3f3f3d]">
            Mark Attendance — {item.titleTh}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X className="size-5 text-[#979795]" />
          </button>
        </div>

        <p className="mt-2 text-sm text-[#979795]">
          วาง User ID (UUID) ของนิสิตที่เข้าร่วม แต่ละบรรทัดหรือคั่นด้วยลูกน้ำ
        </p>

        <textarea
          value={manualIds}
          onChange={(e) => setManualIds(e.target.value)}
          placeholder={"uuid1\nuuid2\nuuid3"}
          rows={6}
          className="mt-3 w-full resize-none rounded-xl border border-black/12 bg-[#fafafa] px-3 py-2.5 font-mono text-xs text-[#3f3f3d] outline-none focus:border-[#dd598b]"
        />

        <p className="mt-1.5 text-xs text-[#979795]">
          {manualIds.split(/[\n,]+/).filter((s) => s.trim()).length} รายการ
        </p>

        <button
          onClick={handleMark}
          disabled={isPending || !manualIds.trim()}
          className="mt-4 h-11 w-full rounded-full bg-[#dd598b] text-sm font-bold text-white disabled:opacity-40"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกการเข้าร่วม"}
        </button>
      </div>
    </div>
  );
}
