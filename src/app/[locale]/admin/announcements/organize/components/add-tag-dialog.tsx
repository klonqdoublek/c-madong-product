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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBulkTag } from "@/hooks/use-announcement-organize";
import type { Tag } from "./announcement-organizer";

interface AddTagDialogProps {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  selectedItems: string[];
  onSuccess: () => void;
}

export function AddTagDialog({
  open,
  onClose,
  tags,
  selectedItems,
  onSuccess,
}: AddTagDialogProps) {
  const t = useTranslations("admin.announcementsPage.organize");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const bulkTag = useBulkTag();

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  function handleAdd() {
    if (selectedTags.length === 0) return;

    bulkTag.mutate(
      { announcementIds: selectedItems, tagIds: selectedTags },
      {
        onSuccess: (data) => {
          toast.success(t("bulk.tagSuccess", { count: data.count }));
          setSelectedTags([]);
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add tags");
        },
      }
    );
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedTags([]);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tag.addToAnnouncements")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            {t("tag.selectTags")} ({selectedItems.length} รายการ)
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5"
                  style={
                    selectedTags.includes(tag.id)
                      ? { backgroundColor: tag.color ?? undefined, borderColor: tag.color ?? undefined }
                      : { borderColor: tag.color ?? undefined, color: tag.color }
                  }
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีแท็ก กรุณาสร้างแท็กก่อน
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedTags.length === 0 || bulkTag.isPending}
          >
            {bulkTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("tag.addToAnnouncements")} ({selectedTags.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
