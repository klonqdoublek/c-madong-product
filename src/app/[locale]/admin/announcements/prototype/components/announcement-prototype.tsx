"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UploadArea } from "./upload-area";
import { AnnouncementForm } from "./announcement-form";
import { PreviewSection } from "./preview-section";
import { SuccessDialog } from "./success-dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export interface AnnouncementFormData {
  image: File | null;
  imagePreview: string | null;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  targetType: "all" | "buildings" | "years";
  targetBuildings: string[];
  targetYears: number[];
  priority: "normal" | "important" | "urgent";
  channels: {
    facebook: boolean;
    line: boolean;
    inApp: boolean;
  };
  scheduleType: "now" | "later";
  scheduleDate?: Date;
  isPinned: boolean;
}

export function AnnouncementPrototype() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    image: null,
    imagePreview: null,
    titleTh: "",
    titleEn: "",
    descriptionTh: "",
    descriptionEn: "",
    targetType: "all",
    targetBuildings: [],
    targetYears: [],
    priority: "normal",
    channels: {
      facebook: true,
      line: true,
      inApp: true,
    },
    scheduleType: "now",
    isPinned: false,
  });

  function handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleFormChange(updates: Partial<AnnouncementFormData>) {
    setFormData((prev) => ({ ...prev, ...updates }));
  }

  function handleSaveDraft() {
    // Mock save draft
    console.log("Save draft:", formData);
    alert("✅ บันทึกแบบร่างแล้ว (Mock)");
  }

  function handlePublish() {
    // Mock publish
    console.log("Publish:", formData);
    setShowSuccess(true);
  }

  const isValid = formData.image && formData.titleTh.trim();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/announcements")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold">
                  สร้างประกาศ (Prototype)
                </h1>
                <Badge variant="secondary">Beta</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload รูปจาก Canva + กำหนด channel และ target audience
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Upload Area */}
            <UploadArea
              imagePreview={formData.imagePreview}
              onUpload={handleImageUpload}
              onRemove={() =>
                handleFormChange({ image: null, imagePreview: null })
              }
            />

            {/* Form Fields */}
            <AnnouncementForm formData={formData} onChange={handleFormChange} />

            {/* Actions */}
            <div className="flex gap-3 border-t pt-6">
              <Button variant="outline" onClick={handleSaveDraft}>
                บันทึกแบบร่าง
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!isValid}
                className="flex-1"
              >
                {formData.scheduleType === "now" ? "เผยแพร่ทันที" : "กำหนดเวลาเผยแพร่"}
              </Button>
            </div>
          </div>

          {/* Right: Live Preview (Sticky) */}
          <div className="hidden lg:block">
            <PreviewSection formData={formData} />
          </div>
        </div>

        {/* Mobile Preview (Below form) */}
        <div className="lg:hidden">
          <PreviewSection formData={formData} />
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push("/admin/announcements");
        }}
        formData={formData}
      />
    </>
  );
}
