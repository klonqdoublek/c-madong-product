"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateTag } from "@/hooks/use-announcement-organize";

const TAG_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange-2
  "#6366f1", // indigo
];

interface CreateTagDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTagDialog({ open, onClose }: CreateTagDialogProps) {
  const t = useTranslations("admin.announcementsPage.organize.tag");
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  const createTag = useCreateTag();

  function handleCreate() {
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    createTag.mutate(
      { name: name.trim(), color },
      {
        onSuccess: () => {
          toast.success(t("createSuccess"));
          resetForm();
          onClose();
        },
        onError: (error) => {
          // Handle duplicate tag name (409)
          if (error.message === "Tag name already exists") {
            toast.error(t("nameExists"));
          } else {
            toast.error(error.message || "Failed to create tag");
          }
        },
      }
    );
  }

  function resetForm() {
    setName("");
    setColor(TAG_COLORS[0]);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetForm();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tag Name */}
          <div>
            <Label htmlFor="tag-name">{t("name")}</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="mt-1.5"
            />
          </div>

          {/* Color Selection */}
          <div>
            <Label>{t("color")}</Label>
            <div className="mt-2 grid grid-cols-10 gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-lg border-2 transition-all ${
                    color === c
                      ? "scale-110 border-foreground shadow-lg"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="mb-2 block text-xs text-muted-foreground">ตัวอย่าง</Label>
            <div
              className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {name || t("namePlaceholder")}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createTag.isPending}
          >
            {createTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
