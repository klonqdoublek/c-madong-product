"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Folder, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KnowledgeFolder } from "@/hooks/use-knowledge";

interface MoveDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: KnowledgeFolder[];
  documentCount: number;
  onMove: (folderId: string | null) => void;
  isPending: boolean;
}

export function MoveDocumentsDialog({
  open,
  onOpenChange,
  folders,
  documentCount,
  onMove,
  isPending,
}: MoveDocumentsDialogProps) {
  const t = useTranslations("admin.knowledgeBase");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {t("move.title")} ({documentCount})
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[300px] space-y-0.5 overflow-auto py-2">
          {/* Unfiled option */}
          <button
            onClick={() => setSelected(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              selected === null && "bg-accent font-medium"
            )}
          >
            <Folder className="h-4 w-4 text-muted-foreground" />
            {t("move.unfiled")}
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelected(folder.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                selected === folder.id && "bg-accent font-medium"
              )}
              style={{
                paddingLeft: folder.parent_id ? "28px" : undefined,
              }}
            >
              {selected === folder.id ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              {folder.name}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("detail.back")}
          </Button>
          <Button onClick={() => onMove(selected)} disabled={isPending}>
            {isPending ? t("move.moving") : t("bulk.move")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
