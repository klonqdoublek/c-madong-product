"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Facebook, MessageCircle, Smartphone } from "lucide-react";
import type { AnnouncementFormData } from "./announcement-prototype";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  formData: AnnouncementFormData;
}

export function SuccessDialog({ open, onClose, formData }: SuccessDialogProps) {
  const channelIcons = {
    facebook: { icon: Facebook, label: "Facebook" },
    line: { icon: MessageCircle, label: "LINE" },
    inApp: { icon: Smartphone, label: "In-App" },
  };

  const activeChannels = Object.entries(formData.channels)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => channelIcons[key as keyof typeof channelIcons]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">เผยแพร่ประกาศสำเร็จ!</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">หัวข้อ</p>
              <p className="mt-1 font-medium">{formData.titleTh}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                ช่องทาง
              </p>
              <div className="mt-1.5 flex gap-2">
                {activeChannels.map(({ icon: Icon, label }) => (
                  <Badge key={label} variant="secondary" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                กลุ่มเป้าหมาย
              </p>
              <p className="mt-1 text-sm">
                {formData.targetType === "all" && "ทุกคน"}
                {formData.targetType === "buildings" &&
                  (formData.targetBuildings.length > 0
                    ? formData.targetBuildings.join(", ")
                    : "ไม่ได้เลือกอาคาร")}
                {formData.targetType === "years" &&
                  (formData.targetYears.length > 0
                    ? formData.targetYears.map((y) => `ปี ${y}`).join(", ")
                    : "ไม่ได้เลือกชั้นปี")}
              </p>
            </div>

            {formData.scheduleType === "later" && formData.scheduleDate && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  กำหนดเผยแพร่
                </p>
                <p className="mt-1 text-sm">
                  {formData.scheduleDate.toLocaleString("th-TH")}
                </p>
              </div>
            )}
          </div>

          {/* Mock info */}
          <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-700">
            🎉 นี่คือ prototype — ยังไม่ได้เชื่อม DB จริง
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            ดูรายการประกาศ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
