"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KnowledgeFolder, DocumentTag } from "@/hooks/use-knowledge";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: KnowledgeFolder[];
  tags: DocumentTag[];
  defaultFolderId?: string | null;
  defaultFile?: File | null;
  onUpload: (file: File, folderId: string | null, tagIds: string[]) => void;
  isPending: boolean;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  folders,
  tags,
  defaultFolderId,
  defaultFile,
  onUpload,
  isPending,
}: UploadDocumentDialogProps) {
  const t = useTranslations("admin.knowledgeBase");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState<string>("none");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Reset state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFile(defaultFile ?? null);
      setFolderId(defaultFolderId ?? "none");
      setSelectedTagIds([]);
    }
    onOpenChange(newOpen);
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  function handleSubmit() {
    if (!file) return;
    onUpload(file, folderId === "none" ? null : folderId, selectedTagIds);
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("upload.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            {file ? (
              <p className="text-sm font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t("upload.dragDrop")}</p>
                <p className="text-xs text-muted-foreground/60">{t("upload.fileTypes")}</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Folder picker */}
          <div className="space-y-2">
            <Label>{t("upload.selectFolder")}</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("sidebar.unfiled")}</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag selector */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>{t("upload.selectTags")}</Label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
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
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t("detail.back")}
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isPending}>
            {isPending ? t("upload.uploading") : t("upload.title")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
