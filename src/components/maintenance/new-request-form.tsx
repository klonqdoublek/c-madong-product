"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 17; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 17) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

export function NewRequestForm() {
  const t = useTranslations("maintenance.form");
  const tc = useTranslations("maintenance.categories");
  const tb = useTranslations("booking");
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
  const [wantAppointment, setWantAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<{
    category: string;
    title: string;
    description: string;
    urgency: string;
    damage_details: string;
    confidence: number;
    provider: string;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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

  const goNext = async () => {
    const idx = STEPS.indexOf(step);
    if (idx >= STEPS.length - 1) return;

    // When leaving photos step, trigger AI analysis if photos exist
    if (step === "photos" && photos.length > 0 && !aiAnalysis) {
      setAnalyzing(true);
      try {
        const res = await fetch("/api/maintenance/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos, description }),
        });
        const data = await res.json();
        if (data.analysis && data.analysis.confidence > 0.5) {
          setAiAnalysis(data.analysis);
        }
      } catch {
        // AI analysis is optional — don't block the form
      } finally {
        setAnalyzing(false);
      }
    }

    setStep(STEPS[idx + 1]);
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
      const payload: Record<string, unknown> = {
        category,
        title: title.trim(),
        description: description.trim(),
        photos,
      };

      if (aiAnalysis) {
        payload.ai_confidence = aiAnalysis.confidence;
        payload.ai_provider = aiAnalysis.provider;
        payload.damage_details = aiAnalysis.damage_details;
      }

      if (wantAppointment && appointmentDate) {
        payload.appointmentDate = format(appointmentDate, "yyyy-MM-dd");
        if (appointmentTime) {
          payload.appointmentTime = appointmentTime;
        }
      }

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

            {/* Appointment booking toggle */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantAppointment}
                  onChange={(e) => {
                    setWantAppointment(e.target.checked);
                    if (!e.target.checked) {
                      setAppointmentDate(undefined);
                      setAppointmentTime("");
                    }
                  }}
                  className="size-4 rounded border-input accent-primary"
                />
                <span className="text-sm font-medium">
                  {t("wantAppointment")}
                </span>
              </label>

              {wantAppointment && (
                <div className="space-y-3 pt-1">
                  {/* Date picker */}
                  <div className="space-y-1.5">
                    <Label>{tb("selectDate")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal gap-2",
                            !appointmentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays size={16} />
                          {appointmentDate
                            ? format(appointmentDate, "PPP", { locale: th })
                            : tb("selectDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={appointmentDate}
                          onSelect={setAppointmentDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time select */}
                  <div className="space-y-1.5">
                    <Label>{tb("selectTime")}</Label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">{tb("selectTime")}</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {t("appointmentNote")}
                  </p>
                </div>
              )}
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
              {/* AI suggestion */}
              {aiAnalysis && (
                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {t("aiSuggestion")}
                    </span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {Math.round(aiAnalysis.confidence * 100)}%
                    </span>
                  </div>
                  {aiAnalysis.damage_details && (
                    <p className="text-sm text-muted-foreground">
                      {aiAnalysis.damage_details}
                    </p>
                  )}
                  {aiAnalysis.category !== category && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setCategory(aiAnalysis.category);
                        if (aiAnalysis.title) setTitle(aiAnalysis.title);
                      }}
                    >
                      <Sparkles size={14} />
                      {t("acceptSuggestion", {
                        category: tc(aiAnalysis.category),
                      })}
                    </Button>
                  )}
                </div>
              )}

              {/* Appointment */}
              {wantAppointment && appointmentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {tb("title")}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <CalendarDays size={14} />
                    {format(appointmentDate, "PPP", { locale: th })}
                    {appointmentTime && ` ${appointmentTime}`}
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

      {/* Analyzing overlay */}
      {analyzing && (
        <div className="flex items-center gap-2 rounded-xl border bg-primary/5 p-3">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-sm text-primary font-medium">
            {t("analyzingPhotos")}
          </span>
        </div>
      )}

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
            disabled={!canNext() || analyzing}
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
