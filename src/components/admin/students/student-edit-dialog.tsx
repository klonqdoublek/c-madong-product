"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBuildings, useRooms, useBeds } from "@/hooks/use-buildings";
import { useTags } from "@/hooks/use-tags";
import { useUpdateStudent } from "@/hooks/use-students";
import type { StudentWithRelations } from "@/types/students";

interface Props {
  student: StudentWithRelations;
  open: boolean;
  onClose: () => void;
}

export function StudentEditDialog({ student, open, onClose }: Props) {
  const t = useTranslations("admin.studentsPage");
  const tCommon = useTranslations("common");
  const { data: buildings } = useBuildings();
  const { data: allTags } = useTags();
  const updateStudent = useUpdateStudent();

  const [fullNameTh, setFullNameTh] = useState(student.full_name_th);
  const [studentIdVal, setStudentIdVal] = useState(student.student_id ?? "");
  const [buildingId, setBuildingId] = useState(student.building_id ?? "");
  const [roomId, setRoomId] = useState(student.room_id ?? "");
  const [bedId, setBedId] = useState(student.bed_id ?? "");
  const [tags, setTags] = useState<string[]>(student.tags ?? []);
  const [status, setStatus] = useState(student.status);

  const { data: rooms } = useRooms(buildingId || null);
  const { data: beds } = useBeds(roomId || null);

  useEffect(() => {
    if (open) {
      setFullNameTh(student.full_name_th);
      setStudentIdVal(student.student_id ?? "");
      setBuildingId(student.building_id ?? "");
      setRoomId(student.room_id ?? "");
      setBedId(student.bed_id ?? "");
      setTags(student.tags ?? []);
      setStatus(student.status);
    }
  }, [open, student]);

  async function handleSave() {
    try {
      await updateStudent.mutateAsync({
        id: student.id,
        full_name_th: fullNameTh,
        student_id: studentIdVal || null,
        building_id: buildingId || null,
        room_id: roomId || null,
        bed_id: bedId || null,
        tags,
        status,
      });
      toast.success("บันทึกข้อมูลนิสิตเรียบร้อยแล้ว");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "บันทึกไม่สำเร็จ");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        <h2 className="font-heading text-lg font-bold">{t("editStudent")}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("name")}</label>
            <input
              value={fullNameTh}
              onChange={(e) => setFullNameTh(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t("studentId")}</label>
            <input
              value={studentIdVal}
              onChange={(e) => setStudentIdVal(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t("building")}</label>
            <select
              value={buildingId}
              onChange={(e) => {
                setBuildingId(e.target.value);
                setRoomId("");
                setBedId("");
              }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("selectBuilding")}</option>
              {buildings?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name_th}
                </option>
              ))}
            </select>
          </div>

          {buildingId && (
            <div>
              <label className="mb-1 block text-sm font-medium">{t("room")}</label>
              <select
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setBedId("");
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t("selectRoom")}</option>
                {rooms?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} ({t("floorLabel", { floor: r.floor })})
                  </option>
                ))}
              </select>
            </div>
          )}

          {roomId && (
            <div>
              <label className="mb-1 block text-sm font-medium">{t("bed")}</label>
              <select
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t("selectBed")}</option>
                {beds?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bed_label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">{t("tags")}</label>
            <div className="flex flex-wrap gap-2">
              {allTags?.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    setTags((prev) =>
                      prev.includes(tag.name)
                        ? prev.filter((t) => t !== tag.name)
                        : [...prev, tag.name]
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    tags.includes(tag.name)
                      ? "text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                  style={
                    tags.includes(tag.name)
                      ? { backgroundColor: tag.color ?? undefined }
                      : undefined
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t("status")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="active">{t("statusActive")}</option>
              <option value="inactive">{t("statusInactive")}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={updateStudent.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {tCommon("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
