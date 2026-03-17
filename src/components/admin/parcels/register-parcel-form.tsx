"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRegisterParcel } from "@/hooks/use-parcels";
import { useSupabase } from "@/providers/supabase-provider";
import { useQuery } from "@tanstack/react-query";
import { X, Package, Search, Building2 } from "lucide-react";

const PARCEL_TYPES = [
  { value: "box", label: "📦 กล่องพัสดุ" },
  { value: "envelope", label: "💌 ซองจดหมาย" },
  { value: "bag", label: "👜 ถุง/กระเป๋า" },
  { value: "oversized", label: "📐 พัสดุขนาดใหญ่" },
  { value: "other", label: "📮 อื่นๆ" },
];

const COURIERS = [
  "Kerry Express",
  "Flash Express",
  "Thailand Post",
  "J&T Express",
  "Shopee Express",
  "Lazada Express",
  "Ninja Van",
  "DHL",
  "FedEx",
  "อื่นๆ",
];

interface Props {
  onClose: () => void;
}

export function RegisterParcelForm({ onClose }: Props) {
  const t = useTranslations("parcels");
  const supabase = useSupabase();
  const registerParcel = useRegisterParcel();

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    studentId: string | null;
  } | null>(null);
  const [parcelType, setParcelType] = useState("box");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [description, setDescription] = useState("");

  // Search students
  const { data: students } = useQuery({
    queryKey: ["students-search", studentSearch],
    queryFn: async () => {
      if (!studentSearch || studentSearch.length < 2) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name_th, student_id")
        .eq("role", "student")
        .or(
          `full_name_th.ilike.%${studentSearch}%,student_id.ilike.%${studentSearch}%`
        )
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: studentSearch.length >= 2,
  });

  // Fetch selected student's dorm info
  const { data: dormInfo } = useQuery({
    queryKey: ["student-dorm-info", selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent?.id) return null;

      // Fetch profile with building/room/bed IDs
      const { data: profile } = await supabase
        .from("profiles")
        .select("building_id, room_id, bed_id")
        .eq("id", selectedStudent.id)
        .single();

      if (!profile) return null;

      let buildingName: string | null = null;
      let floor: number | null = null;
      let roomNumber: string | null = null;
      let bedLabel: string | null = null;

      if (profile.building_id) {
        const { data: building } = await supabase
          .from("buildings")
          .select("name_th")
          .eq("id", profile.building_id)
          .single();
        buildingName = building?.name_th ?? null;
      }

      if (profile.room_id) {
        const { data: room } = await supabase
          .from("rooms")
          .select("floor, room_number")
          .eq("id", profile.room_id)
          .single();
        floor = room?.floor ?? null;
        roomNumber = room?.room_number ?? null;
      }

      if (profile.bed_id) {
        const { data: bed } = await supabase
          .from("beds")
          .select("bed_label")
          .eq("id", profile.bed_id)
          .single();
        bedLabel = bed?.bed_label ?? null;
      }

      return { buildingName, floor, roomNumber, bedLabel };
    },
    enabled: !!selectedStudent?.id,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    await registerParcel.mutateAsync({
      student_id: selectedStudent.id,
      parcel_type: parcelType,
      tracking_number: trackingNumber || undefined,
      courier: courier || undefined,
      description: description || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold">{t("registerTitle")}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Picker */}
          <div>
            <label className="text-sm font-medium">{t("student")}</label>
            {selectedStudent ? (
              <div className="mt-1 space-y-2">
                <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{selectedStudent.name}</p>
                    {selectedStudent.studentId && (
                      <p className="text-xs text-muted-foreground">
                        {selectedStudent.studentId}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch("");
                    }}
                    className="text-xs text-primary"
                  >
                    {t("change")}
                  </button>
                </div>
                {/* Dorm Info */}
                {dormInfo && (dormInfo.buildingName || dormInfo.roomNumber) && (
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                    <Building2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-800">
                      {dormInfo.buildingName && (
                        <span>{t("building")}: {dormInfo.buildingName}</span>
                      )}
                      {dormInfo.floor != null && (
                        <span> | {t("floor")}: {dormInfo.floor}</span>
                      )}
                      {dormInfo.roomNumber && (
                        <span> | {t("room")}: {dormInfo.roomNumber}</span>
                      )}
                      {dormInfo.bedLabel && (
                        <span> | {t("bed")}: {dormInfo.bedLabel}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("searchStudent")}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm"
                  autoFocus
                />
                {students && students.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-background shadow-lg max-h-48 overflow-y-auto">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent({
                            id: s.id,
                            name: s.full_name_th,
                            studentId: s.student_id,
                          });
                          setStudentSearch("");
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <p className="font-medium">{s.full_name_th}</p>
                        {s.student_id && (
                          <p className="text-xs text-muted-foreground">
                            {s.student_id}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Parcel Type */}
          <div>
            <label className="text-sm font-medium">{t("type")}</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {PARCEL_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setParcelType(pt.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    parcelType === pt.value
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="text-sm font-medium">{t("trackingNumber")}</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t("trackingPlaceholder")}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Courier */}
          <div>
            <label className="text-sm font-medium">{t("courier")}</label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("selectCourier")}</option>
              {COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">{t("description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={2}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!selectedStudent || registerParcel.isPending}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {registerParcel.isPending ? t("registering") : t("registerOnly")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
