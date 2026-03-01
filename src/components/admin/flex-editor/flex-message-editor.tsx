"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FlexMessagePreview } from "./flex-message-preview";

interface Props {
  value: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown> | null) => void;
}

export function FlexMessageEditor({ value, onChange }: Props) {
  const t = useTranslations("admin.flexEditor");
  const [tab, setTab] = useState<"visual" | "json">("json");
  const [jsonText, setJsonText] = useState(
    value ? JSON.stringify(value, null, 2) : ""
  );
  const [parseError, setParseError] = useState("");

  function handleJsonChange(text: string) {
    setJsonText(text);
    setParseError("");
    if (!text.trim()) {
      onChange(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
    } catch {
      setParseError(t("invalidJson"));
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("json")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "json" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t("jsonTab")}
        </button>
        <button
          onClick={() => setTab("visual")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "visual" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t("previewTab")}
        </button>
      </div>

      {tab === "json" ? (
        <div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={t("jsonPlaceholder")}
            rows={12}
            className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm"
          />
          {parseError && (
            <p className="mt-1 text-sm text-destructive">{parseError}</p>
          )}
        </div>
      ) : (
        <FlexMessagePreview flexJson={value} />
      )}
    </div>
  );
}
