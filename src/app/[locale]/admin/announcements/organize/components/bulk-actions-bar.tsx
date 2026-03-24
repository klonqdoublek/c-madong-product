"use client";

import { Button } from "@/components/ui/button";
import { FolderInput, Tag, Archive, X } from "lucide-react";

interface BulkActionsBarProps {
  count: number;
  onMove: () => void;
  onTag: () => void;
  onArchive: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  count,
  onMove,
  onTag,
  onArchive,
  onClear,
}: BulkActionsBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          เลือก {count} รายการ
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onMove}>
            <FolderInput className="mr-2 h-4 w-4" />
            ย้าย Folder
          </Button>
          <Button variant="outline" size="sm" onClick={onTag}>
            <Tag className="mr-2 h-4 w-4" />
            เพิ่ม Tag
          </Button>
          <Button variant="outline" size="sm" onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        ยกเลิก
      </Button>
    </div>
  );
}
