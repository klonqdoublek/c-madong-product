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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LucideIconPicker } from "@/components/ui/lucide-icon-picker";
import { DynamicLucideIcon } from "@/components/ui/dynamic-lucide-icon";
import { useCreateFolder } from "@/hooks/use-announcement-organize";

const COLORS = [
  { name: "เทา", value: "#6B7280" },
  { name: "น้ำเงิน", value: "#3b82f6" },
  { name: "เขียว", value: "#10b981" },
  { name: "ส้ม", value: "#f59e0b" },
  { name: "แดง", value: "#ef4444" },
  { name: "ม่วง", value: "#8b5cf6" },
];

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateFolderDialog({ open, onClose }: CreateFolderDialogProps) {
  const t = useTranslations("admin.announcementsPage.organize.folder");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [color, setColor] = useState("#6B7280");
  const [description, setDescription] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const createFolder = useCreateFolder();

  function handleCreate() {
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    createFolder.mutate(
      { name: name.trim(), icon, color, description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(t("createSuccess"));
          resetForm();
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create folder");
        },
      }
    );
  }

  function resetForm() {
    setName("");
    setIcon("Folder");
    setColor("#6B7280");
    setDescription("");
    setShowIconPicker(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetForm();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Folder Name */}
          <div>
            <Label htmlFor="folder-name">{t("name")}</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="mt-1.5"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="folder-desc">{t("description")}</Label>
            <Textarea
              id="folder-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              className="mt-1.5"
              rows={2}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <Label>{t("icon")}</Label>
            <div className="mt-2">
              {/* Selected icon preview + toggle */}
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex items-center gap-2 rounded-lg border-2 border-primary/50 bg-primary/5 px-4 py-2 transition-colors hover:bg-primary/10"
              >
                <DynamicLucideIcon name={icon} className="h-5 w-5" size={20} />
                <span className="text-sm text-muted-foreground">{icon}</span>
              </button>

              {/* Icon picker grid (collapsible) */}
              {showIconPicker && (
                <div className="mt-3 rounded-lg border p-3">
                  <LucideIconPicker
                    value={icon}
                    onChange={(iconName) => {
                      setIcon(iconName);
                      setShowIconPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>{t("color")}</Label>
            <div className="mt-2 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`flex h-10 w-16 items-center justify-center rounded-lg border-2 text-xs font-medium text-white transition-all ${
                    color === c.value
                      ? "border-foreground shadow-lg scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="mb-2 block text-xs text-muted-foreground">ตัวอย่าง</Label>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}20` }}
              >
                <DynamicLucideIcon name={icon} className="h-4 w-4" size={16} style={{ color }} />
              </div>
              <span className="font-medium">{name || t("namePlaceholder")}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || createFolder.isPending}
          >
            {createFolder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
