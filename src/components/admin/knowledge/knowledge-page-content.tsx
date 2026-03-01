"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useKnowledgeQuery } from "@/hooks/use-knowledge-query";

export function KnowledgePageContent() {
  const t = useTranslations("admin.knowledgeBase");
  const tCommon = useTranslations("common");
  const [tab, setTab] = useState<"documents" | "playground">("documents");

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>

      {/* Tab selector */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("documents")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "documents" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t("documentsTab")}
        </button>
        <button
          onClick={() => setTab("playground")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "playground" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          {t("playgroundTab")}
        </button>
      </div>

      {tab === "documents" ? <DocumentsTab /> : <PlaygroundTab />}
    </div>
  );
}

function DocumentsTab() {
  const t = useTranslations("admin.knowledgeBase");
  const tCommon = useTranslations("common");
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: documents, isLoading } = useDocuments();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDoc.mutateAsync(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    ready: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="rounded-lg border-2 border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("uploadDescription")}</p>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.pdf,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploadDoc.isPending}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {uploadDoc.isPending ? t("uploading") : t("upload")}
        </button>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={`rounded px-1.5 py-0.5 ${STATUS_COLORS[doc.status] ?? STATUS_COLORS.pending}`}
                  >
                    {t(`status${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}`)}
                  </span>
                  <span>{new Date(doc.created_at).toLocaleDateString("th-TH")}</span>
                </div>
              </div>
              <button
                onClick={() => deleteDoc.mutate(doc.id)}
                disabled={deleteDoc.isPending}
                className="ml-2 rounded p-1 text-muted-foreground hover:text-destructive"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground">{t("noDocuments")}</p>
      )}
    </div>
  );
}

function PlaygroundTab() {
  const t = useTranslations("admin.knowledgeBase");
  const queryKnowledge = useKnowledgeQuery();
  const [question, setQuestion] = useState("");

  async function handleAsk() {
    if (!question.trim()) return;
    queryKnowledge.mutate(question);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("playgroundDescription")}</p>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("questionPlaceholder")}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={handleAsk}
          disabled={queryKnowledge.isPending || !question.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {queryKnowledge.isPending ? t("thinking") : t("ask")}
        </button>
      </div>

      {queryKnowledge.data && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 font-medium">{t("answer")}</h3>
            <p className="whitespace-pre-wrap text-sm">{queryKnowledge.data.answer}</p>
          </div>
          {queryKnowledge.data.sources.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="mb-2 text-sm font-medium">{t("sources")}</h3>
              {queryKnowledge.data.sources.map((src, i) => (
                <div key={i} className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                  <p className="line-clamp-3">{src.content}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {t("similarity")}: {(src.similarity * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {queryKnowledge.error && (
        <p className="text-sm text-destructive">{t("queryError")}</p>
      )}
    </div>
  );
}
