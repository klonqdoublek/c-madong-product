"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
  useUpdateDocument,
  useAnalyzeDocument,
  type KnowledgeDocument,
  type KnowledgeFolder,
  type DocumentTag,
  type AISuggestion,
} from "@/hooks/use-knowledge";

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
  folders: KnowledgeFolder[];
  tags: DocumentTag[];
}

interface FieldSuggestion {
  title?: string;
  folderId?: string | null;
  tagIds?: string[];
  versionBump?: boolean;
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  document: doc,
  folders,
  tags,
}: EditDocumentDialogProps) {
  const updateDoc = useUpdateDocument();
  const analyzeDoc = useAnalyzeDocument();

  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState<string>("none");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [versionNumber, setVersionNumber] = useState(1);
  const [suggestion, setSuggestion] = useState<FieldSuggestion | null>(null);
  const [acceptedFields, setAcceptedFields] = useState<Set<string>>(new Set());

  // Reset on open
  useEffect(() => {
    if (open && doc) {
      setTitle(doc.title);
      setFolderId(doc.folder_id ?? "none");
      setSelectedTagIds(doc.tags.map((t) => t.id));
      setVersionNumber(doc.version_number);
      setSuggestion(null);
      setAcceptedFields(new Set());
    }
  }, [open, doc]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleAISuggest() {
    if (!doc) return;
    setSuggestion(null);
    setAcceptedFields(new Set());

    analyzeDoc.mutate(
      { documentId: doc.id },
      {
        onSuccess: (result) => {
          const s = result.suggestion as AISuggestion | null;
          if (!s) {
            toast.info("AI วิเคราะห์ไม่พบคำแนะนำเพิ่มเติม");
            return;
          }
          const newSuggestion: FieldSuggestion = {
            title: s.suggestedFilename !== doc.title ? s.suggestedFilename : undefined,
            folderId:
              s.suggestedFolderId !== doc.folder_id ? s.suggestedFolderId : undefined,
            tagIds:
              s.suggestedTagIds.length > 0 ? s.suggestedTagIds : undefined,
            versionBump: (result.versionMatch?.parentVersion ?? 0) >= doc.version_number,
          };
          setSuggestion(newSuggestion);
        },
        onError: () => toast.error("AI วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่"),
      }
    );
  }

  function acceptField(field: keyof FieldSuggestion) {
    if (!suggestion) return;
    if (field === "title" && suggestion.title) setTitle(suggestion.title);
    if (field === "folderId" && suggestion.folderId !== undefined)
      setFolderId(suggestion.folderId ?? "none");
    if (field === "tagIds" && suggestion.tagIds) setSelectedTagIds(suggestion.tagIds);
    if (field === "versionBump" && suggestion.versionBump)
      setVersionNumber((v) => v + 1);
    setAcceptedFields((prev) => new Set([...prev, field]));
  }

  function handleSave() {
    if (!doc) return;
    updateDoc.mutate(
      {
        id: doc.id,
        title: title.trim() || doc.title,
        folderId: folderId === "none" ? null : folderId,
        tagIds: selectedTagIds,
        version: `${versionNumber}.0`,
      },
      {
        onSuccess: () => {
          toast.success("บันทึกการแก้ไขเรียบร้อย");
          onOpenChange(false);
        },
        onError: () => toast.error("บันทึกไม่สำเร็จ กรุณาลองใหม่"),
      }
    );
  }

  const isBusy = analyzeDoc.isPending || updateDoc.isPending;

  return (
    <Dialog open={open} onOpenChange={isBusy ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>แก้ไขเอกสาร</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleAISuggest}
              disabled={isBusy}
            >
              {analyzeDoc.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 text-violet-600" />
              )}
              AI ช่วยแนะนำ
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>ชื่อเอกสาร</Label>
            <div className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isBusy}
                className="flex-1"
              />
            </div>
            {suggestion?.title && !acceptedFields.has("title") && (
              <SuggestionPill
                label={suggestion.title}
                onAccept={() => acceptField("title")}
              />
            )}
          </div>

          {/* Folder */}
          <div className="space-y-2">
            <Label>หมวดหมู่ (โฟลเดอร์)</Label>
            <Select value={folderId} onValueChange={setFolderId} disabled={isBusy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่ระบุโฟลเดอร์</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {suggestion?.folderId !== undefined && !acceptedFields.has("folderId") && (
              <SuggestionPill
                label={folders.find((f) => f.id === suggestion.folderId)?.name ?? "ไม่ระบุโฟลเดอร์"}
                onAccept={() => acceptField("folderId")}
              />
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>แท็ก</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => !isBusy && toggleTag(tag.id)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: tag.color ?? undefined }}
                    />
                    {tag.name}
                  </button>
                ))}
              </div>
              {suggestion?.tagIds && !acceptedFields.has("tagIds") && (
                <SuggestionPill
                  label={`แนะนำ: ${suggestion.tagIds
                    .map((id) => tags.find((t) => t.id === id)?.name ?? id)
                    .join(", ")}`}
                  onAccept={() => acceptField("tagIds")}
                />
              )}
            </div>
          )}

          {/* Version */}
          <div className="space-y-2">
            <Label>เวอร์ชัน</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">v</span>
                <Input
                  type="number"
                  min={1}
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isBusy}
                  className="w-20 text-center"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setVersionNumber((v) => v + 1)}
                disabled={isBusy}
              >
                ↑ เพิ่มเวอร์ชัน
              </Button>
            </div>
            {suggestion?.versionBump && !acceptedFields.has("versionBump") && (
              <SuggestionPill
                label={`AI แนะนำ: อัปเป็น v${versionNumber + 1} (เนื้อหาคล้ายเอกสารเก่า)`}
                onAccept={() => acceptField("versionBump")}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={isBusy}>
            {updateDoc.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึก"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuggestionPill({
  label,
  onAccept,
}: {
  label: string;
  onAccept: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" />
      <span className="flex-1 truncate text-xs text-violet-700">{label}</span>
      <button
        type="button"
        onClick={onAccept}
        className="flex items-center gap-1 rounded border border-violet-300 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700 hover:bg-violet-100"
      >
        <Check className="h-2.5 w-2.5" />
        ใช้ค่านี้
      </button>
    </div>
  );
}
