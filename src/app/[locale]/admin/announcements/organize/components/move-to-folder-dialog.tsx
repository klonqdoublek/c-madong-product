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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [targetFolder, setTargetFolder] = useState<string>("");

  function handleMove() {
    console.log("Move to folder:", { targetFolder, items: selectedItems });
    alert(
      `✅ ย้าย ${selectedItems.length} รายการไป "${folders.find((f) => f.id === targetFolder)?.name}" แล้ว (Mock)`
    );
    setTargetFolder("");
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ย้ายไป Folder</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-muted-foreground">
            เลือก folder ปลายทางสำหรับ {selectedItems.length} รายการ
          </p>

          <RadioGroup value={targetFolder} onValueChange={setTargetFolder}>
            <div className="space-y-2">
              {folders
                .filter((f) => f.id !== "all")
                .map((folder) => (
                  <div key={folder.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={folder.id} id={`folder-${folder.id}`} />
                    <Label
                      htmlFor={`folder-${folder.id}`}
                      className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 font-normal hover:bg-muted"
                    >
                      <span className="text-xl">{folder.icon}</span>
                      <span>{folder.name}</span>
                    </Label>
                  </div>
                ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleMove} disabled={!targetFolder}>
            ย้าย
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
