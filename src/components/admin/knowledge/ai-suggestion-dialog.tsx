"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAnalyzeDocument,
  useApplySuggestion,
  useAISuggestionFeedback,
  type AISuggestion,
  type VersionMatch,
  type KnowledgeFolder,
  type DocumentTag,
} from "@/hooks/use-knowledge";
import { cn } from "@/lib/utils/cn";

type DialogState = "loading" | "main" | "feedback-default" | "feedback-detail";

interface AISuggestionDialogProps {
  open: boolean;
  documentId: string | null;
  folders: KnowledgeFolder[];
  tags: DocumentTag[];
  onOpenChange: (open: boolean) => void;
}

const NEW_FOLDER_VALUE = "__new__";

export function AISuggestionDialog({
  open,
  documentId,
  folders,
  tags,
  onOpenChange,
}: AISuggestionDialogProps) {
  const t = useTranslations("admin.knowledgeBase");

  const analyzeMut = useAnalyzeDocument();
  const applyMut = useApplySuggestion();
  const feedbackMut = useAISuggestionFeedback();

  const [state, setState] = useState<DialogState>("loading");
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [versionMatch, setVersionMatch] = useState<VersionMatch | null>(null);

  // Form state
  const [filename, setFilename] = useState("");
  const [folderId, setFolderId] = useState<string>("none");
  const [newFolderName, setNewFolderName] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [newTagDraft, setNewTagDraft] = useState("");
  const [newTagNames, setNewTagNames] = useState<string[]>([]);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<"up" | "down" | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [acceptedFields, setAcceptedFields] = useState<string[]>([]);
  const [finalVersion, setFinalVersion] = useState<number>(1);
  const [finalFolderName, setFinalFolderName] = useState<string>("");

  const analyzeFired = useRef<string | null>(null);

  // Trigger analyze on open
  useEffect(() => {
    if (!open || !documentId) {
      analyzeFired.current = null;
      return;
    }
    if (analyzeFired.current === documentId) return;
    analyzeFired.current = documentId;

    setState("loading");
    setSuggestion(null);
    setVersionMatch(null);
    setFeedbackRating(null);
    setFeedbackComment("");
    setAcceptedFields([]);

    analyzeMut.mutate(
      { documentId },
      {
        onSuccess: (data) => {
          const s = data.suggestion;
          setSuggestion(s);
          setVersionMatch(data.versionMatch);

          if (s) {
            setFilename(s.suggestedFilename || data.filename || "");
            setFolderId(
              s.suggestedFolderId
                ? s.suggestedFolderId
                : s.suggestedNewFolder
                  ? NEW_FOLDER_VALUE
                  : "none"
            );
            setNewFolderName(s.suggestedNewFolder?.name ?? "");
            setTagIds(s.suggestedTagIds ?? []);
            setNewTagNames(s.suggestedNewTags ?? []);
          } else {
            setFilename(data.filename || "");
            setFolderId("none");
            setNewFolderName("");
            setTagIds([]);
            setNewTagNames([]);
          }
          setState("main");
        },
        onError: () => {
          toast.error(t("ai.analyzeError"));
          onOpenChange(false);
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId]);

  function handleAccept() {
    if (!documentId) return;

    const changedFields: string[] = [];
    if (suggestion && filename !== suggestion.suggestedFilename) changedFields.push("filename");
    if (tagIds.length || newTagNames.length) changedFields.push("tags");
    if (folderId !== "none") changedFields.push("folder");

    const accepted = {
      filename: filename.trim() || undefined,
      folderId:
        folderId === NEW_FOLDER_VALUE
          ? null
          : folderId === "none"
            ? null
            : folderId,
      newFolderName:
        folderId === NEW_FOLDER_VALUE && newFolderName.trim()
          ? newFolderName.trim()
          : undefined,
      tagIds,
      newTagNames,
      versionOf: versionMatch?.parentId,
    };

    applyMut.mutate(
      {
        documentId,
        accepted,
        suggestionSnapshot: suggestion ? (suggestion as unknown as Record<string, unknown>) : undefined,
      },
      {
        onSuccess: (result) => {
          setFinalVersion(result.versionNumber);
          // Resolve final folder name for display
          if (folderId === NEW_FOLDER_VALUE) {
            setFinalFolderName(newFolderName.trim());
          } else if (folderId !== "none") {
            const f = folders.find((x) => x.id === folderId);
            setFinalFolderName(f?.name ?? "");
          } else {
            setFinalFolderName("");
          }
          setAcceptedFields(changedFields);
          setState("feedback-default");
        },
        onError: (err) => {
          toast.error((err as Error).message || t("ai.applyError"));
        },
      }
    );
  }

  function handleReject() {
    setAcceptedFields([]);
    setFinalFolderName("");
    setFinalVersion(1);
    setState("feedback-default");
  }

  function submitFeedback(skip: boolean) {
    if (!documentId || !feedbackRating) {
      onOpenChange(false);
      return;
    }
    if (skip) {
      feedbackMut.mutate({
        documentId,
        rating: feedbackRating,
        acceptedFields,
      });
      onOpenChange(false);
      return;
    }
    feedbackMut.mutate(
      {
        documentId,
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
        suggestionSnapshot: suggestion ? (suggestion as unknown as Record<string, unknown>) : undefined,
        acceptedFields,
      },
      {
        onSettled: () => onOpenChange(false),
      }
    );
  }

  function toggleTag(id: string) {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function removeNewTag(name: string) {
    setNewTagNames((prev) => prev.filter((n) => n !== name));
  }

  function addNewTag() {
    const name = newTagDraft.trim();
    if (!name) return;
    if (newTagNames.includes(name)) return;
    // If matches existing tag, toggle it instead
    const existing = tags.find(
      (tg) => tg.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      if (!tagIds.includes(existing.id)) setTagIds((p) => [...p, existing.id]);
    } else {
      setNewTagNames((p) => [...p, name]);
    }
    setNewTagDraft("");
  }

  const selectedTagChips = [
    ...tagIds.map((id) => {
      const tag = tags.find((t) => t.id === id);
      return tag
        ? { key: `id-${id}`, name: tag.name, color: tag.color, isNew: false, onRemove: () => toggleTag(id) }
        : null;
    }),
    ...newTagNames.map((name) => ({
      key: `new-${name}`,
      name,
      color: "#DD598B",
      isNew: true,
      onRemove: () => removeNewTag(name),
    })),
  ].filter(Boolean) as Array<{
    key: string;
    name: string;
    color: string;
    isNew: boolean;
    onRemove: () => void;
  }>;

  const confidencePct = suggestion
    ? Math.round(suggestion.confidence * 100)
    : 0;

  const filenameForSummary = filename || t("ai.newDocument");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
        <DialogTitle className="sr-only">{t("ai.dialogTitle")}</DialogTitle>

        {/* ── Loading state ────────────────────────────── */}
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <div className="mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("ai.analyzing")}
            </p>
          </div>
        )}

        {/* ── Main state ───────────────────────────────── */}
        {state === "main" && (
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Header: filename chip + success pill + close */}
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
              <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs font-medium">
                  {filenameForSummary}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("ai.uploadSuccess")}
                </span>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Hero */}
            <div className="px-5 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {t("ai.mainTitle")}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("ai.mainSubtitle")}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence card */}
            {suggestion && (
              <div className="mx-5 mt-4 rounded-lg bg-primary/5 p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {confidencePct}%
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">
                      {t("ai.accuracyTitle")}
                    </p>
                    {suggestion.summary && (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {suggestion.summary}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Version card */}
            <div className="mx-5 mt-3 flex items-start gap-3 rounded-lg bg-primary/5 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    {t("ai.versionLabel", {
                      version: versionMatch
                        ? `${versionMatch.parentVersion + 1}.0`
                        : "1.0",
                    })}
                  </span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                    {t("ai.newBadge")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {versionMatch
                    ? t("ai.versionFoundSimilar", {
                        title: versionMatch.parentTitle,
                      })
                    : t("ai.versionFirstEntry")}
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3 px-5 pt-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  {t("ai.suggestedFilename")}
                  <Sparkles className="h-3 w-3 text-primary" />
                </Label>
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  {t("ai.suggestedFolder")}
                  <Sparkles className="h-3 w-3 text-primary" />
                </Label>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("sidebar.unfiled")}
                    </SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={NEW_FOLDER_VALUE}>
                      {t("ai.createNewFolderOption")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {folderId === NEW_FOLDER_VALUE && (
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={t("ai.newFolderPlaceholder")}
                    className="mt-1.5 h-9 text-sm"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  {t("ai.suggestedTags")}
                  <Sparkles className="h-3 w-3 text-primary" />
                </Label>
                {selectedTagChips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTagChips.map((chip) => (
                      <span
                        key={chip.key}
                        className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: chip.color }}
                        />
                        {chip.name}
                        {chip.isNew && (
                          <span className="ml-0.5 text-[9px] opacity-70">
                            {t("ai.newBadge")}
                          </span>
                        )}
                        <button
                          onClick={chip.onRemove}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5">
                  <Input
                    value={newTagDraft}
                    onChange={(e) => setNewTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNewTag();
                      }
                    }}
                    placeholder={t("ai.addTagPlaceholder")}
                    className="h-9 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewTag}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    {t("ai.addTag")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 border-t px-5 py-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handleReject}
                  disabled={applyMut.isPending}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  {t("ai.rejectButton")}
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  onClick={handleAccept}
                  disabled={applyMut.isPending}
                >
                  {applyMut.isPending ? t("ai.applying") : t("ai.acceptButton")}
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                {t("ai.rejectSubtext")}
              </p>
            </div>
          </div>
        )}

        {/* ── Feedback states ──────────────────────────── */}
        {(state === "feedback-default" || state === "feedback-detail") && (
          <FeedbackView
            state={state}
            filename={filenameForSummary}
            version={finalVersion}
            folderName={finalFolderName}
            rating={feedbackRating}
            comment={feedbackComment}
            onRating={(r) => {
              setFeedbackRating(r);
              setState("feedback-detail");
            }}
            onCommentChange={setFeedbackComment}
            onSubmit={() => submitFeedback(false)}
            onSkip={() => submitFeedback(true)}
            onClose={() => onOpenChange(false)}
            isPending={feedbackMut.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Feedback subview ────────────────────────────────────
function FeedbackView({
  state,
  filename,
  version,
  folderName,
  rating,
  comment,
  onRating,
  onCommentChange,
  onSubmit,
  onSkip,
  onClose,
  isPending,
}: {
  state: DialogState;
  filename: string;
  version: number;
  folderName: string;
  rating: "up" | "down" | null;
  comment: string;
  onRating: (r: "up" | "down") => void;
  onCommentChange: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("admin.knowledgeBase");

  return (
    <div className="px-5 py-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h3 className="font-heading text-base font-bold text-primary">
            {t("ai.savedTitle")}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        {t("ai.savedSubtitle")}
      </p>

      {/* Doc summary card */}
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5">
        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{filename}</span>
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-white">
              {t("ai.newBadge")}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Version {version}.0{folderName ? ` · ${folderName}` : ""}
          </p>
        </div>
      </div>

      {/* Rating prompt */}
      <p className="mb-3 text-sm font-medium">
        {t("ai.ratingPrompt")}{" "}
        <span className="text-xs text-muted-foreground">
          {t("ai.optional")}
        </span>
      </p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => onRating("up")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg border-2 py-3 transition-colors",
            rating === "up"
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted-foreground/20 hover:border-primary/50"
          )}
        >
          <ThumbsUp className="h-5 w-5" />
        </button>
        <button
          onClick={() => onRating("down")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg border-2 py-3 transition-colors",
            rating === "down"
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted-foreground/20 hover:border-primary/50"
          )}
        >
          <ThumbsDown className="h-5 w-5" />
        </button>
      </div>

      {/* Default state: close button */}
      {state === "feedback-default" && (
        <Button
          className="w-full rounded-full"
          onClick={onClose}
          disabled={isPending}
        >
          {t("ai.closeDialog")}
        </Button>
      )}

      {/* Detail state: textarea + submit */}
      {state === "feedback-detail" && (
        <>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={
              rating === "down"
                ? t("ai.commentPromptDown")
                : t("ai.commentPromptUp")
            }
            className="mb-3 min-h-[72px] w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isPending}
            >
              {t("ai.skipFeedback")}
            </button>
            <Button
              className="rounded-full"
              onClick={onSubmit}
              disabled={isPending}
            >
              {isPending ? t("ai.submitting") : t("ai.submitFeedback")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
