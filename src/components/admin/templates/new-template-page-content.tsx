"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCreateTemplate } from "@/hooks/use-templates";
import { FlexMessageEditor } from "@/components/admin/flex-editor/flex-message-editor";
import { AIWritingAssistant } from "@/components/admin/flex-editor/ai-writing-assistant";
import { TEMPLATE_CATEGORIES } from "@/types/announcements";

export function NewTemplatePageContent() {
  const t = useTranslations("admin.newTemplate");
  const tTemplates = useTranslations("admin.templates");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createTemplate = useCreateTemplate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [messageType, setMessageType] = useState<"text" | "flex">("text");
  const [content, setContent] = useState("");
  const [flexJson, setFlexJson] = useState<Record<string, unknown> | null>(null);
  const [showAI, setShowAI] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    await createTemplate.mutateAsync({
      name,
      description: description || null,
      category,
      message_type: messageType,
      content: messageType === "text" ? content : null,
      flex_json: (messageType === "flex" ? flexJson : null) as any,
    });
    router.push("/admin/templates");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("nameLabel")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("descriptionLabel")}</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("categoryLabel")}</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        >
          {TEMPLATE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {tTemplates(c.labelKey)}
            </option>
          ))}
        </select>
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

      {messageType === "text" ? (
        <div>
          <label className="mb-1 block text-sm font-medium">{t("contentLabel")}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            rows={6}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
      ) : (
        <FlexMessageEditor value={flexJson} onChange={setFlexJson} />
      )}

      <button
        onClick={() => setShowAI(true)}
        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted/50"
      >
        {t("aiAssist")}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => router.push("/admin/templates")}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          {tCommon("cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={createTemplate.isPending || !name.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {tCommon("save")}
        </button>
      </div>

      <AIWritingAssistant
        open={showAI}
        onClose={() => setShowAI(false)}
        onInsert={(text) => setContent((prev) => prev + text)}
      />
    </div>
  );
}
