"use client";

import { Badge } from "@/components/ui/badge";
import type { AnnouncementFormData } from "./announcement-prototype";

interface LineNotificationPreviewProps {
  formData: AnnouncementFormData;
}

const PRIORITY_CONFIG = {
  normal: { label: "ปกติ", color: "bg-blue-500" },
  important: { label: "สำคัญ", color: "bg-yellow-500" },
  urgent: { label: "ด่วน", color: "bg-red-500" },
};

export function LineNotificationPreview({
  formData,
}: LineNotificationPreviewProps) {
  const priorityConfig = PRIORITY_CONFIG[formData.priority];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        LINE notification ที่นิสิตจะได้รับ
      </p>

      {/* LINE Bubble */}
      <div className="rounded-2xl bg-white shadow-lg overflow-hidden border">
        {/* Hero Image */}
        {formData.imagePreview ? (
          <div className="relative aspect-video bg-muted">
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {/* Priority Badge Overlay */}
            <div className="absolute left-3 top-3">
              <Badge
                className={`${priorityConfig.color} border-0 text-white shadow-md`}
              >
                {priorityConfig.label}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">ยังไม่มีรูป</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-10 w-10 shrink-0 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">ซีมะโด่ง หอพัก</p>
              <p className="font-medium text-sm leading-snug mt-0.5">
                {formData.titleTh || "หัวข้อประกาศ..."}
              </p>
            </div>
          </div>

          {/* Target info */}
          {formData.targetType !== "all" && (
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {formData.targetType === "buildings" && (
                <span>
                  📍{" "}
                  {formData.targetBuildings.length > 0
                    ? formData.targetBuildings.join(", ")
                    : "เลือกอาคาร"}
                </span>
              )}
              {formData.targetType === "years" && (
                <span>
                  🎓{" "}
                  {formData.targetYears.length > 0
                    ? formData.targetYears.map((y) => `ปี ${y}`).join(", ")
                    : "เลือกชั้นปี"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-muted-foreground">
        💡 นิสิตสามารถแตะเพื่อเปิดดูรายละเอียดใน app
      </p>
    </div>
  );
}
