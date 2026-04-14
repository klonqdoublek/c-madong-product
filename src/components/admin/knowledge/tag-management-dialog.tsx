"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DocumentTag } from "@/hooks/use-knowledge";

const TAG_COLORS = [
  "#6B7280", "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#78716C",
];

interface TagManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: DocumentTag[];
  onCreate: (data: { name: string; color: string }) => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
}

export function TagManagementDialog({
  open,
  onOpenChange,
  tags,
  onCreate,
  onDelete,
  isCreating,
}: TagManagementDialogProps) {
  const t = useTranslations("admin.knowledgeBase");
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  function handleCreate() {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), color });
    setName("");
    setColor(TAG_COLORS[0]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("tag.manage")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Create new tag */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("tag.namePlaceholder")}
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button size="sm" onClick={handleCreate} disabled={!name.trim() || isCreating}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Color picker */}
            <div className="flex gap-1.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Existing tags */}
          <div className="max-h-[250px] space-y-1 overflow-auto">
            {tags.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("tag.noTags")}
              </p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color ?? undefined }}
                    />
                    {tag.name}
                  </span>
                  <button
                    onClick={() => onDelete(tag.id)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
