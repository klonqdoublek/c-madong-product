"use client";

import { useTranslations } from "next-intl";

interface DocumentPreviewProps {
  content: string;
  contentType: string | null;
  filePath: string | null;
}

export function DocumentPreview({ content, contentType, filePath }: DocumentPreviewProps) {
  const t = useTranslations("admin.knowledgeBase");

  const isPdf = contentType?.includes("pdf") || filePath?.endsWith(".pdf");

  if (isPdf && filePath) {
    // We can't embed private Supabase storage PDFs directly.
    // Show text content instead.
    if (content) {
      return (
        <div className="rounded-lg border bg-muted/30 p-4">
          <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </pre>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-sm text-muted-foreground">{t("detail.noPreview")}</p>
      </div>
    );
  }

  if (content) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed py-16">
      <p className="text-sm text-muted-foreground">{t("detail.noPreview")}</p>
    </div>
  );
}
