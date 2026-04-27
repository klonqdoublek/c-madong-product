"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Bot } from "lucide-react";
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
import type { MessageTemplate } from "@/types/announcements";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";
import type { AnalyzePosterResult, AnnouncementSuggestion } from "@/hooks/use-announcement-organize";

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "ประกาศทั่วไป",
  alert: "แจ้งเตือนด่วน",
  activity: "กิจกรรม",
  news: "ข่าวสาร",
  pr: "ประชาสัมพันธ์",
};

interface Props {
  announcementId?: string;
}

export function NewAnnouncementPageContent({ announcementId }: Props) {
  const t = useTranslations("admin.newAnnouncement");
  const router = useRouter();
  const { data: existing } = useAnnouncement(announcementId ?? null);
  const queryClient = useQueryClient();
  const { data: tags } = useTags();
  const { data: folders } = useAnnouncementFolders();

  // Core fields
  const [titleTh, setTitleTh] = useState(existing?.title_th ?? "");
  const [titleEn, setTitleEn] = useState(existing?.title_en ?? "");
  const [contentTh, setContentTh] = useState(existing?.content_th ?? "");
  const [contentEn, setContentEn] = useState(existing?.content_en ?? "");
  const [messageType, setMessageType] = useState<"text" | "flex">(
    (existing?.message_type as "text" | "flex") ?? "text"
  );
  const [flexJson, setFlexJson] = useState<Record<string, unknown> | null>(
    (existing?.flex_json as Record<string, unknown>) ?? null
  );
  const [targetType, setTargetType] = useState(existing?.target_type ?? "broadcast");
  const [targetTags, setTargetTags] = useState<string[]>(existing?.target_tags ?? []);
  const [isPinned, setIsPinned] = useState(existing?.is_pinned ?? false);
  const [coverImage, setCoverImage] = useState<string | null>(existing?.cover_image ?? null);
  const [coverPath, setCoverPath] = useState<string | null>(null);

  // AI / new fields
  const [category, setCategory] = useState((existing as any)?.category ?? "announcement");
  const [eventDate, setEventDate] = useState((existing as any)?.event_date ?? "");
  const [location, setLocation] = useState((existing as any)?.location ?? "");
  const [hasDormScore, setHasDormScore] = useState((existing as any)?.has_dorm_score ?? false);
  const [scorePoints, setScorePoints] = useState(String((existing as any)?.score_points ?? ""));
  const [isBotSearchable, setIsBotSearchable] = useState(true);
  const [aiExtracted, setAiExtracted] = useState<AnalyzePosterResult | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<AnnouncementSuggestion | null>(null);

  // UI state
  const [showPosterUpload, setShowPosterUpload] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  // Sync existing data when it loads
  if (existing && !titleTh && existing.title_th) {
    setTitleTh(existing.title_th);
    setContentTh(existing.content_th);
    setTitleEn(existing.title_en);
    setContentEn(existing.content_en);
    setMessageType((existing.message_type as "text" | "flex") ?? "text");
    setFlexJson((existing.flex_json as Record<string, unknown>) ?? null);
    setTargetType(existing.target_type ?? "broadcast");
    setTargetTags(existing.target_tags ?? []);
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
    setEventDate(applied.event_date ?? "");
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
      flex_json: (messageType === "flex" ? flexJson : null) as any,
      target_type: targetType,
      target_tags: targetType === "tags" ? targetTags : [],
      is_pinned: isPinned,
      cover_image: coverImage,
      status,
      category,
      event_date: eventDate || null,
      location: location || null,
      has_dorm_score: hasDormScore,
      score_points: hasDormScore && scorePoints ? Number(scorePoints) : null,
      is_bot_searchable: isBotSearchable,
      ocr_text: aiExtracted?.ocr_text ?? null,
      ai_extracted: (aiExtracted?.suggestion ?? null) as any,
      ai_provider: aiExtracted?.ocr_provider ?? null,
      embed_text: aiExtracted?.embed_text ?? null,
    };
  }

  async function saveViaApi(status: string): Promise<string> {
    const body = buildSaveData(status);
    if (announcementId) {
      const res = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to update");
      const data = await res.json();
      return data.announcement?.id ?? announcementId;
    } else {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create");
      const data = await res.json();
      return data.announcement?.id;
    }
  }

  async function handleSave(status: string) {
    setSending(true);
    try {
      await saveViaApi(status);
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
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
      const id = await saveViaApi("sent");
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      await fetch("/api/admin/announcements/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcementId: id, targetType, targetTags, messageType, content: contentTh, flexJson }),
      });
      router.push("/admin/announcements");
    } catch (err: any) {
      toast.error(err.message ?? "ส่งประกาศไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  const isAiFilled = (field: string) => aiFilledFields.has(field);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminBreadcrumb />
      <h1 className="font-heading text-2xl font-bold">
        {announcementId ? t("editTitle") : t("title")}
      </h1>

      {/* Poster AI Upload CTA */}
      {!announcementId && !coverImage && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
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

      {/* Cover Image */}
      <UploadArea
        imageUrl={coverImage}
        onUploaded={(url, path) => { setCoverImage(url); setCoverPath(path); }}
        onRemove={() => { setCoverImage(null); setCoverPath(null); }}
      />

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

      {/* Title */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
          {t("titleLabel")}
          {isAiFilled("title_th") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
        </label>
        <input
          value={titleTh}
          onChange={(e) => setTitleTh(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {/* Category + Event Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium">
            หมวดหมู่
            {isAiFilled("category") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium">
            วันที่จัดงาน
            {isAiFilled("event_date") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
          สถานที่
          {isAiFilled("location") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="เช่น ห้องประชุม อาคาร A"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
        />
      </div>

      {/* Message Type Toggle */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setMessageType("text")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${messageType === "text" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          {t("typeText")}
        </button>
        <button
          onClick={() => setMessageType("flex")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${messageType === "flex" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
        >
          {t("typeFlex")}
        </button>
      </div>

      {/* Content */}
      {messageType === "text" ? (
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium">
            {t("contentLabel")}
            {isAiFilled("content_th") && <Sparkles className="h-3.5 w-3.5 text-primary" />}
          </label>
          <textarea
            value={contentTh}
            onChange={(e) => setContentTh(e.target.value)}
            placeholder={t("contentPlaceholder")}
            rows={6}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
          />
        </div>
      ) : (
        <FlexMessageEditor value={flexJson} onChange={setFlexJson} />
      )}

      {/* AI + Template buttons */}
      <div className="flex gap-2">
        <button onClick={() => setShowAI(true)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/50">
          {t("aiAssist")}
        </button>
        <button onClick={() => setShowTemplates(true)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/50">
          {t("fromTemplate")}
        </button>
      </div>

      {/* Target */}
      <div>
        <label className="mb-1 block text-sm font-medium">{t("target")}</label>
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="broadcast">{t("targetBroadcast")}</option>
          <option value="tags">{t("targetTags")}</option>
        </select>
        {targetType === "tags" && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                onClick={() =>
                  setTargetTags((prev) =>
                    prev.includes(tag.name) ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]
                  )
                }
                className={`rounded-full px-3 py-1 text-xs font-medium ${targetTags.includes(tag.name) ? "text-white" : "bg-muted text-muted-foreground"}`}
                style={targetTags.includes(tag.name) ? { backgroundColor: tag.color ?? undefined } : undefined}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options row */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded" />
          {t("pinAnnouncement")}
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

      {/* Bot searchable switch */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Bot className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium">ให้น้องซีมะโด่งใช้ตอบนิสิต</p>
            <p className="text-xs text-muted-foreground">Bot สามารถค้นหาและอ้างอิงประกาศนี้ได้</p>
          </div>
        </div>
        <Switch checked={isBotSearchable} onCheckedChange={setIsBotSearchable} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pb-6">
        <button
          onClick={() => handleSave("draft")}
          disabled={sending}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
        >
          {t("saveDraft")}
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !titleTh.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {sending ? t("sending") : t("sendNow")}
        </button>
      </div>

      {/* ── Dialogs ── */}

      {/* Poster upload wizard */}
      <Dialog open={showPosterUpload} onOpenChange={setShowPosterUpload}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogTitle className="sr-only">อัปโหลดโปสเตอร์</DialogTitle>
          <PosterUploadFlow
            onComplete={handlePosterUploadComplete}
            onClose={() => setShowPosterUpload(false)}
          />
        </DialogContent>
      </Dialog>

      {/* AI suggestion review */}
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
