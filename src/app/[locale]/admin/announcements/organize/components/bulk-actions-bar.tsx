"use client";

import { Button } from "@/components/ui/button";
import { FolderInput, Tag, Archive, ArchiveRestore, X, Loader2 } from "lucide-react";

interface BulkActionsBarProps {
  count: number;
  onMove: () => void;
  onTag: () => void;
  onArchive: () => void;
  onClear: () => void;
  isArchiveView?: boolean;
  isLoading?: boolean;
}

export function BulkActionsBar({
  count,
  onMove,
  onTag,
  onArchive,
  onClear,
  isArchiveView,
  isLoading,
}: BulkActionsBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          เลือกแล้ว {count} รายการ
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onMove}>
            <FolderInput className="mr-2 h-4 w-4" />
            ย้ายโฟลเดอร์
          </Button>
          <Button variant="outline" size="sm" onClick={onTag}>
            <Tag className="mr-2 h-4 w-4" />
            เพิ่มแท็ก
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isArchiveView ? (
              <ArchiveRestore className="mr-2 h-4 w-4" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            {isArchiveView ? "กู้คืน" : "เก็บถาวร"}
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
