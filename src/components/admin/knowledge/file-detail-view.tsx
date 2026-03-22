"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileText, FileType2, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import { useKnowledgeDocument, useDocumentQuery } from "@/hooks/use-knowledge";
import { DocumentPreview } from "./document-preview";

export function FileDetailView() {
  const t = useTranslations("admin.knowledgeBase");
  const { selectedFileId, goBack } = useKnowledgeStore();
  const { data: doc, isLoading } = useKnowledgeDocument(selectedFileId);

  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState("");
  const queryDoc = useDocumentQuery();

  if (isLoading || !doc) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const isPdf = doc.content_type?.includes("pdf") || doc.filename?.endsWith(".pdf");
  const Icon = isPdf ? FileType2 : FileText;

  function handleAsk() {
    if (!question.trim() || !selectedFileId) return;
    queryDoc.mutate({ question, documentId: selectedFileId });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={goBack}>
        <ArrowLeft className="h-4 w-4" />
        {t("detail.back")}
      </Button>

      {/* Title + metadata */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{doc.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>v{doc.version}</span>
            <span className="text-muted-foreground/40">|</span>
            {doc.creator && (
              <>
                <span className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={doc.creator.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[8px]">
                      {(doc.creator.full_name_th ?? "?")[0]}
                    </AvatarFallback>
                  </Avatar>
                  {doc.creator.full_name_th}
                </span>
                <span className="text-muted-foreground/40">|</span>
              </>
            )}
            <span>
              {new Date(doc.updated_at).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {doc.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {doc.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="gap-1 text-xs">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ask about this document button */}
      <Button
        variant="outline"
        className="w-fit gap-2"
        onClick={() => setShowQA(!showQA)}
      >
        <MessageCircleQuestion className="h-4 w-4" />
        {t("detail.askAbout")}
      </Button>

      {/* Per-document Q&A panel */}
      {showQA && (
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("questionPlaceholder")}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              className="text-sm"
            />
            <Button
              onClick={handleAsk}
              disabled={queryDoc.isPending || !question.trim()}
              size="sm"
            >
              {queryDoc.isPending ? t("thinking") : t("ask")}
            </Button>
          </div>

          {queryDoc.data && (
            <div className="space-y-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">{t("answer")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{queryDoc.data.answer}</p>
              </div>
              {queryDoc.data.sources.length > 0 && (
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">{t("sources")}</p>
                  {queryDoc.data.sources.map((src, i) => (
                    <p key={i} className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {src.content}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {queryDoc.error && (
            <p className="text-sm text-destructive">{t("queryError")}</p>
          )}
        </div>
      )}

      <Separator />

      {/* Document preview */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">{t("detail.preview")}</h3>
        <DocumentPreview
          content={doc.content}
          contentType={doc.content_type}
          filePath={doc.file_path}
        />
      </div>
    </div>
  );
}
