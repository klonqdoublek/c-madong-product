"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Archive, Pencil, Users } from "lucide-react";
import {
  useAdminDormCalendarItems,
  useDeleteDormCalendarItem,
} from "@/hooks/use-dorm-calendar";
import type { DormCalendarItem } from "@/hooks/use-dorm-calendar";
import { ItemFormDialog } from "./item-form-dialog";
import { AttendanceBatchDialog } from "./attendance-batch-dialog";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  reapplication:          "ยื่นขออยู่หอต่อ",
  cr54_upload:            "ผลลงทะเบียน CR54",
  shop_evaluation:        "ประเมินร้านค้า",
  fire_drill_theory:      "อบรมดับเพลิง (ทฤษฎี)",
  fire_drill_practical:   "อบรมดับเพลิง (ปฏิบัติ)",
  dorm_meeting:           "ประชุมหอพัก",
  dorm_inspection:        "ตรวจหอพัก",
  important_announcement: "ประกาศจำเป็น",
};

export function AdminDormCalendarContent() {
  const { data: items, isLoading } = useAdminDormCalendarItems();
  const { mutate: archiveItem } = useDeleteDormCalendarItem();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DormCalendarItem | null>(null);
  const [attendanceItem, setAttendanceItem] = useState<DormCalendarItem | null>(null);

  const active = (items ?? []).filter((i) => !i.archivedAt);
  const archived = (items ?? []).filter((i) => !!i.archivedAt);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#3f3f3d]">ปฏิทินนิสิตหอพัก</h1>
          <p className="mt-0.5 text-sm text-[#979795]">จัดการรายการที่นิสิตต้องทำ</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="flex items-center gap-1.5 rounded-full bg-[#dd598b] px-4 py-2 text-sm font-bold text-white"
        >
          <Plus className="size-4" />
          เพิ่มรายการ
        </button>
      </div>

      {/* Active items */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-[#565655]">รายการที่ใช้งาน ({active.length})</p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-black/5" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <p className="text-sm text-[#979795]">ยังไม่มีรายการ</p>
        ) : (
          <div className="space-y-2">
            {active.map((item) => (
              <AdminItemRow
                key={item.id}
                item={item}
                onEdit={() => { setEditing(item); setFormOpen(true); }}
                onArchive={() => archiveItem(item.id)}
                onMarkAttendance={() => setAttendanceItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived */}
      {archived.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-[#979795]">เก็บถาวร ({archived.length})</p>
          <div className="space-y-2 opacity-50">
            {archived.map((item) => (
              <AdminItemRow
                key={item.id}
                item={item}
                onEdit={() => {}}
                onArchive={() => {}}
                onMarkAttendance={() => {}}
                archived
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ItemFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        editItem={editing}
      />
      {attendanceItem && (
        <AttendanceBatchDialog
          open
          item={attendanceItem}
          onClose={() => setAttendanceItem(null)}
        />
      )}
    </div>
  );
}

function AdminItemRow({
  item,
  onEdit,
  onArchive,
  onMarkAttendance,
  archived,
}: {
  item: DormCalendarItem;
  onEdit: () => void;
  onArchive: () => void;
  onMarkAttendance: () => void;
  archived?: boolean;
}) {
  const due = new Date(item.dueAt);
  const isPast = due < new Date();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/8 bg-white px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold text-[#3f3f3d]">{item.titleTh}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#979795]">
          <span>{CATEGORY_LABELS[item.category] ?? item.category}</span>
          <span>•</span>
          <span className={cn(isPast ? "text-red-400" : "")}>
            {due.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          {item.semester && <span>• {item.semester}</span>}
        </div>
      </div>

      {!archived && (
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onMarkAttendance}
            className="flex size-8 items-center justify-center rounded-lg text-[#565655] hover:bg-black/5"
            title="mark attendance"
          >
            <Users className="size-4" />
          </button>
          <button
            onClick={onEdit}
            className="flex size-8 items-center justify-center rounded-lg text-[#565655] hover:bg-black/5"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={onArchive}
            className="flex size-8 items-center justify-center rounded-lg text-[#979795] hover:bg-black/5"
          >
            <Archive className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
