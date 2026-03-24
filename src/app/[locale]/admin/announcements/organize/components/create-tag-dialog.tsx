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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateTagDialogProps {
  open: boolean;
  onClose: () => void;
}

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

export function CreateTagDialog({ open, onClose }: CreateTagDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  function handleCreate() {
    console.log("Create tag:", { name, color });
    alert(`✅ สร้าง tag "${name}" แล้ว (Mock)`);
    setName("");
    setColor(TAG_COLORS[0]);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้าง Tag ใหม่</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="tag-name">ชื่อ Tag</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ค่าห้อง, กิจกรรม, ฉุกเฉิน"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>สี</Label>
            <div className="mt-2 grid grid-cols-10 gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
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
            <Label className="mb-2 block text-xs">Preview</Label>
            <div
              className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {name || "Tag name"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            สร้าง Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
