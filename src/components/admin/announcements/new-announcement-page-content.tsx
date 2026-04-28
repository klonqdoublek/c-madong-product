"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Upload, Bot, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAnnouncement } from "@/hooks/use-announcements";
import { useQueryClient } from "@tanstack/react-query";
import { useTags } from "@/hooks/use-tags";
import { useAnnouncementFolders } from "@/hooks/use-announcement-organize";
import { FlexMessageEditor } from "@/components/admin/flex-editor/flex-message-editor";
import { AIWritingAssistant } from "@/components/admin/flex-editor/ai-writing-assistant";
import { TemplateSelector } from "@/components/admin/flex-editor/template-selector";
import { UploadArea } from "@/components/admin/announcements/upload-area";
import { PosterUploadFlow } from "@/components/admin/announcements/poster-upload-flow";
import { AnnouncementAISuggestionDialog, type AppliedSuggestion } from "@/components/admin/announcements/ai-suggestion-dialog";
import { FlexMessagePreview } from "@/components/admin/announcements/flex-message-preview";
import { AnnouncementStepper } from "@/components/admin/announcements/announcement-stepper";
import { AnnouncementCategoryPills } from "@/components/admin/announcements/announcement-category-pills";
import { AnnouncementMessageTypeCards } from "@/components/admin/announcements/announcement-message-type-cards";
import { AnnouncementImageMessage, type ImageMessageState } from "@/components/admin/announcements/announcement-image-message";
import { AnnouncementEventDate, type EventDateValues } from "@/components/admin/announcements/announcement-event-date";
import { AnnouncementStep2, type Step2Values } from "@/components/admin/announcements/announcement-step2";
import { DEFAULT_CTA_CONFIG } from "@/types/announcement-cta";
import type { CTAConfig } from "@/types/announcement-cta";
import { buildAnnouncementPosterFlex } from "@/lib/line/flex-builders/announcement-poster-flex";
import type { MessageTemplate } from "@/types/announcements";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";
import type { AnalyzePosterResult, AnnouncementSuggestion } from "@/hooks/use-announcement-organize";

/* ── LINE preview phone mock (right panel) ─────────────────────── */

function LinePreviewPanel({
  title,
  body,
  coverImage,
  messageType,
  imageUrls,
  carouselMode,
  date,
}: {
  title: string;
  body: string;
  coverImage: string | null;
  messageType: "text" | "flex" | "image";
  imageUrls: string[];
  carouselMode: boolean;
  date?: string;
}) {
  const [previewIdx, setPreviewIdx] = useState(0);
  const activeImage = messageType === "image"
    ? (imageUrls[previewIdx] ?? null)
    : coverImage;

  const typeBadge =
    messageType === "text" ? "Text Message"
    : messageType === "flex" ? "Flex Message"
    : carouselMode && imageUrls.length > 1 ? "Image Carousel"
    : "Image Message";

  return (
    <div className="hidden xl:flex flex-col items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        ตัวอย่างบน LINE
      </p>

      {/* Phone frame */}
      <div className="relative h-[520px] w-[260px] rounded-[32px] border-[6px] border-gray-800 bg-gray-800 shadow-2xl">
        <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-gray-900" />

        <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[#EFEFF4]">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-white px-4 pb-1 pt-5 text-[9px] font-semibold text-gray-500">
            <span>9:41</span>
            <span>LINE</span>
            <span>100%</span>
          </div>
          {/* Chat header */}
          <div className="flex items-center gap-2 border-b bg-white px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">ซ</div>
            <span className="text-[10px] font-semibold text-gray-800">หอพักนิสิต</span>
          </div>

          {/* Message area */}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-3">
            {messageType === "text" ? (
              <div className="max-w-[200px] rounded-xl bg-white p-3 shadow-sm">
                <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2">
                  {title || "หัวข้อประกาศ"}
                </p>
                <p className="mt-1 text-[9px] leading-relaxed text-gray-500 line-clamp-5">
                  {body || "เนื้อหาประกาศ..."}
                </p>
                {date && <p className="mt-1 text-[8px] text-gray-400">{date}</p>}
              </div>

            ) : messageType === "image" ? (
              <div className="space-y-1.5">
                {imageUrls.length > 0 ? (
                  <div className="max-w-[200px] overflow-hidden rounded-xl shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrls[previewIdx]}
                      alt=""
                      className="w-full object-cover transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-[200px] items-center justify-center rounded-xl bg-muted/50 text-[10px] text-muted-foreground">
                    ยังไม่มีรูปภาพ
                  </div>
                )}
                {/* Carousel dots */}
                {carouselMode && imageUrls.length > 1 && (
                  <div className="flex items-center gap-1 pl-1">
                    {imageUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewIdx(i)}
                        className={`rounded-full transition-all ${
                          i === previewIdx ? "h-1.5 w-4 bg-primary" : "h-1.5 w-1.5 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

            ) : (
              /* Flex / default */
              <div className="max-w-[200px] overflow-hidden rounded-xl bg-white shadow-sm">
                {activeImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeImage} alt="" className="h-24 w-full object-cover" />
                )}
                <div className="p-2.5">
                  <p className="text-[11px] font-bold text-gray-900 line-clamp-1">
                    {title || "หัวข้อประกาศ"}
                  </p>
                  <p className="mt-0.5 text-[9px] text-gray-400 line-clamp-2">
                    {body || "เนื้อหา..."}
                  </p>
                  {date && <p className="mt-1 text-[8px] text-gray-400">{date}</p>}
                  <div className="mt-1.5 rounded bg-primary py-1 text-center text-[9px] font-semibold text-white">
                    ดูรายละเอียด
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type badge */}
      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
        {typeBadge}
      </span>
    </div>
  );
}

/* ── Step 1 form ────────────────────────────────────────────────── */

interface Props {
  announcementId?: string;
}

const DEFAULT_STEP2: Step2Values = {
  targetType: "broadcast",
  targetTags: [],
  schedulingEnabled: false,
  schedulingMode: "once",
  scheduledDate: "",
  scheduledTime: "",
};

export function NewAnnouncementPageContent({ announcementId }: Props) {
  const t = useTranslations("admin.newAnnouncement");
  const router = useRouter();
  const { data: existing } = useAnnouncement(announcementId ?? null);
  const queryClient = useQueryClient();
  const { data: tags } = useTags();
  const { data: folders } = useAnnouncementFolders();

  /* ── Step state ── */
  const [step, setStep] = useState<1 | 2>(1);

  /* ── Core fields ── */
  const [titleTh, setTitleTh] = useState(existing?.title_th ?? "");
  const [titleEn, setTitleEn] = useState(existing?.title_en ?? "");
  const [contentTh, setContentTh] = useState(existing?.content_th ?? "");
  const [contentEn, setContentEn] = useState(existing?.content_en ?? "");
  const [messageType, setMessageType] = useState<"text" | "flex" | "image">(
    (existing?.message_type as "text" | "flex" | "image") ?? "text"
  );
  const [flexJson, setFlexJson] = useState<Record<string, unknown> | null>(
    (existing?.flex_json as Record<string, unknown>) ?? null
  );
  const [isPinned, setIsPinned] = useState(existing?.is_pinned ?? false);
  const [coverImage, setCoverImage] = useState<string | null>(existing?.cover_image ?? null);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [imageMsg, setImageMsg] = useState<ImageMessageState>({ imageUrls: [], carouselMode: false });
  const [carouselImages, setCarouselImages] = useState<string[]>(
    (existing as any)?.carousel_images ?? []
  );
  const [savedAnnouncementId, setSavedAnnouncementId] = useState<string | null>(announcementId ?? null);

  /* ── AI / metadata ── */
  const [category, setCategory] = useState((existing as any)?.category ?? "announcement");
  const [eventDateValues, setEventDateValues] = useState<EventDateValues>({
    allDay: true,
    startDate: (existing as any)?.event_date ?? "",
    endDate: (existing as any)?.event_end_date ?? "",
    startTime: (existing as any)?.event_start_time ?? "",
    endTime: (existing as any)?.event_end_time ?? "",
  });
  const [location, setLocation] = useState((existing as any)?.location ?? "");
  const [hasDormScore, setHasDormScore] = useState((existing as any)?.has_dorm_score ?? false);
  const [scorePoints, setScorePoints] = useState(String((existing as any)?.score_points ?? ""));
  const [isBotSearchable, setIsBotSearchable] = useState(true);
  const [aiExtracted, setAiExtracted] = useState<AnalyzePosterResult | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<AnnouncementSuggestion | null>(null);

  /* ── CTA state (Flex message only) ── */
  const [ctas, setCtas] = useState<CTAConfig>(DEFAULT_CTA_CONFIG);

  /* ── Step 2 state ── */
  const [step2, setStep2] = useState<Step2Values>(DEFAULT_STEP2);

  /* ── UI ── */
  const [showPosterUpload, setShowPosterUpload] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  // Sync existing data
  if (existing && !titleTh && existing.title_th) {
    setTitleTh(existing.title_th);
    setContentTh(existing.content_th);
    setTitleEn(existing.title_en);
    setContentEn(existing.content_en);
    setMessageType((existing.message_type as "text" | "flex" | "image") ?? "text");
    setFlexJson((existing.flex_json as Record<string, unknown>) ?? null);
    setIsPinned(existing.is_pinned ?? false);
  }

  function handleTemplateSelect(template: MessageTemplate) {
    if (template.content) setContentTh(template.content);
    if (template.flex_json) {
      setFlexJson(template.flex_json as Record<string, unknown>);
      setMessageType("flex");
    }
  }

  function handlePosterUploadComplete(url: string, path: string, result: AnalyzePosterResult) {
    setCoverImage(url);
    setCoverPath(path);
    setAiExtracted(result);
    setCarouselImages((prev) => (prev.length === 0 ? [url] : prev));
    setShowPosterUpload(false);
    if (result.suggestion) {
      setPendingSuggestion(result.suggestion);
      setShowAISuggest(true);
    } else {
      toast.info("อัปโหลดสำเร็จ — กรอกข้อมูลด้วยตนเองได้เลย");
    }
  }

  function handleApplySuggestion(applied: AppliedSuggestion) {
    setTitleTh(applied.title_th);
    setTitleEn(applied.title_en);
    setContentTh(applied.content_th);
    setCategory(applied.category);
    setEventDateValues((prev) => ({ ...prev, startDate: applied.event_date ?? "" }));
    setLocation(applied.location ?? "");
    setHasDormScore(applied.has_dorm_score);
    setScorePoints(String(applied.score_points ?? ""));
    setAiFilledFields(new Set(["title_th", "content_th", "category", "event_date", "location"]));
  }

  function buildSaveData(status: string) {
    return {
      title_th: titleTh,
      title_en: titleEn || titleTh,
      content_th: contentTh,
      content_en: contentEn || contentTh,
      message_type: messageType,
      flex_json: (messageType === "flex" ? (buildCurrentFlexJson() ?? flexJson) : null) as any,
      target_type: step2.targetType,
      target_tags: step2.targetType === "targeted" ? step2.targetTags : [],
      is_pinned: isPinned,
      cover_image: messageType === "image" ? (imageMsg.imageUrls[0] ?? null) : coverImage,
      status,
      category,
      event_date: eventDateValues.startDate || null,
      event_end_date: eventDateValues.endDate || null,
      event_all_day: eventDateValues.allDay,
      event_start_time: !eventDateValues.allDay ? (eventDateValues.startTime || null) : null,
      event_end_time: !eventDateValues.allDay ? (eventDateValues.endTime || null) : null,
      location: location || null,
      has_dorm_score: hasDormScore,
      score_points: hasDormScore && scorePoints ? Number(scorePoints) : null,
      is_bot_searchable: isBotSearchable,
      ocr_text: aiExtracted?.ocr_text ?? null,
      ai_extracted: (aiExtracted?.suggestion ?? null) as any,
      ai_provider: aiExtracted?.ocr_provider ?? null,
      embed_text: aiExtracted?.embed_text ?? null,
      carousel_images: messageType === "flex" ? carouselImages : (imageMsg.carouselMode ? imageMsg.imageUrls : []),
      ...(step2.schedulingEnabled && step2.scheduledDate
        ? {
            scheduled_at: `${step2.scheduledDate}T${step2.scheduledTime || "00:00"}:00+07:00`,
          }
        : {}),
    };
  }

  async function saveViaApi(status: string): Promise<string> {
    const body = buildSaveData(status);
    if (savedAnnouncementId) {
      const res = await fetch(`/api/admin/announcements/${savedAnnouncementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to update");
      const data = await res.json();
      return data.announcement?.id ?? savedAnnouncementId;
    } else {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      const data = await res.json();
      const newId = data.announcement?.id;
      setSavedAnnouncementId(newId);
      return newId;
    }
  }

  async function handleSaveDraft() {
    setSending(true);
    try {
      await saveViaApi("draft");
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("บันทึกร่างเรียบร้อยแล้ว");
      router.push("/admin/announcements");
    } catch (err: any) {
      toast.error(err.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveTemplate() {
    setSending(true);
    try {
      await saveViaApi("draft");
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("บันทึกเป็นเทมเพลตแล้ว");
      router.push("/admin/announcements");
    } catch (err: any) {
      toast.error(err.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const resolvedStatus =
        step2.schedulingEnabled && step2.scheduledDate ? "scheduled" : "sent";
      const id = await saveViaApi(resolvedStatus);
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });

      if (resolvedStatus === "sent") {
        const sendRes = await fetch("/api/admin/announcements/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            announcementId: id,
            targetType: step2.targetType,
            targetTags: step2.targetTags,
            messageType,
            content: contentTh,
            flexJson: messageType === "flex" ? (buildCurrentFlexJson() ?? flexJson) : flexJson,
            imageUrl: messageType === "image" ? (imageMsg.imageUrls[0] ?? null) : null,
            imageUrls: messageType === "image" ? imageMsg.imageUrls : [],
            imageCarouselMode: imageMsg.carouselMode,
          }),
        });
        if (!sendRes.ok) {
          toast.warning("บันทึกสำเร็จ แต่ส่ง LINE ไม่ได้ — ลองส่งใหม่ในหน้ารายการ");
        } else {
          toast.success("ส่งประกาศสำเร็จแล้ว");
        }
      } else {
        toast.success("ตั้งเวลาส่งเรียบร้อย");
      }
      router.push("/admin/announcements");
    } catch (err: any) {
      toast.error(err.message ?? "ส่งประกาศไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  const isAiFilled = (field: string) => aiFilledFields.has(field);

  /** Build Flex JSON synchronously from current state — avoids debounce race. */
  function buildCurrentFlexJson(): Record<string, unknown> | null {
    if (messageType !== "flex") return null;
    const ctaUrl = (!ctas?.primary && savedAnnouncementId)
      ? `${process.env.NEXT_PUBLIC_WEB_BASE ?? ""}/th/announcements/${savedAnnouncementId}`
      : undefined;
    return buildAnnouncementPosterFlex(
      {
        title: titleTh,
        body: contentTh,
        date: eventDateValues.startDate || null,
        category,
        ctaUrl,
        ctas: ctas ?? null,
      },
      carouselImages
    ) as unknown as Record<string, unknown>;
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: back + title + stepper */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => step === 2 ? setStep(1) : router.push("/admin/announcements")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold text-foreground leading-tight">
              สร้างประกาศใหม่
            </h1>
            <p className="text-xs text-muted-foreground">
              สร้างและส่งประกาศไปยังนิสิตผ่าน LINE OA
            </p>
          </div>
          <div className="hidden sm:block ml-2">
            <AnnouncementStepper currentStep={step} />
          </div>
        </div>

        {/* Right: action button */}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={!titleTh.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(221,89,139,0.3)] transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50"
          >
            ต่อไป →
          </button>
        )}
      </div>

      {/* Mobile stepper */}
      <div className="sm:hidden">
        <AnnouncementStepper currentStep={step} />
      </div>

      {/* ── Step content ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            {/* 2-column layout: form | LINE preview */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">

              {/* ── Left: Form ── */}
              <div className="space-y-6">

                {/* Poster AI upload CTA */}
                {!announcementId && !coverImage && (
                  <motion.button
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setShowPosterUpload(true)}
                    className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 text-left transition-colors hover:border-primary/70 hover:bg-primary/10"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-primary">อัปโหลดโปสเตอร์ — AI กรอกข้อมูลให้</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        สกัดข้อความ แยกหัวข้อ วันที่ หมวดหมู่ จากรูป Canva อัตโนมัติ
                      </p>
                    </div>
                    <Upload className="h-5 w-5 text-primary/60" />
                  </motion.button>
                )}

                {/* AI filled indicator */}
                <AnimatePresence>
                  {aiFilledFields.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-xl bg-primary/8 px-4 py-2.5 text-sm text-primary"
                    >
                      <Sparkles className="h-4 w-4 shrink-0" />
                      AI กรอกข้อมูลให้แล้ว — แก้ไขได้ตามต้องการ
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── ประเภท (Category) ── */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">ประเภท</label>
                  <AnnouncementCategoryPills value={category} onChange={setCategory} />
                </div>

                {/* ── หัวข้อ (Title) ── */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      หัวข้อประกาศ
                      <span className="text-destructive">*</span>
                      {isAiFilled("title_th") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                    </label>
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="flex items-center gap-1 rounded-lg border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5"
                    >
                      เลือกจากเทมเพลต
                    </button>
                  </div>
                  <input
                    value={titleTh}
                    onChange={(e) => setTitleTh(e.target.value)}
                    placeholder="เช่น ประกาศค่าหอพักเดือนกุมภาพันธ์"
                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* ── รูปแบบข้อความ (Message type cards) ── */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">รูปแบบข้อความ</label>
                  <p className="mb-3 text-xs text-muted-foreground">เลือกรูปแบบข้อความที่ต้องการจะส่ง</p>
                  <AnnouncementMessageTypeCards
                    value={messageType}
                    onChange={setMessageType}
                  />
                </div>

                {/* ── Content area (varies by message type) ── */}
                {messageType === "text" && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        เนื้อหาข้อความ
                        {isAiFilled("content_th") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      </label>
                      <button
                        onClick={() => setShowAI(true)}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI ช่วยเขียน
                      </button>
                    </div>
                    <textarea
                      value={contentTh}
                      onChange={(e) => setContentTh(e.target.value)}
                      placeholder="เช่น ประกาศค่าหอพักเดือนกุมภาพันธ์"
                      rows={6}
                      className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}

                {messageType === "flex" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">เนื้อหาข้อความ</label>
                      <button onClick={() => setShowAI(true)} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI ช่วยเขียน
                      </button>
                    </div>
                    <textarea
                      value={contentTh}
                      onChange={(e) => setContentTh(e.target.value)}
                      placeholder="เนื้อหาสำรอง (ใช้เป็น fallback text)"
                      rows={3}
                      className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <FlexMessagePreview
                      extractedFields={
                        titleTh
                          ? { title: titleTh, body: contentTh, date: eventDateValues.startDate || null, category }
                          : null
                      }
                      coverImage={coverImage}
                      carouselImages={carouselImages}
                      announcementId={savedAnnouncementId}
                      ctas={ctas}
                      onImagesChange={setCarouselImages}
                      onFlexJsonChange={setFlexJson}
                      onCtasChange={setCtas}
                    />
                    <details className="rounded-xl border">
                      <summary className="cursor-pointer px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                        แก้ไข Flex JSON โดยตรง
                      </summary>
                      <div className="border-t p-2">
                        <FlexMessageEditor value={flexJson} onChange={setFlexJson} />
                      </div>
                    </details>
                  </div>
                )}

                {messageType === "image" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">รูปภาพสำหรับส่ง</label>
                    <AnnouncementImageMessage
                      state={imageMsg}
                      onChange={(partial) => setImageMsg((prev) => ({ ...prev, ...partial }))}
                    />
                  </div>
                )}

                {/* Cover image (for non-image types) */}
                {messageType !== "image" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">รูปปกประกาศ</label>
                    <div className={coverImage ? "max-h-36 overflow-hidden rounded-xl" : "max-h-36 overflow-hidden"}>
                      <UploadArea
                        imageUrl={coverImage}
                        onUploaded={(url, path) => { setCoverImage(url); setCoverPath(path); }}
                        onRemove={() => { setCoverImage(null); setCoverPath(null); }}
                      />
                    </div>
                  </div>
                )}

                {/* Event date */}
                <div>
                  <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-foreground">
                    วันที่จัดงาน
                    {isAiFilled("event_date") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                  </label>
                  <AnnouncementEventDate
                    values={eventDateValues}
                    onChange={(partial) => setEventDateValues((prev) => ({ ...prev, ...partial }))}
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-sm font-semibold text-foreground">
                      สถานที่
                      {isAiFilled("location") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="เช่น ห้องประชุม"
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
                    ปักหมุดประกาศ
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hasDormScore}
                      onChange={(e) => setHasDormScore(e.target.checked)}
                      className="rounded"
                    />
                    ให้คะแนนหอพัก
                    {hasDormScore && (
                      <input
                        type="number"
                        value={scorePoints}
                        onChange={(e) => setScorePoints(e.target.value)}
                        placeholder="คะแนน"
                        className="ml-1 w-20 rounded border bg-background px-2 py-0.5 text-xs"
                        min={0}
                      />
                    )}
                  </label>
                </div>

                {/* Bot searchable */}
                <div className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Bot className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">ให้น้องซีมะโด่งใช้ตอบนิสิต</p>
                      <p className="text-xs text-muted-foreground">Bot สามารถค้นหาและอ้างอิงประกาศนี้ได้</p>
                    </div>
                  </div>
                  <Switch checked={isBotSearchable} onCheckedChange={setIsBotSearchable} />
                </div>

                {/* spacer bottom */}
                <div className="pb-4" />
              </div>

              {/* ── Right: LINE preview ── */}
              <div className="sticky top-6 self-start">
                <LinePreviewPanel
                  title={titleTh}
                  body={contentTh}
                  coverImage={coverImage}
                  messageType={messageType}
                  imageUrls={imageMsg.imageUrls}
                  carouselMode={imageMsg.carouselMode}
                  date={eventDateValues.startDate}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 2: 2-column with right panel still */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
                  ยืนยันการสร้างประกาศ
                </h2>
                <AnnouncementStep2
                  titleTh={titleTh}
                  contentTh={contentTh}
                  coverImage={coverImage}
                  category={category}
                  messageType={messageType}
                  imageUrl={imageMsg.imageUrls[0] ?? null}
                  values={step2}
                  onChange={(partial) => setStep2((prev) => ({ ...prev, ...partial }))}
                  sending={sending}
                  onSendNow={handleSend}
                  onSaveDraft={handleSaveDraft}
                  onSaveTemplate={handleSaveTemplate}
                  onBack={() => setStep(1)}
                />
              </div>

              {/* Right: LINE preview persists on step 2 */}
              <div className="sticky top-6 self-start">
                <LinePreviewPanel
                  title={titleTh}
                  body={contentTh}
                  coverImage={coverImage}
                  messageType={messageType}
                  imageUrls={imageMsg.imageUrls}
                  carouselMode={imageMsg.carouselMode}
                  date={eventDateValues.startDate}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dialogs ── */}
      <Dialog open={showPosterUpload} onOpenChange={setShowPosterUpload}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogTitle className="sr-only">อัปโหลดโปสเตอร์</DialogTitle>
          <PosterUploadFlow
            onComplete={handlePosterUploadComplete}
            onClose={() => setShowPosterUpload(false)}
          />
        </DialogContent>
      </Dialog>

      {pendingSuggestion && (
        <AnnouncementAISuggestionDialog
          open={showAISuggest}
          suggestion={pendingSuggestion}
          folders={(folders ?? []).map((f: any) => ({ id: f.id, name: f.name }))}
          tags={(tags ?? []).map((t: any) => ({ id: t.id, name: t.name, color: t.color }))}
          onOpenChange={(v) => { setShowAISuggest(v); }}
          onApply={handleApplySuggestion}
        />
      )}

      <AIWritingAssistant
        open={showAI}
        onClose={() => setShowAI(false)}
        onInsert={(text) => setContentTh((prev) => prev + text)}
      />
      <TemplateSelector
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
