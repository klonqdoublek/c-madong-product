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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DynamicLucideIcon } from "@/components/ui/dynamic-lucide-icon";
import { useBulkMove } from "@/hooks/use-announcement-organize";
import type { Folder } from "./announcement-organizer";

interface MoveToFolderDialogProps {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  selectedItems: string[];
  onSuccess: () => void;
}

export function MoveToFolderDialog({
  open,
  onClose,
  folders,
  selectedItems,
  onSuccess,
}: MoveToFolderDialogProps) {
  const t = useTranslations("admin.announcementsPage.organize");
  const [targetFolder, setTargetFolder] = useState<string>("");

  const bulkMove = useBulkMove();

  function handleMove() {
    if (!targetFolder) return;

    const folderId = targetFolder === "__none__" ? null : targetFolder;

    bulkMove.mutate(
      { announcementIds: selectedItems, folderId },
      {
        onSuccess: (data) => {
          toast.success(t("bulk.moveSuccess", { count: data.count }));
          setTargetFolder("");
          onSuccess();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to move announcements");
        },
      }
    );
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setTargetFolder("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("bulk.move")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            {t("bulk.selectFolder")} ({selectedItems.length} รายการ)
          </p>

          <RadioGroup value={targetFolder} onValueChange={setTargetFolder}>
            <div className="space-y-2">
              {/* No Folder option */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="__none__" id="folder-none" />
                <Label
                  htmlFor="folder-none"
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 font-normal hover:bg-muted"
                >
                  <DynamicLucideIcon name="FolderMinus" className="h-5 w-5 text-muted-foreground" size={20} />
                  <span className="text-muted-foreground">{t("folder.noFolder")}</span>
                </Label>
              </div>

              {/* Real folders (skip "all") */}
              {folders
                .filter((f) => f.id !== "all")
                .map((folder) => (
                  <div key={folder.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={folder.id} id={`folder-${folder.id}`} />
                    <Label
                      htmlFor={`folder-${folder.id}`}
                      className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 font-normal hover:bg-muted"
                    >
                      <DynamicLucideIcon
                        name={folder.icon}
                        className="h-5 w-5"
                        size={20}
                        style={{ color: folder.color }}
                      />
                      <span>{folder.name}</span>
                    </Label>
                  </div>
                ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleMove}
            disabled={!targetFolder || bulkMove.isPending}
          >
            {bulkMove.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("bulk.move")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
