"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import type { KnowledgeFolder } from "@/hooks/use-knowledge";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: KnowledgeFolder[];
  defaultParentId?: string | null;
  editFolder?: KnowledgeFolder | null;
  onSubmit: (data: { name: string; parentId?: string | null; description?: string }) => void;
  isPending: boolean;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  folders,
  defaultParentId,
  editFolder,
  onSubmit,
  isPending,
}: CreateFolderDialogProps) {
  const t = useTranslations("admin.knowledgeBase");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("none");

  useEffect(() => {
    if (open) {
      if (editFolder) {
        setName(editFolder.name);
        setParentId(editFolder.parent_id ?? "none");
      } else {
        setName("");
        setParentId(defaultParentId ?? "none");
      }
    }
  }, [open, editFolder, defaultParentId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      parentId: parentId === "none" ? null : parentId,
    });
  }

  // Filter out the current folder and its descendants when editing
  const availableFolders = editFolder
    ? folders.filter((f) => f.id !== editFolder.id)
    : folders;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editFolder ? t("folder.rename") : t("folder.create")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("folder.name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("folder.namePlaceholder")}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>{t("folder.parent")}</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("folder.parentNone")}</SelectItem>
                  {availableFolders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("detail.back")}
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {editFolder ? t("folder.rename") : t("folder.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
