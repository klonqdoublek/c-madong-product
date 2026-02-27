"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryPicker } from "./category-picker";
import { PhotoUploader } from "./photo-uploader";
import { CategoryIcon } from "@/components/admin/maintenance/category-icon";
import { StatusBadge } from "@/components/admin/maintenance/status-badge";
import { cn } from "@/lib/utils";

const STEPS = ["category", "details", "photos", "review"] as const;
type Step = (typeof STEPS)[number];

const TITLE_SUGGESTIONS: Record<string, string> = {
  electrical: "ปัญหาไฟฟ้า",
  plumbing: "ปัญหาประปา",
  furniture: "เฟอร์นิเจอร์ชำรุด",
  air_conditioning: "แอร์ไม่เย็น",
  internet: "เน็ตใช้ไม่ได้",
  door_lock: "ประตู/กุญแจมีปัญหา",
  pest: "พบสัตว์/แมลง",
  cleaning: "ปัญหาความสะอาด",
  other: "ปัญหาอื่นๆ",
};

export function NewRequestForm() {
  const t = useTranslations("maintenance.form");
  const tc = useTranslations("maintenance.categories");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step);

  const canNext = () => {
    switch (step) {
      case "category":
        return !!category;
      case "details":
        return title.trim().length > 0 && description.trim().length >= 10;
      case "photos":
        return true; // photos are optional
      case "review":
        return true;
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (!title) {
      setTitle(TITLE_SUGGESTIONS[cat] ?? "");
    }
  };

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const handleUpload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("existingCount", photos.length.toString());

      const res = await fetch("/api/maintenance/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Upload failed");
        return null;
      }

      const data = await res.json();
      return data.url;
    } catch {
      setError("Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, [photos.length]);

  const handleSubmit = async () => {
    if (!category || !title || !description) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim(),
          photos,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit");
        return;
      }

      const data = await res.json();
      router.push(`/maintenance/${data.id}`);
    } catch {
      setError("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                i < stepIndex
                  ? "bg-primary text-primary-foreground"
                  : i === stepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < stepIndex ? <Check size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6",
                  i < stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === "category" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t("stepCategory")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("stepCategoryDesc")}
              </p>
            </div>
            <CategoryPicker value={category} onChange={handleCategoryChange} />
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t("stepDetails")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("stepDetailsDesc")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">{t("titleLabel")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionLabel")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {t("descriptionHint", { min: 10, max: 2000 })}
              </p>
            </div>
          </div>
        )}

        {step === "photos" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t("stepPhotos")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("stepPhotosDesc")}
              </p>
            </div>
            <PhotoUploader
              photos={photos}
              onPhotosChange={setPhotos}
              uploading={uploading}
              onUpload={handleUpload}
            />
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t("stepReview")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("stepReviewDesc")}
              </p>
            </div>
            <div className="space-y-3 rounded-xl border bg-card p-4">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("categoryLabel")}
                </span>
                <div className="flex items-center gap-1.5">
                  <CategoryIcon category={category!} size={14} />
                  <span className="text-sm font-medium">
                    {tc(category!)}
                  </span>
                </div>
              </div>
              {/* Title */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("titleLabel")}
                </span>
                <span className="text-sm font-medium">{title}</span>
              </div>
              {/* Description */}
              <div>
                <span className="text-sm text-muted-foreground">
                  {t("descriptionLabel")}
                </span>
                <p className="mt-1 text-sm">{description}</p>
              </div>
              {/* Photos */}
              {photos.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t("photosLabel", { count: photos.length })}
                  </span>
                  <div className="mt-2 flex gap-2">
                    {photos.map((url, i) => (
                      <div
                        key={i}
                        className="size-16 overflow-hidden rounded-lg border"
                      >
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Status */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {t("statusLabel")}
                </span>
                <StatusBadge status="pending" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        {stepIndex > 0 ? (
          <Button variant="outline" onClick={goBack} className="gap-1">
            <ChevronLeft size={16} />
            {tCommon("back")}
          </Button>
        ) : (
          <div />
        )}

        {step === "review" ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-1.5"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {tCommon("submit")}
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canNext()}
            className="gap-1"
          >
            {tCommon("next")}
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
