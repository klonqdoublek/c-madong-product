"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

export function AIWritingAssistant({ open, onClose, onInsert }: Props) {
  const t = useTranslations("admin.aiWriting");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/admin/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setResult(data.text ?? "");
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <h2 className="font-heading text-lg font-bold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>

        <div className="mt-4 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("promptPlaceholder")}
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? t("generating") : t("generate")}
          </button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {result && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm">{result}</p>
              <button
                onClick={() => {
                  onInsert(result);
                  onClose();
                }}
                className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("insert")}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
