"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCreateAnnouncement, useUpdateAnnouncement, useAnnouncement } from "@/hooks/use-announcements";
import { useTags } from "@/hooks/use-tags";
import { FlexMessageEditor } from "@/components/admin/flex-editor/flex-message-editor";
import { AIWritingAssistant } from "@/components/admin/flex-editor/ai-writing-assistant";
import { TemplateSelector } from "@/components/admin/flex-editor/template-selector";
import type { MessageTemplate } from "@/types/announcements";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

interface Props {
  announcementId?: string;
}

export function NewAnnouncementPageContent({ announcementId }: Props) {
  const t = useTranslations("admin.newAnnouncement");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: existing } = useAnnouncement(announcementId ?? null);
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const { data: tags } = useTags();

  const [titleTh, setTitleTh] = useState(existing?.title_th ?? "");
  const [contentTh, setContentTh] = useState(existing?.content_th ?? "");
  const [titleEn, setTitleEn] = useState(existing?.title_en ?? "");
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

  const [showAI, setShowAI] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);

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
      setFlexJson(template.flex_json);
      setMessageType("flex");
    }
  }

  async function handleSave(status: string) {
    const data = {
      title_th: titleTh,
      title_en: titleEn || titleTh,
      content_th: contentTh,
      content_en: contentEn || contentTh,
      message_type: messageType,
      flex_json: messageType === "flex" ? flexJson : null,
      target_type: targetType,
      target_tags: targetType === "tags" ? targetTags : [],
      is_pinned: isPinned,
      status,
      author_id: "", // Will be set by RLS/server
    };

    if (announcementId) {
      await updateAnnouncement.mutateAsync({ id: announcementId, ...data });
    } else {
      await createAnnouncement.mutateAsync(data);
    }
    router.push("/admin/announcements");
  }

  async function handleSend() {
    setSending(true);
    try {
      // Save as sent first
      const data = {
        title_th: titleTh,
        title_en: titleEn || titleTh,
        content_th: contentTh,
        content_en: contentEn || contentTh,
        message_type: messageType,
        flex_json: messageType === "flex" ? flexJson : null,
        target_type: targetType,
        target_tags: targetType === "tags" ? targetTags : [],
        is_pinned: isPinned,
        status: "sent",
        sent_at: new Date().toISOString(),
        author_id: "",
      };

      let id = announcementId;
      if (id) {
        await updateAnnouncement.mutateAsync({ id, ...data });
      } else {
        const result = await createAnnouncement.mutateAsync(data);
        id = result.id;
      }

      // Send via LINE
      await fetch("/api/admin/announcements/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementId: id,
          targetType,
          targetTags,
          messageType,
          content: contentTh,
          flexJson,
        }),
      });

      router.push("/admin/announcements");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminBreadcrumb />
      <h1 className="font-heading text-2xl font-bold">
        {announcementId ? t("editTitle") : t("title")}
      </h1>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">{t("titleLabel")}</label>
        <input
          value={titleTh}
          onChange={(e) => setTitleTh(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Message Type Toggle */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setMessageType("text")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            messageType === "text" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t("typeText")}
        </button>
        <button
          onClick={() => setMessageType("flex")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            messageType === "flex" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t("typeFlex")}
        </button>
      </div>

      {/* Content */}
      {messageType === "text" ? (
        <div>
          <label className="mb-1 block text-sm font-medium">{t("contentLabel")}</label>
          <textarea
            value={contentTh}
            onChange={(e) => setContentTh(e.target.value)}
            placeholder={t("contentPlaceholder")}
            rows={6}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
      ) : (
        <FlexMessageEditor value={flexJson} onChange={setFlexJson} />
      )}

      {/* AI + Template buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAI(true)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/50"
        >
          {t("aiAssist")}
        </button>
        <button
          onClick={() => setShowTemplates(true)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/50"
        >
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
                    prev.includes(tag.name)
                      ? prev.filter((t) => t !== tag.name)
                      : [...prev, tag.name]
                  )
                }
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  targetTags.includes(tag.name)
                    ? "text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                style={
                  targetTags.includes(tag.name)
                    ? { backgroundColor: tag.color }
                    : undefined
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="rounded"
        />
        {t("pinAnnouncement")}
      </label>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSave("draft")}
          disabled={createAnnouncement.isPending || updateAnnouncement.isPending}
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

      {/* Dialogs */}
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
