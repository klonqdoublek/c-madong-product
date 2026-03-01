"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTags } from "@/hooks/use-tags";
import { useTemplates } from "@/hooks/use-templates";
import type { MessageTemplate } from "@/types/announcements";

export function BroadcastPageContent() {
  const t = useTranslations("admin.broadcast");
  const tCommon = useTranslations("common");
  const { data: tags } = useTags();
  const { data: templates } = useTemplates();

  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("broadcast");
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleTemplateSelect(template: MessageTemplate) {
    if (template.content) setMessage(template.content);
  }

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("/api/admin/announcements/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetTags,
          messageType: "text",
          content: message,
        }),
      });
      setSent(true);
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      {sent && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {t("sentSuccess")}
        </div>
      )}

      {/* Quick Templates */}
      {templates && templates.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium">{t("quickTemplates")}</label>
          <div className="flex flex-wrap gap-2">
            {templates.slice(0, 6).map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl)}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/50"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="mb-1 block text-sm font-medium">{t("messageLabel")}</label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setSent(false);
          }}
          placeholder={t("messagePlaceholder")}
          rows={5}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Target */}
      <div>
        <label className="mb-1 block text-sm font-medium">{t("target")}</label>
        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="broadcast">{t("targetAll")}</option>
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

      {/* Send */}
      <button
        onClick={handleSend}
        disabled={sending || !message.trim()}
        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {sending ? t("sending") : t("send")}
      </button>
    </div>
  );
}
