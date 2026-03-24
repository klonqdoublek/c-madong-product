"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  function handleAdd() {
    const tagNames = selectedTags.map((id) => tags.find((t) => t.id === id)?.name);
    console.log("Add tags:", { tags: selectedTags, items: selectedItems });
    alert(
      `✅ เพิ่ม tag "${tagNames.join(", ")}" ให้กับ ${selectedItems.length} รายการแล้ว (Mock)`
    );
    setSelectedTags([]);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่ม Tag</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            เลือก tag ที่ต้องการเพิ่มให้กับ {selectedItems.length} รายการ
          </p>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                style={
                  selectedTags.includes(tag.id)
                    ? { backgroundColor: tag.color, borderColor: tag.color }
                    : { borderColor: tag.color, color: tag.color }
                }
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleAdd} disabled={selectedTags.length === 0}>
            เพิ่ม Tag ({selectedTags.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
