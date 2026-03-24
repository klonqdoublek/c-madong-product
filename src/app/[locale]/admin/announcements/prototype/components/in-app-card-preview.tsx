"use client";

import { Badge } from "@/components/ui/badge";
import { Pin, Calendar } from "lucide-react";
import type { AnnouncementFormData } from "./announcement-prototype";

interface InAppCardPreviewProps {
  formData: AnnouncementFormData;
}

const PRIORITY_CONFIG = {
  normal: { label: "ปกติ", variant: "secondary" as const },
  important: { label: "สำคัญ", variant: "default" as const },
  urgent: { label: "ด่วน", variant: "destructive" as const },
};

export function InAppCardPreview({ formData }: InAppCardPreviewProps) {
  const priorityConfig = PRIORITY_CONFIG[formData.priority];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Announcement card ใน app
      </p>

      {/* Card */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
        {/* Image */}
        {formData.imagePreview ? (
          <div className="relative aspect-video">
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {formData.isPinned && (
              <div className="absolute right-3 top-3">
                <Badge className="bg-yellow-500/90 border-0 text-white backdrop-blur-sm">
                  <Pin className="mr-1 h-3 w-3" />
                  ปักหมุด
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">ยังไม่มีรูป</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title + Priority */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <h3 className="flex-1 font-heading font-semibold leading-tight">
                {formData.titleTh || "หัวข้อประกาศ..."}
              </h3>
              <Badge variant={priorityConfig.variant} className="shrink-0">
                {priorityConfig.label}
              </Badge>
            </div>

            {formData.descriptionTh && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {formData.descriptionTh}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date().toLocaleDateString("th-TH")}</span>
            </div>

            {formData.targetType !== "all" && (
              <>
                <span>•</span>
                {formData.targetType === "buildings" && (
                  <span>
                    {formData.targetBuildings.length > 0
                      ? formData.targetBuildings.join(", ")
                      : "เลือกอาคาร"}
                  </span>
                )}
                {formData.targetType === "years" && (
                  <span>
                    {formData.targetYears.length > 0
                      ? formData.targetYears.map((y) => `ปี ${y}`).join(", ")
                      : "เลือกชั้นปี"}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-muted-foreground">
        💡 Card จะแสดงในหน้า Announcements ของ app
      </p>
    </div>
  );
}
